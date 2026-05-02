import mongoose from "mongoose";
import dotenv from "dotenv";
import { Vendor } from "./src/Models/Vendor.model.js";

dotenv.config();

async function patchVendor() {
  await mongoose.connect(process.env.MONGODB_URL);
  
  // Patch all verified vendors that have NO serviceCategories
  const result = await Vendor.updateMany(
    { serviceCategories: { $size: 0 } },
    { $set: { serviceCategories: ["Mechanical Service", "Battery Service"] } }
  );
  
  console.log(`Updated ${result.modifiedCount} vendors to have default service categories.`);
  mongoose.disconnect();
}

patchVendor().catch(console.error);
