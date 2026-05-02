import { PaymentAudit } from "../Models/PaymentAudit.model.js";
import { logger } from "../Utils/logger.js";
import mongoose from "mongoose";

export const logPaymentEvent = async ({
    bookingId,
    orderId = null,
    paymentId = null,
    paymentType = null,
    eventType,
    status,
    code = null,
    metadata = {},
    source = "api",
    ipAddress = null,
}) => {
    if (!bookingId || !eventType || !status) {
        return;
    }

    try {
        if (mongoose.connection.readyState !== 1) {
            logger.warn("payment_audit_log_skipped_no_db", {
                bookingId: bookingId?.toString?.() || bookingId,
                eventType,
                status,
            });
            return;
        }

        await PaymentAudit.create({
            bookingId,
            orderId,
            paymentId,
            paymentType,
            eventType,
            status,
            code,
            metadata,
            source,
            ipAddress,
        });
    } catch (error) {
        logger.error("payment_audit_log_failed", {
            bookingId: bookingId?.toString?.() || bookingId,
            eventType,
            status,
            error: error?.message || error,
        });
    }
};
