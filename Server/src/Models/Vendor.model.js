import mongoose, { Schema } from "mongoose";
import { ServiceCategoriesEnum } from "../Utils/Constants.js";

const vendorSchema = new Schema({
    // Basic Info
    fullname: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        select: false, // Prevent accidental exposure in queries
    },

    // Shop Details
    shopName: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        personalAddress: {
            type: String,
            required: true,
            trim: true,
        },
        shopAddress: {
            type: String,
            required: true,
            trim: true,
        },
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0],
        },
    },

    // Verification Documents
    documents: {
        panCard: { url: String, localpath: String },
        aadhaarCard: { url: String, localpath: String },
        businessProof: { url: String, localpath: String, type: String } // e.g. "GST", "MSME"
    },

    // Verification Status
    verificationStatus: {
        type: String,
        enum: ["PENDING", "ONLINE_VERIFIED", "PHYSICAL_VERIFIED", "APPROVED", "REJECTED"],
        default: "PENDING",
    },
    isOnlineVerified: { type: Boolean, default: false },
    isPhysicalVerified: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    remark: { type: String, default: "" },

    // Media
    avatar: {
        url: String,
        localPath: String,
    },

    //Service Details
    serviceCategories: [
        {
            type: String,
            enum: ServiceCategoriesEnum,
        }
    ],
    availablityStatus: {
        type: String,
        enum: ["AVAILABLE", "UNAVAILABLE"],
        default: "AVAILABLE",
    },

    activeBookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        default: null
    },
    // Tokens
    refreshToken: String,
    forgotPasswordToken: String,
    forgotPasswordTokenExpiry: Date,
    emailVerificationToken: String,
    emailVerificationTokenExpiry: Date,


}, {
    timestamps: true,
});

// Geo index for location-based search
vendorSchema.index({ location: "2dsphere" });

export const Vendor = mongoose.model("Vendor", vendorSchema);
