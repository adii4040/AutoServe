import mongoose from "mongoose";
import dotenv from "dotenv";
import { Booking } from "./src/Models/Booking.model.js";
import { Vendor } from "./src/Models/Vendor.model.js";

dotenv.config();

async function checkState() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB.");

  const vendors = await Vendor.find({}, "_id fullname shopName isVerified serviceCategories location activeBookingIds");
  console.log("=== VENDORS ===");
  console.log(JSON.stringify(vendors, null, 2));

  const bookings = await Booking.find({});
  console.log("=== ALL BOOKINGS ===");
  console.log(JSON.stringify(bookings.map(b => ({
    _id: b._id,
    state: b.bookingState,
    vendorId: b.vendorId,
    dispatchMeta: b.dispatchMeta,
    requestedServiceCategories: b.requestedServiceCategories,
  })), null, 2));

  mongoose.disconnect();
}

checkState().catch(console.error);
