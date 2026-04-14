import express from "express";

import verifyJWT from "../Middlewares/auth.middleware.js";
import verifyVendorJWT from "../Middlewares/authVendor.middleware.js";
import { validationSource, validate, validateObjectId } from "../Middlewares/validate.middleware.js";

import {
    createBooking,
    getMyBookings,
    getBookingDetail,
    acceptBooking,
    markVendorEnRoute,
    updateLiveLocation,
    markVendorArrived,
    submitDiagnosis,
    approveServices,
    completeService,
    cancelBooking,
    getLiveTracking,
    getVendorMyBookings,
    getVendorRequestedBookings,
    getVendorBookingDetail,
    findNearbyVendors,
    rejectBooking,
} from "../Controllers/bookings.controller.js";

import {
    bookingCreationValidation,
    submitDiagnosisValidation,
    approveServicesValidation,
    completeServiceValidation,
    cancelBookingValidation,
    updateLiveLocationValidation,
} from "../Validators/Bookings.validator.js";

const router = express.Router();

// User booking APIs
router.get("/nearby-vendors", verifyJWT, findNearbyVendors);
router.post("/", verifyJWT, validate(bookingCreationValidation, validationSource.BODY), createBooking);
router.get("/my-bookings", verifyJWT, getMyBookings);
router.get("/:id", verifyJWT, validateObjectId("id"), getBookingDetail);
router.post(
    "/:id/approve-services",
    verifyJWT,
    validateObjectId("id"),
    validate(approveServicesValidation, validationSource.BODY),
    approveServices
);
router.post(
    "/:id/cancel",
    verifyJWT,
    validateObjectId("id"),
    cancelBooking
);
router.get("/:id/live-tracking", verifyJWT, validateObjectId("id"), getLiveTracking);

// Vendor booking APIs
router.get("/vendor/my-bookings", verifyVendorJWT, getVendorMyBookings);
router.get("/vendor/requested-bookings", verifyVendorJWT, getVendorRequestedBookings);
router.get("/vendor/:id", verifyVendorJWT, validateObjectId("id"), getVendorBookingDetail);
router.patch("/:id/accept", verifyVendorJWT, validateObjectId("id"), acceptBooking);
router.patch("/:id/reject", verifyVendorJWT, validateObjectId("id"), rejectBooking);
router.patch("/:id/en-route", verifyVendorJWT, validateObjectId("id"), markVendorEnRoute);
router.patch(
    "/:id/live-location",
    verifyVendorJWT,
    validateObjectId("id"),
    validate(updateLiveLocationValidation, validationSource.BODY),
    updateLiveLocation
);
router.patch("/:id/arrived", verifyVendorJWT, validateObjectId("id"), markVendorArrived);
router.post(
    "/:id/diagnosis",
    verifyVendorJWT,
    validateObjectId("id"),
    validate(submitDiagnosisValidation, validationSource.BODY),
    submitDiagnosis
);
router.post(
    "/:id/complete",
    verifyVendorJWT,
    validateObjectId("id"),
    validate(completeServiceValidation, validationSource.BODY),
    completeService
);
router.post(
    "/:id/vendor-cancel",
    verifyVendorJWT,
    validateObjectId("id"),
    validate(cancelBookingValidation, validationSource.BODY),
    cancelBooking
);

export default router;
