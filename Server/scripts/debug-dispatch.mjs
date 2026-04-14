import dotenv from "dotenv";
import mongoose from "mongoose";

import { Booking } from "../src/Models/Booking.model.js";
import { Vendor } from "../src/Models/Vendor.model.js";

dotenv.config();

const bookingId = process.argv[2];
if (!bookingId) {
  console.error("Usage: node scripts/debug-dispatch.mjs <bookingId>");
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGODB_URL);

const booking = await Booking.findById(bookingId).lean();
console.log("bookingState:", booking?.bookingState);
console.log("dispatchMeta:", JSON.stringify(booking?.dispatchMeta, null, 2));
console.log("lastStateHistory:", booking?.stateHistory?.slice(-4));

const vendors = await Vendor.find({
  isVerified: true,
  availablityStatus: "AVAILABLE",
  activeBookingId: null,
  serviceCategories: { $in: ["Mechanical Service"] },
})
  .select("_id email phone serviceCategories location")
  .limit(20)
  .lean();

console.log("eligibleVendorCount:", vendors.length);
console.log(vendors);

await mongoose.connection.close();
