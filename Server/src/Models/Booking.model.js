import mongoose, { Schema } from "mongoose";
import { BookingStateEnum, ServiceCategoriesEnum, PaymentModeEnum, PaymentStatusEnum } from "../Utils/Constants.js";


const bookingSchema = new Schema({
    /* -------- OWNERSHIP -------- */

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Vendor",
        default: null, // Assigned later
    },

    /* -------- SERVICE INTENT -------- */

    requestedServiceCategories: {
        type: [String],
        enum: ServiceCategoriesEnum,
        required: true,
    },

    problemDescription: {
        type: String,
        trim: true,
    },

    vehicleInfo: {
        vehicleType: String,
        brand: String,
        model: String,
    },

    /* -------- LOCATION -------- */

    serviceLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },

        coordinates: {
            type: [Number], // [lng, lat]
            required: true,
        },

        serviceAddress: {
            formattedAddress: String,
            landmark: String,
            city: String,
            state: String,
            pincode: String
        }
    },

    dispatchRadiusKm: {
        type: Number,
        default: 5,
    },

    /* -------- STATE MACHINE -------- */

    bookingState: {
        type: String,
        enum: BookingStateEnum,
        default: "CREATED",
        index: true,
    },

    

    dispatchMeta: {
        currentBatchIndex: {
            type: Number,
            default: 0
        },
        vendorBatches: [
            {
                type: [mongoose.Schema.Types.ObjectId],
                ref: "Vendor"
            }
        ],
        lastDispatchAt: Date
    },

    stateHistory: [
        {
            state: {
                type: String,
                enum: BookingStateEnum,
                required: true,
            },
            changedBy: {
                type: String,
                enum: ["USER", "VENDOR", "SYSTEM"],
                required: true,
            },
            reason: String,
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],

    /* -------- INSPECTION -------- */

    inspection: {
        startedAt: Date,
        completedAt: Date,

        inspectionFeeFinal: {
            type: Number,
            min: 0,
        },

        inspectionNotes: String,
    },

    /* -------- DIAGNOSIS -------- */

    diagnosis: {
        issues: [String],

        suggestedServices: [
            {
                serviceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Service",
                    default: null
                },
                customServiceName: {
                    type: String,
                    trim: true
                },
                vendorQuotedPrice: Number
            }

        ],
    },

    /* -------- USER APPROVAL -------- */

    userApproval: {
        approvedIndexes: [Number],
        rejectedIndexes: [Number],
        decisionAt: Date,
    },

    /* -------- SERVICE EXECUTION -------- */

    serviceExecution: {
        startedAt: Date,
        completedAt: Date,

        finalServices: [
            {
                serviceId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Service",
                    required: true,
                },

                customServiceName: {
                    type: String,
                    trim: true
                },

                finalPrice: {
                    type: Number,
                    min: 0,
                    required: true,
                },
            },
        ],
    },

    /* -------- PAYMENTS -------- */

    payments: {
        inspection: {
            amount: {
                type: Number,
                min: 0,
            },
            status: {
                type: String,
                enum: PaymentStatusEnum,
                default: "UNPAID",
            },
            mode: {
                type: String,
                enum: PaymentModeEnum,
            },
            paidAt: Date,
        },

        service: {
            amount: {
                type: Number,
                min: 0,
            },
            status: {
                type: String,
                enum: PaymentStatusEnum,
                default: "UNPAID",
            },
            mode: {
                type: String,
                enum: PaymentModeEnum,
            },
            paidAt: Date,
        },
    },

    /* -------- CANCELLATION -------- */

    cancellation: {
        cancelledBy: {
            type: String,
            enum: ["USER", "VENDOR", "SYSTEM"],
        },
        reason: String,
        penaltyApplied: {
            type: Boolean,
            default: false,
        },
        cancelledAt: Date,
    },
}, { timestamps: true });

bookingSchema.index({ serviceLocation: "2dsphere" });

export const Booking = mongoose.model("Booking", bookingSchema);
