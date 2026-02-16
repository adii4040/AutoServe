import * as z from "zod";


export const emailValidation = z
    .email({ message: "Invalid Email" })
    .trim()

export const indianPhoneRegex = z.string().regex(
    /^(\+91[\-\s]?|91[\-\s]?|0)?[6-9]\d{9}$/,
    { message: "Invalid  mobile number" }
)

const registerVendorValidation = z.object({
    fullname: z
        .string()
        .trim()
        .min(1, "Fullname can't be empty"),
    email: emailValidation,
    phone: indianPhoneRegex,
    shopName: z.string().trim().min(1, "Shop name is missing"),
    personalAddress: z.string().trim().min(1, "Personal Address is missing"),
    shopAddress: z.string().trim().min(1, "Shop Address is missing"),

})

const physicalVerificationValidation = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  remark: z.string().trim().optional(),
}).refine(
  (data) => data.status !== "REJECTED" || (data.remark && data.remark.length > 0),
  {
    message: "Remark is required when status is REJECTED",
    path: ["remark"],
  }
);




const loginVendorValidation = z.object({
    email: emailValidation,
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(12, { message: "Password can not be more than 12 digits" })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/,
            { message: "Password must include uppercase, lowercase, number, and special character" }
        )
        .trim(),

})

const resetPasswordValidation = z.object({
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(12, { message: "Password can not be more than 12 digits" })
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,12}$/,
            { message: "Password must include uppercase, lowercase, number, and special character" }
        )
        .trim(),
    confirmPassword: z
        .string()

}).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Confirm password does not match"
})

const updateVendorValidation = z.object({
    fullname: z
        .string()
        .trim()
        .min(1, "Fullname can't be empty")
        .optional()
        .or(z.literal("")),

    email: z
        .email("Invalid email format")
        .optional()
        .or(z.literal("")),
    address: z.string().trim(),

})


export {
    registerVendorValidation,
    physicalVerificationValidation
}