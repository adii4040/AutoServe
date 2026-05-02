import { getAgenda } from "./agenda.js";
import { WebhookQueue } from "../Models/WebhookQueue.model.js";
import { processWebhookEvent } from "../Services/webhook.service.js";
import { logger } from "../Utils/logger.js";

const MAX_RETRIES = 5;

export const registerWebhookRetryJob = () => {
    const agenda = getAgenda();

    agenda.define("retry-payment-webhook", async () => {
        const now = new Date();

        const queuedEvents = await WebhookQueue.find({
            status: "PENDING",
            retryCount: { $lt: MAX_RETRIES },
            nextRetryAt: { $lte: now },
        })
            .sort({ nextRetryAt: 1 })
            .limit(50);

        for (const queuedEvent of queuedEvents) {
            try {
                queuedEvent.status = "PROCESSING";
                queuedEvent.lastProcessedAt = new Date();
                await queuedEvent.save();

                await processWebhookEvent({
                    payload: queuedEvent.payload,
                    rawBody: queuedEvent.rawBody,
                    signature: queuedEvent.signature,
                    source: "retry-job",
                });

                queuedEvent.status = "SUCCESS";
                queuedEvent.lastError = null;
                await queuedEvent.save();
            } catch (error) {
                queuedEvent.retryCount += 1;
                queuedEvent.lastError = error?.message || "Webhook retry failed";

                if (queuedEvent.retryCount >= MAX_RETRIES) {
                    queuedEvent.status = "FAILED";
                } else {
                    const backoffSeconds = Math.pow(2, queuedEvent.retryCount) * 60;
                    queuedEvent.nextRetryAt = new Date(Date.now() + backoffSeconds * 1000);
                    queuedEvent.status = "PENDING";
                }

                await queuedEvent.save();

                logger.error("payment_webhook_retry_failed", {
                    eventId: queuedEvent.eventId,
                    retryCount: queuedEvent.retryCount,
                    status: queuedEvent.status,
                    error: error?.message || error,
                });
            }
        }
    });
};
