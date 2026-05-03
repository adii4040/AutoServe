import mongoose from "mongoose";
import { Booking } from "../src/Models/Booking.model.js";

mongoose.connect("mongodb+srv://adiii202004:autoServe04@cluster0.9n2dpre.mongodb.net/autoserve")
    .then(async () => {
        const booking = await Booking.findOne({ bookingState: 'COMPLETED' }).sort({ createdAt: -1 });
        if (booking) {
            console.log("Found booking:", booking._id);
            
            // Add a mock service to the service execution finalServices
            booking.serviceExecution = {
                ...booking.serviceExecution,
                finalServices: [
                    {
                        serviceName: "Full Engine Service",
                        finalPrice: 1500
                    }
                ],
                completedAt: new Date()
            };
            
            // Also update the diagnosis to show it in the UI
            if (!booking.diagnosis) {
                 booking.diagnosis = {};
            }
            booking.diagnosis.suggestedServices = [
                {
                    serviceName: "Full Engine Service",
                    quotedPrice: 1500,
                    isApproved: true
                }
            ];

            await booking.save();
            console.log("Booking updated with a service cost of ₹1500!");
        } else {
            console.log("No completed bookings found.");
        }
        process.exit(0);
    }).catch(console.error);
