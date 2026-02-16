import mongoose, { Schema } from "mongoose";

const vendorBehaviourSchema = new Schema({
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
        unique: true
    },

    /* -------- REQUEST FLOW -------- */

    total_requests_received: {
        type: Number,
        default: 0
    },

    total_requests_accepted: {
        type: Number,
        default: 0
    },

    total_requests_rejected: {
        type: Number,
        default: 0
    },

    total_requests_no_show: {
        type: Number,
        default: 0
    },

    total_requests_cancelled_by_user: {
        type: Number,
        default: 0
    },

    /* -------- SERVICE HISTORY -------- */

    total_services_completed: {
        type: Number,
        default: 0
    },

    monthly_services_completed: {
        type: Number,
        default: 0
    },

    /* -------- RATINGS (RAW FACTS) -------- */

    rating_sum: {
        type: Number, // sum of all ratings received
        default: 0
    },

    rating_count: {
        type: Number, // number of ratings received
        default: 0
    }

}, { timestamps: true });



export const VendorBehaviour = mongoose.model("VendorBehaviour", vendorBehaviourSchema);
