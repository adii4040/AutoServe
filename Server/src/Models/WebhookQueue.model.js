import mongoose, { Schema } from "mongoose";

const webhookQueueSchema = new Schema(
    {
        eventId: {
            type: String,
            required: true,
            index: true,
            unique: true,
        },
        orderId: {
            type: String,
            default: null,
            index: true,
        },
        paymentId: {
            type: String,
            default: null,
            index: true,
        },
        payload: {
            type: Schema.Types.Mixed,
            required: true,
        },
        rawBody: {
            type: String,
            required: true,
        },
        signature: {
            type: String,
            required: true,
        },
        retryCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        nextRetryAt: {
            type: Date,
            required: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "PROCESSING", "SUCCESS", "FAILED"],
            default: "PENDING",
            index: true,
        },
        lastError: {
            type: String,
            default: null,
        },
        lastProcessedAt: {
            type: Date,
            default: null,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            index: { expires: 0 },
        },
    },
    { timestamps: true }
);

webhookQueueSchema.index({ status: 1, nextRetryAt: 1 });

export const WebhookQueue = mongoose.model("WebhookQueue", webhookQueueSchema);
