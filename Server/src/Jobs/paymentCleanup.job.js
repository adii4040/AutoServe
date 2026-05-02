import { getAgenda } from "./agenda.js";
import { Booking } from "../Models/Booking.model.js";
import { logger } from "../Utils/logger.js";
import { logPaymentEvent } from "../Services/auditLog.service.js";

const STALE_HOURS = 6;

export const registerPaymentCleanupJob = () => {
    const agenda = getAgenda();

    agenda.define("mark-stale-payments-failed", async () => {
        const staleThreshold = new Date(Date.now() - STALE_HOURS * 60 * 60 * 1000);

        const staleBookings = await Booking.find({
            "payment.status": "CREATED",
            updatedAt: { $lt: staleThreshold },
        }).limit(200);

        for (const booking of staleBookings) {
            booking.payment.status = "FAILED";
            booking.payment.failureCode = "PAYMENT_TIMEOUT";
            booking.payment.failureReason = "Payment window expired";
            await booking.save();

            await logPaymentEvent({
                bookingId: booking._id,
                orderId: booking.payment.orderId,
                paymentId: booking.payment.paymentId,
                paymentType: booking.payment.paymentType,
                eventType: "PAYMENT_TIMEOUT_MARKED",
                status: "FAILED",
                code: "PAYMENT_TIMEOUT",
                metadata: { staleHours: STALE_HOURS },
                source: "retry-job",
            });
        }

        if (staleBookings.length > 0) {
            logger.info("stale_payments_marked_failed", { count: staleBookings.length });
        }
    });
};
