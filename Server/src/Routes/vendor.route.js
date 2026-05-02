
import { Router } from 'express';
import { z } from 'zod';

// Controllers
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
    getVendorBookingDetailController,
} from '../Controllers/vendor.controller.js'
import { updateVendorBookingState } from '../Controllers/vendorBookingState.controller.js'

// Middlewares
import { vendorUpload } from '../Middlewares/multer.config/vendor.multer.middleware.js'
import { validate, validateObjectId, validationSource } from '../Middlewares/validate.middleware.js'
import verifyVendorJWT from '../Middlewares/authVendor.middleware.js'

// Validators
import {
    registerVendorValidation,
    physicalVerificationValidation,
    loginVendorValidation,
    activateVendorAccountValidation,
} from '../Validators/Vendor.validator.js'


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

router.route('/register').post(vendorUpload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
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