import mongoose, { Schema } from "mongoose";

const paymentAuditSchema = new Schema(
    {
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true,
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
        paymentType: {
            type: String,
            enum: ["inspection", "service"],
            default: null,
        },
        eventType: {
            type: String,
            required: true,
            index: true,
        },
        status: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            default: null,
        },
        metadata: {
            type: Schema.Types.Mixed,
            default: {},
        },
        source: {
            type: String,
            enum: ["api", "webhook", "retry-job"],
            default: "api",
        },
        ipAddress: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

paymentAuditSchema.index({ bookingId: 1, createdAt: -1 });

export const PaymentAudit = mongoose.model("PaymentAudit", paymentAuditSchema);
