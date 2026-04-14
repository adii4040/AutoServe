
import { getVendorBookingDetailController } from '../Controllers/vendor.controller.js';

import { Router } from 'express';
import { updateVendorBookingState } from '../Controllers/vendorBookingState.controller.js';

import {
    registerVendor,
    getAllUnVerifiedVendorsData,
    physicalVerification,
    getSingleVendor,
    loginVendor,
    logoutVendor,
    getCurrentVendor,
    activateVendorAccount,
    updateAvailabilityStatus,
} from '../Controllers/vendor.controller.js'

import { z } from 'zod';




const router = Router();

// GET: Vendor fetches details of a specific booking
router.get('/booking/:bookingId', verifyVendorJWT, getVendorBookingDetailController);

// PATCH: Vendor updates booking state (controlled transitions)
router.patch('/booking/:bookingId/state', verifyVendorJWT, updateVendorBookingState);

// PATCH endpoint for vendor to update their availability status
router.route('/availability').patch(
    verifyVendorJWT,
    async (req, res, next) => {
        // Inline validation for status
        const schema = z.object({
            availablityStatus: z.enum(["AVAILABLE", "UNAVAILABLE"]),
        });
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (err) {
            return res.status(400).json({ message: err.errors?.[0]?.message || "Invalid input" });
        }
    },
    updateAvailabilityStatus
);

//Middleware
import { vendorUpload } from '../Middlewares/multer.config/vendor.multer.middleware.js'
import { validate, validateObjectId, validationSource } from '../Middlewares/validate.middleware.js'
import verifyVendorJWT from '../Middlewares/authVendor.middleware.js'
//Validator
import {
    registerVendorValidation,
    physicalVerificationValidation,
    loginVendorValidation,
    activateVendorAccountValidation,
} from '../Validators/Vendor.validator.js'




router.route('/register').post(vendorUpload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    // { name: "avatar", maxCount: 1 }
]), validate(registerVendorValidation, validationSource.BODY), registerVendor)

router.route('/login').post(validate(loginVendorValidation, validationSource.BODY), loginVendor)
router.route('/activate-account').post(validate(activateVendorAccountValidation, validationSource.BODY), activateVendorAccount)
router.route('/logout').post(verifyVendorJWT, logoutVendor)
router.route('/@me').get(verifyVendorJWT, getCurrentVendor)

router.route('/get-unverified-vendors').get(getAllUnVerifiedVendorsData)

router.route('/:vendorId/physical-verification').post(validate(physicalVerificationValidation, validationSource.BODY), validateObjectId('vendorId'), physicalVerification)

router.route('/:vendorId/@me').get(validateObjectId('vendorId'), getSingleVendor)

router.route('/:vendorId').get(validateObjectId('vendorId'), getSingleVendor)


export default router