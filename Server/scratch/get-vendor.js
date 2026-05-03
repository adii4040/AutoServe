import mongoose from "mongoose";
import { Vendor } from "../src/Models/Vendor.model.js";

mongoose.connect("mongodb+srv://adiii202004:autoServe04@cluster0.9n2dpre.mongodb.net/autoserve")
    .then(async () => {
        const vendor = await Vendor.findOne().select("+password");
        console.log(vendor);
        process.exit(0);
    });
