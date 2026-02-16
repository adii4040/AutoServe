import mongoose, { Schema } from "mongoose";

const vendorAnalyticsSchema = new Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        index: true,
    },

    // Time bucket (MANDATORY)
    year: {
        type: Number,
        required: true,
        index: true,
    },
    month: {
        type: Number, // 1–12
        required: true,
        index: true,
    },

    // Work outcomes
    servicesCompleted: {
        type: Number,
        default: 0,
    },

    // Revenue outcomes
    inspectionRevenue: {
        type: Number,
        default: 0,
    },
    serviceRevenue: {
        type: Number,
        default: 0,
    },
    totalRevenue: {
        type: Number,
        default: 0,
    },

    // Customer perception (aggregated only)
    ratingSum: {
        type: Number,
        default: 0,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },

}, {
    timestamps: true,
});

// One analytics document per vendor per month
vendorAnalyticsSchema.index(
    { vendorId: 1, year: 1, month: 1 },
    { unique: true }
);

export const VendorAnalytics = mongoose.model("VendorAnalytics", vendorAnalyticsSchema);
