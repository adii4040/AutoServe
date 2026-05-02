import crypto from "crypto";

import { Booking } from "../Models/Booking.model.js";
import { ApiError } from "../Utils/ApiError.utils.js";
import { logger } from "../Utils/logger.js";
import { logPaymentEvent } from "./auditLog.service.js";
import * as notificationService from "./notification.service.js";

const PAYMENT_MODE_MAP = {
    card: "CREDIT_CARD",
    debit_card: "DEBIT_CARD",
    netbanking: "NET_BANKING",
    wallet: "WALLET",
    upi: "UPI",
};

const getMode = (method) => PAYMENT_MODE_MAP[String(method || "").toLowerCase()] || undefined;

export const verifyWebhookSignature = (payload, signature) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        throw new ApiError(503, "Payment provider webhook secret is not configured");
    }

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

    return expectedSignature === signature;
};

export const processWebhookEvent = async ({ payload, rawBody, signature, source = "webhook" }) => {
    if (!signature || !verifyWebhookSignature(rawBody || "", signature)) {
        throw new ApiError(400, "Invalid webhook signature", [{ code: "SIGNATURE_MISMATCH" }]);
    }

    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id || null;

    if (!event || !orderId) {
        return { success: true, ignored: true, reason: "MISSING_EVENT_OR_ORDER" };
    }

    const eventId = `${event}:${paymentId || orderId}`;
    const booking = await Booking.findOne({ "payment.orderId": orderId });

    if (!booking) {
        logger.warn("payment_webhook_booking_not_found", { event, orderId, paymentId });
        return { success: true, ignored: true, reason: "BOOKING_NOT_FOUND" };
    }

    if (booking.payment.lastWebhookEventId === eventId) {
        await logPaymentEvent({
            bookingId: booking._id,
            orderId,
            paymentId,
            paymentType: booking.payment.paymentType,
            eventType: "WEBHOOK_DUPLICATE",
            status: booking.payment.status,
            code: "DUPLICATE_WEBHOOK",
            metadata: { event, eventId },
            source,
        });

        return { success: true, ignored: true, reason: "DUPLICATE_WEBHOOK", bookingId: booking._id };
    }

    const paymentType = booking.payment.paymentType || payload?.meta?.paymentTypeHint || null;
    const amountInRupees = (paymentEntity?.amount || 0) / 100;
    const paymentMode = getMode(paymentEntity?.method);

    if (event === "payment.captured") {
        booking.payment.paymentId = paymentId;
        booking.payment.status = "PAID";
        booking.payment.paidAt = new Date();
        booking.payment.webhookProcessed = true;
        booking.payment.lastWebhookAt = new Date();
        booking.payment.lastWebhookEventId = eventId;
        booking.payment.failureCode = null;
        booking.payment.failureReason = null;

        if (paymentType === "inspection") {
            booking.payments.inspection.status = "PAID";
            booking.payments.inspection.paidAt = new Date();
            booking.payments.inspection.amount = amountInRupees || booking.payments.inspection.amount;
            if (paymentMode) booking.payments.inspection.mode = paymentMode;
        }

        if (paymentType === "service") {
            booking.payments.service.status = "PAID";
            booking.payments.service.paidAt = new Date();
            booking.payments.service.amount = amountInRupees || booking.payments.service.amount;
            if (paymentMode) booking.payments.service.mode = paymentMode;
        }

        await booking.save();

        if (booking.vendorId) {
            await notificationService.notifyVendor?.(booking.vendorId.toString(), "PAYMENT_RECEIVED", {
                bookingId: booking._id.toString(),
                paymentId,
                amount: amountInRupees,
                paymentType,
            });
        }

        if (paymentType === "inspection" && booking.userId) {
            await notificationService.notifyUser?.(booking.userId.toString(), "INSPECTION_PAYMENT_RECEIVED", {
                bookingId: booking._id.toString(),
                paymentId,
                amount: amountInRupees,
            });
        }

        await logPaymentEvent({
            bookingId: booking._id,
            orderId,
            paymentId,
            paymentType,
            eventType: "WEBHOOK_CAPTURED",
            status: "PAID",
            metadata: { event, eventId, mode: paymentMode, amount: amountInRupees },
            source,
        });

        return { success: true, bookingId: booking._id, eventId, paymentType };
    }

    if (event === "payment.failed") {
        const reason = paymentEntity?.error_description || paymentEntity?.error_reason || "Payment failed";

        booking.payment.paymentId = paymentId || booking.payment.paymentId;
        booking.payment.status = "FAILED";
        booking.payment.webhookProcessed = true;
        booking.payment.lastWebhookAt = new Date();
        booking.payment.lastWebhookEventId = eventId;
        booking.payment.failureCode = "PAYMENT_FAILED";
        booking.payment.failureReason = reason;

        await booking.save();

        await logPaymentEvent({
            bookingId: booking._id,
            orderId,
            paymentId,
            paymentType,
            eventType: "WEBHOOK_FAILED",
            status: "FAILED",
            code: "PAYMENT_FAILED",
            metadata: { event, eventId, reason },
            source,
        });

        return { success: true, bookingId: booking._id, eventId, paymentType };
    }

    await logPaymentEvent({
        bookingId: booking._id,
        orderId,
        paymentId,
        paymentType,
        eventType: "WEBHOOK_IGNORED",
        status: booking.payment.status,
        metadata: { event, eventId },
        source,
    });

    return { success: true, ignored: true, reason: "EVENT_NOT_HANDLED", bookingId: booking._id };
};
