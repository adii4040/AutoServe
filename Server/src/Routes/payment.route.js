import { Router } from "express";

import verifyJWT from "../Middlewares/auth.middleware.js";
import { validate, validationSource } from "../Middlewares/validate.middleware.js";
import { createOrder, paymentWebhook, verifyPayment } from "../Controllers/payment.controller.js";
import { createOrderValidation, verifyPaymentValidation } from "../Validators/Payment.validator.js";

const router = Router();

router.post("/create-order", verifyJWT, validate(createOrderValidation, validationSource.BODY), createOrder);
router.post("/verify", verifyJWT, validate(verifyPaymentValidation, validationSource.BODY), verifyPayment);
router.post("/webhook", paymentWebhook);

export default router;
