import express from "express";
import verifyJWT  from "../middlewares/auth.middleware.js";
import { validationSource, validate } from "../middlewares/validate.middleware.js";

import {
    createBooking,
    acceptBooking,
    submitDiagnosis,
    approveServices,
    cancelBooking,
} from "../Controllers/bookings.controller.js";

import {
    bookingCreationValidation,
    submitDiagnosisValidation,
    approveServicesValidation,
    completeServiceValidation,
    cancelBookingValidation,
} from "../Validators/Bookings.validator.js";

const router = express.Router();


router.route('/').post(verifyJWT, validate(bookingCreationValidation, validationSource.BODY), createBooking)
router.patch("/:id/accept", verifyJWT, acceptBooking);
router.post("/:id/diagnosis", verifyJWT, validate(submitDiagnosisValidation, validationSource.BODY), submitDiagnosis);
router.post("/:id/approve-services", verifyJWT, validate(approveServicesValidation, validationSource.BODY), approveServices);
router.post("/:id/approve-services", verifyJWT, validate(approveServicesValidation, validationSource.BODY), approveServices);
// router.post("/:id/complete", verifyJWT, completeService);
router.post("/:id/cancel", verifyJWT, validate(cancelBookingValidation, validationSource.BODY), cancelBooking);


export default router