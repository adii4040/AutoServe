import mongoose from "mongoose";
import { Vendor } from "../src/Models/Vendor.model.js";

mongoose.connect("mongodb+srv://adiii202004:autoServe04@cluster0.9n2dpre.mongodb.net/autoserve")
    .then(async () => {
        const vendor = await Vendor.create({
            fullname: "Test Vendor 2",
            email: "testvendor2@gmail.com",
            phone: "+919999999998",
            password: "Password123@",
            shopName: "Test Shop 2",
            address: {
                personalAddress: "Test",
                shopAddress: "Test"
            },
            verificationStatus: "APPROVED",
            isOnlineVerified: true,
            isPhysicalVerified: true,
            isVerified: true
        });
        console.log("Created vendor:", vendor._id);
        process.exit(0);
    }).catch(console.error);
