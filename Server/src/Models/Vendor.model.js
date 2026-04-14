import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
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

    activeBookingIds: {
        type: [Schema.Types.ObjectId],
        ref: "Booking",
        default: [],
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

vendorSchema.pre("save", async function (next) {
    if (!this.password || !this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

vendorSchema.methods.isPasswordCorrect = async function (password) {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
};

vendorSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            role: "VENDOR",
            email: this.email,
            shopName: this.shopName,
            isVerified: this.isVerified,
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: "15m",
        }
    );
};

vendorSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            role: "VENDOR",
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn: "7d",
        }
    );
};

export const Vendor = mongoose.model("Vendor", vendorSchema);
