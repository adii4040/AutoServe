import { Router } from "express";

import verifyJWT from "../Middlewares/auth.middleware.js";
import { validate, validationSource } from "../Middlewares/validate.middleware.js";
import { createOrder, paymentWebhook, verifyPayment, getPaymentStatus } from "../Controllers/payment.controller.js";
import {
	createOrderValidation,
	verifyPaymentValidation,
	paymentStatusParamsValidation,
	paymentStatusQueryValidation,
} from "../Validators/Payment.validator.js";

const router = Router();

router.post("/create-order", verifyJWT, validate(createOrderValidation, validationSource.BODY), createOrder);
router.post("/verify", verifyJWT, validate(verifyPaymentValidation, validationSource.BODY), verifyPayment);
router.get(
	"/status/:bookingId",
	verifyJWT,
	validate(paymentStatusParamsValidation, validationSource.PARAMS),
	validate(paymentStatusQueryValidation, validationSource.QUERY),
	getPaymentStatus
);
router.post("/webhook", paymentWebhook);

export default router;
