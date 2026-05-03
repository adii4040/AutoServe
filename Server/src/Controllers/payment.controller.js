import crypto from "crypto";
import Razorpay from "razorpay";

import { Booking } from "../Models/Booking.model.js";
import { WebhookQueue } from "../Models/WebhookQueue.model.js";
import { ApiError } from "../Utils/ApiError.utils.js";
import { ApiResponse } from "../Utils/ApiResponse.utils.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { withRetry } from "../Services/retry.service.js";
import * as notificationService from "../Services/notification.service.js";
import { logger } from "../Utils/logger.js";
import { logPaymentEvent } from "../Services/auditLog.service.js";
import { processWebhookEvent } from "../Services/webhook.service.js";

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

const PAYMENT_MODE_MAP = {
    card: "CREDIT_CARD",
    debit_card: "DEBIT_CARD",
    netbanking: "NET_BANKING",
    wallet: "WALLET",
    upi: "UPI",
};

const getMode = (method) => PAYMENT_MODE_MAP[String(method || "").toLowerCase()] || undefined;

const getClientIp = (req) => req.headers["x-forwarded-for"]?.split(",")?.[0]?.trim() || req.ip || null;

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
        let total = finalServices.reduce((sum, svc) => sum + (Number(svc.finalPrice) || 0), 0);
        
        // If inspection is unpaid, include it in the service payment to settle the full balance for user convenience
        if (booking.payments?.inspection?.status !== "PAID") {
            const inspectionFee = booking.inspection?.inspectionFeeFinal || 0;
            total += inspectionFee;
        }

        if (total <= 0) {
            throw new ApiError(400, "No approved services or inspection fees found for payment");
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
        const allowedStates = ["WAITING_FOR_USER_APPROVAL", "SERVICE_IN_PROGRESS", "COMPLETED"];
        if (!allowedStates.includes(booking.bookingState)) {
            throw new ApiError(400, "Inspection payment can only be initiated after diagnosis is submitted");
        }
    }

    if (paymentType === "service") {
        if (booking.bookingState !== "COMPLETED") {
            throw new ApiError(400, "Service payment can only be initiated after service is completed");
        }
    }

    const existingOrderCanReuse =
        booking.payment?.status === "CREATED" &&
        booking.payment?.orderId &&
        booking.payment?.paymentType === paymentType;

    if (existingOrderCanReuse) {
        await logPaymentEvent({
            bookingId: booking._id,
            orderId: booking.payment.orderId,
            paymentType,
            eventType: "ORDER_REUSED",
            status: "CREATED",
            code: "IDEMPOTENT_REUSE",
            metadata: { idempotencyKey: booking.payment.idempotencyKey },
            source: "api",
            ipAddress: getClientIp(req),
        });

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    order: {
                        id: booking.payment.orderId,
                        amount: Math.round((booking.payment.amount || 0) * 100),
                        currency: "INR",
                        receipt: `${paymentType}_${booking._id.toString()}`.slice(0, 40),
                        status: "created",
                    },
                    paymentType,
                    idempotencyKey: booking.payment.idempotencyKey,
                },
                "Existing order reused"
            )
        );
    }

    const approvedAmount = computeApprovedAmount(booking, paymentType);
    const idempotencyKey = crypto.randomUUID();

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
    booking.payment.paymentType = paymentType;
    booking.payment.idempotencyKey = idempotencyKey;
    booking.payment.webhookProcessed = false;
    booking.payment.lastWebhookAt = null;
    booking.payment.lastWebhookEventId = null;
    booking.payment.failureCode = null;
    booking.payment.failureReason = null;
    await booking.save();

    await logPaymentEvent({
        bookingId: booking._id,
        orderId: order.id,
        paymentType,
        eventType: "ORDER_CREATED",
        status: "CREATED",
        metadata: { amount: approvedAmount, idempotencyKey },
        source: "api",
        ipAddress: getClientIp(req),
    });

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
                idempotencyKey,
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

    if (booking.payment?.status === "PAID") {
        return res.status(200).json(
            new ApiResponse(
                200,
                { bookingId: booking._id, paymentId: booking.payment.paymentId, status: "PAID" },
                "Payment already verified"
            )
        );
    }

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
        booking.payment.status = "FAILED";
        booking.payment.failureCode = "SIGNATURE_MISMATCH";
        booking.payment.failureReason = "Invalid payment signature";
        await booking.save();

        await logPaymentEvent({
            bookingId: booking._id,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            paymentType,
            eventType: "VERIFY_FAILED",
            status: "FAILED",
            code: "SIGNATURE_MISMATCH",
            metadata: { reason: "Invalid payment signature" },
            source: "api",
            ipAddress: getClientIp(req),
        });

        throw new ApiError(400, "Invalid payment signature");
    }

    let paymentMode;
    try {
        const payment = await withRetry(() => razorpay.payments.fetch(razorpay_payment_id));
        paymentMode = getMode(payment?.method);
    } catch (error) {
        logger.warn("payment_method_fetch_failed", {
            bookingId: booking._id.toString(),
            paymentId: razorpay_payment_id,
            error: error?.message || error,
        });
    }

    booking.payment.orderId = razorpay_order_id;
    booking.payment.paymentId = razorpay_payment_id;
    booking.payment.signature = razorpay_signature;
    booking.payment.status = "PAID";
    booking.payment.paymentType = paymentType;
    booking.payment.webhookProcessed = false;
    booking.payment.failureCode = null;
    booking.payment.failureReason = null;
    booking.payment.paidAt = new Date();

    if (paymentType === "inspection") {
        booking.payments.inspection.status = "PAID";
        booking.payments.inspection.paidAt = new Date();
        booking.payments.inspection.amount = booking.payment.amount;
        if (paymentMode) booking.payments.inspection.mode = paymentMode;
    } else if (paymentType === "service") {
        booking.payments.service.status = "PAID";
        booking.payments.service.paidAt = new Date();
        
        const inspectionFee = booking.inspection?.inspectionFeeFinal || 0;
        const totalPaid = booking.payment.amount;
        
        // If this was a combined payment (inspection was unpaid at order time)
        // calculate service-only amount for clean reporting
        if (booking.payments.inspection.status !== "PAID" && totalPaid > inspectionFee) {
            booking.payments.service.amount = totalPaid - inspectionFee;
            
            // Mark inspection as paid separately with its own portion
            booking.payments.inspection.status = "PAID";
            booking.payments.inspection.paidAt = new Date();
            booking.payments.inspection.amount = inspectionFee;
            if (paymentMode) booking.payments.inspection.mode = paymentMode;
        } else {
            booking.payments.service.amount = totalPaid;
        }
        
        if (paymentMode) booking.payments.service.mode = paymentMode;
    }

    await booking.save();

    await logPaymentEvent({
        bookingId: booking._id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        paymentType,
        eventType: "VERIFY_SUCCESS",
        status: "PAID",
        metadata: { mode: paymentMode },
        source: "api",
        ipAddress: getClientIp(req),
    });

    if (booking.vendorId) {
        // Update vendor stats
        await Vendor.findByIdAndUpdate(booking.vendorId, {
            $inc: { 
                totalRevenue: booking.payment.amount,
                completedBookingsCount: paymentType === "service" ? 1 : 0 
            }
        });

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

const paymentWebhook = asyncHandler(async (req, res) => {
    const signature = req.headers["x-razorpay-signature"];
    const rawBody = req.rawBody || "";

    try {
        const event = req.body?.event;
        const orderId = req.body?.payload?.payment?.entity?.order_id;

        if (event === "payment.captured" && orderId) {
            try {
                const razorpay = getRazorpayClient();
                const razorpayOrder = await razorpay.orders.fetch(orderId);

                req.body.meta = {
                    ...(req.body.meta || {}),
                    paymentTypeHint: razorpayOrder?.notes?.paymentType,
                };
            } catch (fetchError) {
                logger.warn("webhook_order_fetch_failed", {
                    orderId,
                    error: fetchError?.message || fetchError,
                });
            }
        }

        const result = await processWebhookEvent({
            payload: req.body,
            rawBody,
            signature,
            source: "webhook",
        });

        return res.status(200).json({ success: true, ...result });
    } catch (error) {
        const event = req.body?.event;
        const paymentEntity = req.body?.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id || null;
        const paymentId = paymentEntity?.id || null;
        const eventId = `${event || "unknown"}:${paymentId || orderId || crypto.randomUUID()}`;

        await WebhookQueue.updateOne(
            { eventId },
            {
                $setOnInsert: {
                    eventId,
                    orderId,
                    paymentId,
                    payload: req.body,
                    rawBody,
                    signature: signature || "",
                    retryCount: 0,
                    nextRetryAt: new Date(Date.now() + 60 * 1000),
                    status: "PENDING",
                },
                $set: {
                    lastError: error?.message || "Webhook processing failed",
                },
            },
            { upsert: true }
        );

        logger.error("payment_webhook_queued", {
            orderId,
            paymentId,
            event,
            error: error?.message || error,
        });

        return res.status(202).json({
            success: true,
            queued: true,
            message: "Webhook queued for retry",
        });
    }
});

const getPaymentStatus = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { paymentType } = req.query;

    if (!["inspection", "service"].includes(paymentType)) {
        throw new ApiError(400, "paymentType must be 'inspection' or 'service'");
    }

    const booking = await Booking.findOne({
        _id: bookingId,
        userId: req.user._id,
    });

    if (!booking) {
        throw new ApiError(404, "Booking not found");
    }

    const branch = paymentType === "inspection" ? booking.payments.inspection : booking.payments.service;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                bookingId: booking._id,
                paymentType,
                status: branch?.status || "UNPAID",
                amount: branch?.amount || 0,
                mode: branch?.mode || null,
                paidAt: branch?.paidAt || null,
                orderId: booking.payment?.orderId || null,
                paymentId: booking.payment?.paymentId || null,
                failureCode: booking.payment?.failureCode || null,
                failureReason: booking.payment?.failureReason || null,
                webhookProcessed: booking.payment?.webhookProcessed || false,
                lastWebhookAt: booking.payment?.lastWebhookAt || null,
            },
            "Payment status fetched"
        )
    );
});

export { createOrder, verifyPayment, paymentWebhook, getPaymentStatus };
