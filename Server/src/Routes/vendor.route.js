import { Router } from 'express'

import { registerVendor, getAllUnVerifiedVendorsData, physicalVerification, getSingleVendor } from '../Controllers/vendor.controller.js'

//Middleware
import { vendorUpload } from '../Middlewares/multer.config/vendor.multer.middleware.js'
import { validate, validateObjectId, validationSource } from '../Middlewares/validate.middleware.js'
//Validator
import { registerVendorValidation, physicalVerificationValidation } from '../Validators/Vendor.validator.js'

const router = Router()


router.route()

router.route('/register').post(vendorUpload.fields([
    { name: "panCard", maxCount: 1 },
    { name: "aadharCard", maxCount: 1 },
    // { name: "avatar", maxCount: 1 }
]), validate(registerVendorValidation, validationSource.BODY), registerVendor)

router.route('/get-unverified-vendors').get(getAllUnVerifiedVendorsData)

router.route('/:vendorId/physical-verification').post(validate(physicalVerificationValidation, validationSource.BODY), validateObjectId('vendorId'), physicalVerification)

router.route('/:vendorId/@me').get(getSingleVendor)

router.route('/:vendorId').get(validateObjectId('vendorId'), getSingleVendor)


export default router