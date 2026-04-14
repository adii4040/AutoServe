import crypto from "crypto";
import Razorpay from "razorpay";

import { Booking } from "../Models/Booking.model.js";
import { ApiError } from "../Utils/ApiError.utils.js";
import { ApiResponse } from "../Utils/ApiResponse.utils.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { withRetry } from "../Services/retry.service.js";
import * as notificationService from "../Services/notification.service.js";
import { logger } from "../Utils/logger.js";

let razorpayClient = null;

const getRazorpayClient = () => {
    if (razorpayClient) return razorpayClient;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new ApiError(503, "Payment provider is not configured");
    }

    razorpayClient = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });

    return razorpayClient;
};

const computeApprovedAmount = (booking, paymentType) => {
    if (paymentType === "inspection") {
        const amount = booking.inspection?.inspectionFeeFinal;
        if (!amount || amount <= 0) {
            throw new ApiError(400, "Inspection fee has not been set by the vendor yet");
        }
        return amount;
    }

    if (paymentType === "service") {
        const finalServices = booking.serviceExecution?.finalServices || [];
        const total = finalServices.reduce((sum, svc) => sum + (Number(svc.finalPrice) || 0), 0);
        if (total <= 0) {
            throw new ApiError(400, "No approved services found for payment");
        }
        return total;
    }

    throw new ApiError(400, "paymentType must be 'inspection' or 'service'");
};

const createOrder = asyncHandler(async (req, res) => {
    const razorpay = getRazorpayClient();

    const { bookingId, paymentType } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
    if (!booking) throw new ApiError(404, "Booking not found");

    if (paymentType === "inspection" && booking.payments.inspection.status === "PAID") {
        throw new ApiError(400, "Inspection fee has already been paid");
    }
    if (paymentType === "service" && booking.payments.service.status === "PAID") {
        throw new ApiError(400, "Service fee has already been paid");
    }

    if (paymentType === "inspection") {
        if (booking.bookingState !== "WAITING_FOR_USER_APPROVAL") {
            throw new ApiError(400, "Inspection payment can only be initiated after diagnosis is submitted");
        }
    }

    if (paymentType === "service") {
        if (booking.bookingState !== "COMPLETED") {
            throw new ApiError(400, "Service payment can only be initiated after service is completed");
        }
    }

    const approvedAmount = computeApprovedAmount(booking, paymentType);

    const options = {
        amount: Math.round(approvedAmount * 100),
        currency: "INR",
        receipt: `${paymentType}_${booking._id.toString()}`.slice(0, 40),
        notes: {
            bookingId: booking._id.toString(),
            paymentType,
        },
    };

    const order = await withRetry(() => razorpay.orders.create(options));

    booking.payment.orderId = order.id;
    booking.payment.amount = approvedAmount;
    booking.payment.status = "CREATED";
    await booking.save();

    logger.info("Razorpay order created", { bookingId, paymentType, orderId: order.id });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                order: {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    receipt: order.receipt,
                    status: order.status,
                },
                paymentType,
            },
            "Order created successfully"
        )
    );
});

const verifyPayment = asyncHandler(async (req, res) => {
    const razorpay = getRazorpayClient();

    const {
        bookingId,
        paymentType,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    } = req.body;

    if (!bookingId || !paymentType || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "Missing payment verification fields");
    }

    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });
    if (!booking) throw new ApiError(404, "Booking not found");

    const verifiedBySdk = razorpay.webhooks?.verifyPaymentSignature
        ? razorpay.webhooks.verifyPaymentSignature({
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
        })
        : null;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    const isValidSignature = typeof verifiedBySdk === "boolean" ? verifiedBySdk : expectedSignature === razorpay_signature;

    if (!isValidSignature) {
        throw new ApiError(400, "Invalid payment signature");
    }

    booking.payment.orderId = razorpay_order_id;
    booking.payment.paymentId = razorpay_payment_id;
    booking.payment.signature = razorpay_signature;
    booking.payment.status = "PAID";
    booking.payment.paidAt = new Date();

    if (paymentType === "inspection") {
        booking.payments.inspection.status = "PAID";
        booking.payments.inspection.paidAt = new Date();
        booking.payments.inspection.amount = booking.payment.amount;
    } else if (paymentType === "service") {
        booking.payments.service.status = "PAID";
        booking.payments.service.paidAt = new Date();
        booking.payments.service.amount = booking.payment.amount;
    }

    await booking.save();

    if (booking.vendorId) {
        await notificationService.notifyVendor?.(booking.vendorId.toString(), "PAYMENT_RECEIVED", {
            bookingId: booking._id.toString(),
            paymentId: razorpay_payment_id,
            amount: booking.payment.amount,
            paymentType,
        });
    }

    if (paymentType === "inspection" && booking.userId) {
        await notificationService.notifyUser?.(booking.userId.toString(), "INSPECTION_PAYMENT_RECEIVED", {
            bookingId: booking._id.toString(),
            paymentId: razorpay_payment_id,
            amount: booking.payment.amount,
        });
    }

    return res.status(200).json(new ApiResponse(200, { bookingId: booking._id }, "Payment verified successfully"));
});

const verifyWebhookSignature = (payload, signature) => {
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");

    return expectedSignature === signature;
};

const paymentWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody || "";

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
        throw new ApiError(400, "Invalid webhook signature");
    }

    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;

    if (!orderId) {
        return res.status(200).json({ success: true, message: "No order linked, ignored" });
    }

    const booking = await Booking.findOne({ "payment.orderId": orderId });
    if (!booking) {
        logger.warn("Webhook booking not found", { orderId, event });
        return res.status(200).json({ success: true, message: "Order not mapped" });
    }

    if (event === "payment.captured") {
        const razorpay = getRazorpayClient();
        const razorpayOrder = await razorpay.orders.fetch(orderId);
        const paymentType = razorpayOrder?.notes?.paymentType;
        const amountInRupees = (paymentEntity.amount || 0) / 100;

        booking.payment.paymentId = paymentEntity.id;
        booking.payment.status = "PAID";
        booking.payment.paidAt = new Date();

        if (paymentType === "inspection") {
            booking.payments.inspection.status = "PAID";
            booking.payments.inspection.paidAt = new Date();
            booking.payments.inspection.amount = amountInRupees;
        } else if (paymentType === "service") {
            booking.payments.service.status = "PAID";
            booking.payments.service.paidAt = new Date();
            booking.payments.service.amount = amountInRupees;
        } else {
            logger.warn("Webhook: unknown paymentType in order notes", { orderId, paymentType });
        }

        await booking.save();

        if (booking.vendorId) {
            await notificationService.notifyVendor?.(booking.vendorId.toString(), "PAYMENT_RECEIVED", {
                bookingId: booking._id.toString(),
                paymentId: paymentEntity.id,
                amount: amountInRupees,
                paymentType,
            });
        }

        if (paymentType === "inspection" && booking.userId) {
            await notificationService.notifyUser?.(booking.userId.toString(), "INSPECTION_PAYMENT_RECEIVED", {
                bookingId: booking._id.toString(),
                paymentId: paymentEntity.id,
                amount: amountInRupees,
            });
        }
    }

    if (event === "payment.failed") {
        booking.payment.paymentId = paymentEntity?.id || booking.payment.paymentId;
        booking.payment.status = "FAILED";
        await booking.save();
    }

    return res.status(200).json({ success: true });
});

export { createOrder, verifyPayment, paymentWebhook };
