import { Vendor } from "../Models/Vendor.model.js";
import fs from 'fs';
import { verifyDocs } from "../Utils/OCRDocVerfication.utils.js";
import { asyncHandler } from "../Utils/AsyncHandler.utils.js";
import { ApiError } from "../Utils/ApiError.utils.js";
import { ApiResponse } from "../Utils/ApiResponse.utils.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.utils.js";
import { sendMail, VendorApprovalRejectionMailGen } from '../Utils/mail.utils.js'

const registerVendor = asyncHandler(async (req, res) => {
    //Get all the details from the vendor
    const { fullname, email, phone, shopName, personalAddress, shopAddress } = req.body

    const existingVendor = await Vendor.findOne({ $or: [{ email }, { phone }] })
    if (existingVendor) throw new ApiError(400, "Vendor already exists!")
    //Check if the documents are submited 
    if (!req.files?.panCard || !req.files?.aadharCard) {
        throw new ApiError(404, "Required files are missing.")
    }
    console.log(req.body)
    const files = req.files;
    console.log(req.files)

    const PANLocalPath = files.panCard[0].path;
    const AadharLocalPath = files.aadharCard[0].path;

    //Perform OCR

    // console.log("PAN", PANLocalPath, "Aadhar", AadharLocalPath)
    const { verified, matchedFields, confidenceScore } = await verifyDocs(PANLocalPath, fullname)  //AadharLocalPath personalAddress

    console.log(verified)

    //Check if the online verification is successfull or not
    if (!verified) {
        fs.unlinkSync(PANLocalPath)
        //fs.unlinkSync(AadharLocalPath)
        throw new ApiError(400, {
            message: "Please ensure that the documents are valid and match the provided information.",
            matchedFields,
            confidenceScore
        })

    }


    //On successfull verification, upload the documents on cloudinary
    const panCloudinary = await uploadOnCloudinary(PANLocalPath)
    const aadharCloudinary = await uploadOnCloudinary(AadharLocalPath)


    const vendor = await Vendor.create({
        fullname,
        email,
        phone,
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

    const mailOptions = {
        from: "autoserve@gmail.com",
        to: vendor.email,
        subject: "Autoserve Onboarding Status",
        mailgenContent: VendorApprovalRejectionMailGen(
            vendor.fullname,
            status
        )
    }
    sendMail(mailOptions)

    // Handle physical verification result
    if (status === "APPROVED") {
        vendor.isPhysicalVerified = true;
        vendor.isVerified = true;
        vendor.verificationStatus = "APPROVED";
        vendor.remark = remark || "";
        await vendor.save();
    } else if (status === "REJECTED") {
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



export {
    registerVendor,
    getAllUnVerifiedVendorsData,
    physicalVerification,
    getSingleVendor
}