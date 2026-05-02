import { ApiResponse } from "../Utils/ApiResponse.utils.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import * as bookingService from "../Services/booking.service.js";

const createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.user._id, req.body);

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                booking: {
                    _id: booking._id,
                    bookingState: booking.bookingState,
                    requestedServiceCategories: booking.requestedServiceCategories,
                    createdAt: booking.createdAt,
                },
            },
            "Booking created successfully"
        )
    );
});

const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getMyBookings(req.user._id);
    return res.status(200).json(new ApiResponse(200, { bookings }, "Bookings fetched successfully"));
});

const getBookingDetail = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingDetail(req.user._id, req.params.id);
    return res.status(200).json(new ApiResponse(200, { booking }, "Booking fetched successfully"));
});

const acceptBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.acceptBooking(req.vendor, req.params.id);
    return res.status(200).json(new ApiResponse(200, { booking }, "Booking accepted successfully"));
});

const markVendorEnRoute = asyncHandler(async (req, res) => {
    const booking = await bookingService.markVendorEnRoute(req.vendor._id, req.params.id);
    return res.status(200).json(new ApiResponse(200, { booking }, "Vendor marked as en-route"));
});

const updateLiveLocation = asyncHandler(async (req, res) => {
    const booking = await bookingService.updateLiveLocation(req.vendor._id, req.params.id, req.body);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                bookingId: booking._id,
                liveTracking: booking.liveTracking,
            },
            "Live location updated successfully"
        )
    );
});

const markVendorArrived = asyncHandler(async (req, res) => {
    const booking = await bookingService.markVendorArrived(req.vendor._id, req.params.id);
    return res.status(200).json(new ApiResponse(200, { booking }, "Vendor marked as arrived"));
});

const submitDiagnosis = asyncHandler(async (req, res) => {
    const booking = await bookingService.submitDiagnosis(req.vendor._id, req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, { booking }, "Diagnosis submitted successfully"));
});

const approveServices = asyncHandler(async (req, res) => {
    const booking = await bookingService.approveServices(req.user._id, req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, { booking }, "Services approved successfully"));
});

const completeService = asyncHandler(async (req, res) => {
    const booking = await bookingService.completeService(req.vendor._id, req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, { booking }, "Service marked as completed"));
});

const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.cancelBooking({
        reqUser: req.user,
        reqVendor: req.vendor || null,
        bookingId: req.params.id,
    });

    return res.status(200).json(new ApiResponse(200, { booking }, "Booking cancelled successfully"));
});

const getLiveTracking = asyncHandler(async (req, res) => {
    // Deprecated fallback endpoint: prefer socket-based /tracking namespace for real-time updates.
    const booking = await bookingService.getLiveTracking(req.user._id, req.params.id);

    if (!booking.liveTracking?.isEnabled) {
        return res.status(200).json(
            new ApiResponse(200, null, "Live tracking is not active for this booking")
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                bookingId: booking._id,
                bookingState: booking.bookingState,
                vendorId: booking.vendorId,
                serviceLocation: booking.serviceLocation,
                liveTracking: booking.liveTracking,
            },
            "Live tracking fetched successfully"
        )
    );
});


const getVendorMyBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getVendorMyBookings(req.vendor._id);
    return res.status(200).json(new ApiResponse(200, { bookings }, "Vendor bookings fetched successfully"));
});

// New: Requested bookings (vendor is eligible to accept)
const getVendorRequestedBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getVendorRequestedBookings(req.vendor._id);
    // Only send minimal info
    return res.status(200).json(new ApiResponse(200, { bookings }, "Vendor requested bookings fetched successfully"));
});

const getVendorBookingDetail = asyncHandler(async (req, res) => {
    const booking = await bookingService.getVendorBookingDetail(req.vendor._id, req.params.id);
    return res.status(200).json(new ApiResponse(200, { booking }, "Vendor booking detail fetched successfully"));
});

const findNearbyVendors = asyncHandler(async (req, res) => {
    const vendors = await bookingService.findNearbyVendors(req.query);
    return res.status(200).json(new ApiResponse(200, { vendors }, "Nearby vendors fetched successfully"));
});

const rejectBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.rejectBooking(req.vendor, req.params.id);
    return res.status(200).json(new ApiResponse(200, { booking }, "Booking rejected successfully"));
});

export {
    createBooking,
    getMyBookings,
    getBookingDetail,
    acceptBooking,
    markVendorEnRoute,
    updateLiveLocation,
    markVendorArrived,
    submitDiagnosis,
    approveServices,
    completeService,
    cancelBooking,
    getLiveTracking,
    getVendorMyBookings,
    getVendorRequestedBookings,
    getVendorBookingDetail,
    findNearbyVendors,
    rejectBooking,
};
