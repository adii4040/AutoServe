import mongoose, { Schema } from "mongoose";
import { ServiceCategoriesEnum } from "../Utils/Constants.js";

const serviceSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    category: {
        type: String,
        enum: ServiceCategoriesEnum,
        required: true,
        index: true,
    },

    description: {
        type: String,
        trim: true,
    },

    isSystemService: {
        type: Boolean,
        default: true,
    },

    createdByVendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        default: null,
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    frequentlyUsedCount: {
        type: Number,
        default: 0,
    },

}, { timestamps: true });


export const Service = mongoose.model("Service", serviceSchema);
