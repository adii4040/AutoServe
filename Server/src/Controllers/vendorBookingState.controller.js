import { Booking } from "../Models/Booking.model.js";
import { ApiError } from "../Utils/ApiError.utils.js";
import { asyncHandler } from "../Utils/AsyncHandler.utils.js";
import { BookingStateEnum } from "../Utils/Constants.js";

// Allowed vendor transitions
const allowedVendorTransitions = {
    VENDOR_ASSIGNED: ["VENDOR_EN_ROUTE"],
    VENDOR_EN_ROUTE: ["INSPECTION_IN_PROGRESS"],
    INSPECTION_IN_PROGRESS: ["WAITING_FOR_USER_APPROVAL"],
    WAITING_FOR_USER_APPROVAL: [],
    SERVICE_IN_PROGRESS: ["COMPLETED"],
};

export const updateVendorBookingState = asyncHandler(async (req, res) => {
    const vendorId = req.vendor._id;
    const bookingId = req.params.bookingId;
    const { newState } = req.body;

    // Validate newState
    if (!BookingStateEnum.includes(newState)) {
        throw new ApiError(400, "Invalid booking state requested");
    }

    // Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    // Check vendor assignment
    if (!booking.vendorId || booking.vendorId.toString() !== vendorId.toString()) {
        throw new ApiError(403, "You are not assigned to this booking");
    }

    const currentState = booking.bookingState;
    const allowedNextStates = allowedVendorTransitions[currentState] || [];

    // Validate transition
    if (!allowedNextStates.includes(newState)) {
        throw new ApiError(400, `Invalid state transition from ${currentState} to ${newState}`);
    }

    // Restrict forbidden states
    const forbiddenStates = [
        "SERVICE_IN_PROGRESS",
        "CANCELLED",
        "DISPATCHING",
        "CREATED",
    ];
    if (forbiddenStates.includes(newState)) {
        throw new ApiError(400, "Vendors cannot set this state");
    }

    // Update booking state
    booking.bookingState = newState;
    booking.stateHistory.push({
        state: newState,
        changedBy: "VENDOR",
        timestamp: new Date(),
    });
    await booking.save();

    res.status(200).json({
        success: true,
        message: "Booking state updated",
        data: booking,
    });
});
