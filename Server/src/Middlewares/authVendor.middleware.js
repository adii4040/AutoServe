import jwt from "jsonwebtoken";
import { asyncHandler, ApiError } from "../Utils/index.js";
import { Vendor } from "../Models/Vendor.model.js";

const verifyVendorJWT = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies?.vendorAccessToken || req.headers?.authorization?.split(" ")[1];
        if (!accessToken) throw new ApiError(401, "Unauthorized request: no vendor token provided");

        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
        if (decoded.role !== "VENDOR") throw new ApiError(401, "Invalid vendor token");

        const vendor = await Vendor.findById(decoded._id).select("-password -refreshToken");
        if (!vendor) throw new ApiError(401, "Invalid vendor token");

        req.vendor = vendor;
        next();
    } catch (error) {
        next(new ApiError(401, "Please login as vendor first."));
    }
});

export default verifyVendorJWT;
