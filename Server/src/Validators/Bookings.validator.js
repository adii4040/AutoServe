import * as z from "zod";
import validator from "validator";
import { ServiceCategoriesEnum } from '../Utils/Constants.js'

const sanitizeString = (value) => validator.escape(value.trim());

const bookingCreationValidation = z.object({
    serviceCategory: z
        .array(
            z.enum(ServiceCategoriesEnum, {
                errorMap: () => ({ message: "Invalid service category" }),
            })
        )
        .min(1, "Service category is required"),

    problemDescription: z.string().trim().min(0).max(500).optional(),

    vehicleType: z.string().trim().min(1, "Vehicle type is required"),
    brand: z.string().trim().min(1, "Vehicle brand is required"),
    model: z.string().trim().min(1, "Vehicle model is required"),

    coordinates: z
        .tuple([
            z.number().min(-180).max(180),
            z.number().min(-90).max(90)
        ])
        .refine((coords) => coords.length === 2, { message: "Coordinates must be an array of two numbers [longitude, latitude]" }),

    formattedAddress: z.string().trim().min(1, "Formatted address is required").transform(sanitizeString),
    landmark: z.string().trim().optional().transform((v) => (v ? sanitizeString(v) : v)),
    city: z.string().trim().min(1, "City is required").transform(sanitizeString),
    state: z.string().trim().min(1, "State is required").transform(sanitizeString),
    pincode: z.string().trim().min(1, "Pincode is required").transform(sanitizeString)
});

const submitDiagnosisValidation = z.object({
    issues: z.array(z.string().trim().min(3).transform(sanitizeString)).min(1),
    inspectionFeeFinal: z.number().positive("Inspection fee must be a positive number"),

    services: z.array(
        z.union([
            z.object({
                serviceId: z.string().regex(/^[0-9a-fA-F]{24}$/),
                quotedPrice: z.number().positive(),
            }),
            z.object({
                customServiceName: z.string().trim().min(3),
                quotedPrice: z.number().positive(),
            }),
        ])
    ).min(1),
});

const approveServicesValidation = z.object({
    approvedIndexes: z.array(z.number().int().min(0)),
    rejectedIndexes: z.array(z.number().int().min(0)),
});

const cancelBookingValidation = z.object({
    by: z.enum(["USER", "VENDOR", "SYSTEM"]).optional(),
    reason: z.string().trim().min(5),
});

const updateLiveLocationValidation = z.object({
    coordinates: z.tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90),
    ]).optional(),
    lng: z.number().min(-180).max(180).optional(),
    lat: z.number().min(-90).max(90).optional(),
    source: z.enum(["GPS", "NETWORK", "MANUAL"]).optional(),
}).transform((data) => {
    if (Array.isArray(data.coordinates)) return data;
    if (typeof data.lng === 'number' && typeof data.lat === 'number') {
        return { ...data, coordinates: [data.lng, data.lat] };
    }

    return data;
}).refine((data) => Array.isArray(data.coordinates) && data.coordinates.length === 2, {
    message: 'coordinates or lat/lng is required',
    path: ['coordinates'],
});

const completeServiceValidation = z.object({
    inspectionAmount: z.number().min(0).optional(),
    serviceAmount: z.number().min(0).optional(),
    paymentMode: z.enum(["UPI", "CASH", "CREDIT_CARD", "DEBIT_CARD", "NET_BANKING", "WALLET"]).optional(),
});



export {
    bookingCreationValidation,
    submitDiagnosisValidation,
    approveServicesValidation,
    completeServiceValidation,
    cancelBookingValidation,
    updateLiveLocationValidation,
}