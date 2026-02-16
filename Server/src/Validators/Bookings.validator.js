import * as z from "zod";
import { ServiceCategoriesEnum } from '../Utils/Constants.js'

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

    formattedAddress: z.string().trim().min(1, "Formatted address is required"),
    landmark: z.string().trim().optional(),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().min(1, "State is required"),
    pincode: z.string().trim().min(1, "Pincode is required")
});

const submitDiagnosisValidation = z.object({
    issues: z.array(z.string().trim().min(3)).min(1),

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

const completeServiceValidation = z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});

const cancelBookingValidation = z.object({
    by: z.enum(["USER", "VENDOR", "SYSTEM"]),
    reason: z.string().trim().min(5),
});



export {
    bookingCreationValidation,
    submitDiagnosisValidation,
    approveServicesValidation,
    completeServiceValidation,
    cancelBookingValidation
}