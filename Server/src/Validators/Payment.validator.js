import * as z from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const createOrderValidation = z.object({
    bookingId: z.string().regex(objectIdRegex, "Invalid bookingId"),
    paymentType: z.enum(["inspection", "service"], {
        errorMap: () => ({ message: "paymentType must be 'inspection' or 'service'" }),
    }),
});

const verifyPaymentValidation = z.object({
    bookingId: z.string().regex(objectIdRegex, "Invalid bookingId"),
    paymentType: z.enum(["inspection", "service"], {
        errorMap: () => ({ message: "paymentType must be 'inspection' or 'service'" }),
    }),
    razorpay_order_id: z.string().trim().min(1),
    razorpay_payment_id: z.string().trim().min(1),
    razorpay_signature: z.string().trim().min(1),
});

const paymentStatusParamsValidation = z.object({
    bookingId: z.string().regex(objectIdRegex, "Invalid bookingId"),
});

const paymentStatusQueryValidation = z.object({
    paymentType: z.enum(["inspection", "service"], {
        errorMap: () => ({ message: "paymentType must be 'inspection' or 'service'" }),
    }),
});

export {
    createOrderValidation,
    verifyPaymentValidation,
    paymentStatusParamsValidation,
    paymentStatusQueryValidation,
};
