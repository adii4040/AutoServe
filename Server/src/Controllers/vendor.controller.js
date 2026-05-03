import { Vendor } from "../Models/Vendor.model.js";
import fs from 'fs';
import { verifyDocs } from "../Utils/OCRDocVerfication.utils.js";
import { asyncHandler } from "../Utils/AsyncHandler.utils.js";
import { ApiError } from "../Utils/ApiError.utils.js";
import { ApiResponse } from "../Utils/ApiResponse.utils.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.utils.js";
import { sendMail, VendorApprovalRejectionMailGen, VendorOnboardingPendingMailGen, VendorApprovedLoginMailGen } from '../Utils/mail.utils.js'
import { cookieOption } from "../Utils/Constants.js";
import { logger } from "../Utils/logger.js";
import { getVendorBookingDetail } from "../Services/booking.service.js";

const generateVendorRefreshAndAccessToken = async (vendorId) => {
    const vendor = await Vendor.findById(vendorId).select("+password");
    if (!vendor) throw new ApiError(404, "Vendor not found");

    const accessToken = vendor.generateAccessToken();
    const refreshToken = vendor.generateRefreshToken();

    vendor.refreshToken = refreshToken;
    await vendor.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const geocodeAddress = async (addressText) => {
    try {
        if (!addressText) return null

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 5000)

        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(addressText)}`, {
            headers: {
                "User-Agent": "AutoServe/1.0",
            },
            signal: controller.signal,
        })
        clearTimeout(timeout)

        if (!res.ok) return null
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) return null

        const first = data[0]
        const lat = Number(first.lat)
        const lon = Number(first.lon)
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null

        return [lon, lat]
    } catch {
        return null
    }
}

const registerVendor = asyncHandler(async (req, res) => {
    //Get all the details from the vendor
    const { fullname, email, phone, shopName, personalAddress, shopAddress, latitude, longitude } = req.body

    const normalizedEmail = String(email || "").trim().toLowerCase()
    const normalizedPhone = String(phone || "").trim()

    const [existingByEmail, existingByPhone] = await Promise.all([
        Vendor.findOne({ email: normalizedEmail }).select("_id email"),
        Vendor.findOne({ phone: normalizedPhone }).select("_id phone"),
    ])

    if (existingByEmail && existingByPhone) {
        throw new ApiError(409, "Vendor already exists with this email and phone")
    }

    if (existingByEmail) {
        throw new ApiError(409, "Vendor already exists with this email")
    }

    if (existingByPhone) {
        throw new ApiError(409, "Vendor already exists with this phone number")
    }
    //Check if the documents are submited 
    if (!req.files?.panCard || !req.files?.aadharCard) {
        throw new ApiError(404, "Required files are missing.")
    }
    logger.info("registerVendor payload received", { email, phone, shopName })
    const files = req.files;
    logger.info("registerVendor files received", { fileKeys: Object.keys(files || {}) })

    const PANLocalPath = files.panCard[0].path;
    const AadharLocalPath = files.aadharCard[0].path;

    const cleanupTempFiles = () => {
        if (PANLocalPath && fs.existsSync(PANLocalPath)) fs.unlinkSync(PANLocalPath)
        if (AadharLocalPath && fs.existsSync(AadharLocalPath)) fs.unlinkSync(AadharLocalPath)
    }

    //Perform OCR — verify full name matches PAN card and/or Aadhar card
    const { verified, matchedFields, confidenceScore, error } = await verifyDocs(PANLocalPath, AadharLocalPath, fullname)
    logger.info("registerVendor OCR verification result", { verified, confidenceScore })

    if (error) {
        cleanupTempFiles()
        throw new ApiError(400, error)
    }

    //Check if the online verification is successfull or not
    if (!verified) {
        cleanupTempFiles()
        throw new ApiError(
            400,
            `Your full name "${fullname}" could not be verified in the uploaded documents. Please ensure your PAN card or Aadhar card clearly shows your full name and upload a clearer image.`,
            [{ matchedFields, confidenceScore }]
        )
    }


    //On successfull verification, upload the documents on cloudinary
    const panCloudinary = await uploadOnCloudinary(PANLocalPath)
    const aadharCloudinary = await uploadOnCloudinary(AadharLocalPath)


    const parsedLat = Number(latitude)
    const parsedLon = Number(longitude)
    const hasCoordinates = Number.isFinite(parsedLat) && Number.isFinite(parsedLon)
    const geocodedCoordinates = hasCoordinates ? null : await geocodeAddress(shopAddress || personalAddress)
    const coordinates = hasCoordinates ? [parsedLon, parsedLat] : (geocodedCoordinates || [0, 0])

    const vendor = await Vendor.create({
        fullname,
        email: normalizedEmail,
        phone: normalizedPhone,
        avatar: {
            url: "https://png.pngtree.com/element_our/20200610/ourmid/pngtree-character-default-avatar-image_2237203.jpg",
            localpath: ""
        },
        password: null,
        shopName,
        address: {
            personalAddress,
            shopAddress
        },
        location: {
            type: "Point",
            coordinates,
        },
        documents: {
            panCard: {
                url: panCloudinary?.secure_url,
                localpath: PANLocalPath
            },
            aadhaarCard: {
                url: aadharCloudinary?.secure_url,
                localpath: AadharLocalPath
            },
        },
        verificationStatus: "ONLINE_VERIFIED",
        isOnlineVerified: true,
        isPhysicalVerified: false,
        isVerified: false
    })

    const onboardingBaseUrl = process.env.VENDOR_ONBOARDING_BASE_URL || "http://localhost:5174/vendor-onboarding"
    const onboardingUrl = `${onboardingBaseUrl}/${vendor._id.toString()}`

    await sendMail({
        from: "autoserve@gmail.com",
        to: vendor.email,
        subject: "AutoServe vendor onboarding started",
        mailgenContent: VendorOnboardingPendingMailGen(vendor.fullname, onboardingUrl),
    })


    //Extract the required fields only to return as response
    const vendorDetails = await Vendor.findById(vendor?._id).select("-location -documents -avatar -rating -totalBookings -offersMobileService")

    res.json(
        new ApiResponse(
            201,
            { vendor: vendorDetails },
            "Online verification successfull. Physical Verification is pending."
        )
    )
})


const getAllUnVerifiedVendorsData = asyncHandler(async (req, res) => {
    //Find the list of all the vendors who are verified online but physical verification is yet to complete.

    

    const vendors = await Vendor.find({
        isVerified: false,
        isOnlineVerified: true,
        isPhysicalVerified: false
    }).select("-location  -rating -totalBookings -offersMobileService")



    //Give error if no unverified vendor is  there
    if (!vendors.length) throw new ApiError(404, "No Vendor Found.")

    return res.json(
        new ApiResponse(
            200,
            { vendors },
            "All unverified vendors fetched successfully."
        )
    )
})


// This will be carried out by the employee, for this he need a dashboard which will show the data of all the vendors, this data will come from the getAllUnVerifiedVendorsData.
const physicalVerification = asyncHandler(async (req, res) => {

    //After the online verification, vendor's data will be stored in the db with verificationStatus: "ONLINE_VERIFIED", isOnlineVerified: true, isPhysicalVerified: false, isVerified: false 
    //Employee will have a dashboard which will show the list of all unverified vendors, coming from getAllUnVerifiedVendorsData API, on clicking each vendor, their single vendor page will be open which will have all the info of the respective vendor. 
    //Get the id from the params and find the vendor based on the id and check if isOnlineVerfied: true or not, is no, then return error - Online Verification is pending 
    //If online verification is done, then move to physical verification, the employee will go and check the workshop in person and it will verify the physical verification. 
    ///This part will be carried out from the backend, no need of vendor.
    //There it will either Approve or Reject the vendor and give the remark
    const { vendorId } = req.params;
    const { status, remark } = req.body;

    // Find vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) throw new ApiError(404, "Vendor not found.");

    // Check online verification
    if (!vendor.isOnlineVerified) {
        throw new ApiError(400, "Online verification is pending.");
    }

    const vendorLoginUrl = process.env.VENDOR_LOGIN_URL || "http://localhost:5174/vendor-login"

    // Handle physical verification result
    if (status === "APPROVED") {
        vendor.isPhysicalVerified = true;
        vendor.isVerified = true;
        vendor.verificationStatus = "APPROVED";
        vendor.remark = remark || "";
        await vendor.save();

        await sendMail({
            from: "autoserve@gmail.com",
            to: vendor.email,
            subject: "AutoServe onboarding approved",
            mailgenContent: VendorApprovedLoginMailGen(vendor.fullname, vendorLoginUrl),
        })
    } else if (status === "REJECTED") {
        await sendMail({
            from: "autoserve@gmail.com",
            to: vendor.email,
            subject: "Autoserve Onboarding Status",
            mailgenContent: VendorApprovalRejectionMailGen(vendor.fullname, status),
        })

        // If the status is rejected then there is no point of keeping the vendor's data in the DB so just delete it.
        await Vendor.findByIdAndDelete(vendorId);
        return res.json(
            new ApiResponse(
                200,
                { remark },
                "Vendor rejected and removed successfully."
            )
        );
    }

    // 5. Respond success
    return res.json(
        new ApiResponse(200, vendor, "Physical verification updated successfully.")
    );
});



const getSingleVendor = asyncHandler(async (req, res) => {
    const {vendorId} = req.params

    const vendor = await Vendor.findById(vendorId)
    if(!vendor) throw new ApiError(404, "No vendor found!")

    return res.json(
        new ApiResponse(
            200,
            {vendor},
            "Vendor data fetched successfully"
        )
    )
})

const loginVendor = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const vendor = await Vendor.findOne({ email }).select("+password");
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (!vendor.password) {
        throw new ApiError(403, "Vendor account is not activated yet. Contact support.");
    }

    const isPasswordCorrect = await vendor.isPasswordCorrect(password);
    if (!isPasswordCorrect) throw new ApiError(401, "Invalid email or password");

    const { accessToken, refreshToken } = await generateVendorRefreshAndAccessToken(vendor._id);

    const safeVendor = await Vendor.findById(vendor._id).select("-password -refreshToken");

    return res
        .status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .cookie("vendorAccessToken", accessToken, cookieOption)
        .cookie("vendorRefreshToken", refreshToken, cookieOption)
        .json(new ApiResponse(200, { vendor: safeVendor }, "Vendor logged in successfully"));
});

const logoutVendor = asyncHandler(async (req, res) => {
    const vendor = req.vendor;
    if (!vendor) throw new ApiError(401, "Unauthorized request");

    vendor.refreshToken = null;
    await vendor.save({ validateBeforeSave: false });

    return res
        .status(200)
        .clearCookie("accessToken", cookieOption)
        .clearCookie("refreshToken", cookieOption)
        .clearCookie("vendorAccessToken", cookieOption)
        .clearCookie("vendorRefreshToken", cookieOption)
        .json(new ApiResponse(200, {}, "Vendor logged out successfully"));
});

const getCurrentVendor = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, { vendor: req.vendor }, "Current vendor fetched successfully"));
});

const activateVendorAccount = asyncHandler(async (req, res) => {
    const { email, phone, password } = req.body;

    const vendor = await Vendor.findOne({ email, phone });
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (!vendor.isVerified) {
        throw new ApiError(403, "Vendor is not approved yet. Complete verification first.");
    }

    vendor.password = password;
    await vendor.save();

    return res.status(200).json(new ApiResponse(200, {}, "Vendor account activated successfully"));
});



// GET /api/v1/vendor/booking/:bookingId
export const getVendorBookingDetailController = asyncHandler(async (req, res) => {
    const booking = await getVendorBookingDetail(req.vendor._id, req.params.bookingId);
    return res.status(200).json(new ApiResponse(200, { booking }, "Booking fetched successfully"));
});

// PATCH /api/v1/vendor/availability
export const updateAvailabilityStatus = asyncHandler(async (req, res) => {
    const vendorId = req.vendor._id;
    const { availablityStatus } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { $set: { availablityStatus } },
        { new: true, select: "availablityStatus" }
    );
    if (!vendor) throw new ApiError(404, "Vendor not found");

    return res.status(200).json(
        new ApiResponse(200, { availablityStatus: vendor.availablityStatus }, "Availability status updated successfully.")
    );
});

const updateVendorProfile = asyncHandler(async (req, res) => {
    const { fullname, shopName, phone, personalAddress, shopAddress, serviceCategories } = req.body;

    const vendor = await Vendor.findById(req.vendor._id);
    if (!vendor) throw new ApiError(404, "Vendor not found");

    if (fullname) vendor.fullname = fullname;
    if (shopName) vendor.shopName = shopName;
    if (phone) vendor.phone = phone;

    if (personalAddress || shopAddress) {
        vendor.address = {
            personalAddress: personalAddress || vendor.address.personalAddress,
            shopAddress: shopAddress || vendor.address.shopAddress,
        };
    }

    if (serviceCategories) {
        vendor.serviceCategories = serviceCategories;
    }

    await vendor.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { vendor },
            "Profile updated successfully"
        )
    );
});

export {
    registerVendor,
    getAllUnVerifiedVendorsData,
    physicalVerification,
    getSingleVendor,
    loginVendor,
    logoutVendor,
    getCurrentVendor,
    activateVendorAccount,
    updateVendorProfile,
};