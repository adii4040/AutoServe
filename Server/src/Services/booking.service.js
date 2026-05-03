import { Booking } from "../Models/Booking.model.js";
import { Vendor } from "../Models/Vendor.model.js";
import { VendorBehaviour } from "../Models/Vendor_Behaviors.model.js";
import { Service } from "../Models/Service.model.js";
import { ApiError } from "../Utils/ApiError.utils.js";
import { logger } from "../Utils/logger.js";
import {
    ACTIVE_BOOKING_STATES,
    BOOKING_DISPATCH,
    BOOKING_LOCATION,
    BOOKING_STATES,
    TRACKABLE_STATES,
} from "../Constants/booking.constants.js";
import { notifyUser, notifyVendor } from "./notification.service.js";
import { emitLocationUpdate, emitVendorArrived } from "../Socket/tracking.socket.js";
import { getAgenda } from "../Jobs/agenda.js";

const resolveDispatchBatchTimeoutMs = () => {
    const parsed = Number(process.env.DISPATCH_BATCH_TIMEOUT_MS);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    return 60000;
};

const scheduleDispatchAdvance = async (bookingId) => {
    try {
        const agenda = getAgenda();
        const timeoutMs = resolveDispatchBatchTimeoutMs();
        const seconds = Math.max(1, Math.ceil(timeoutMs / 1000));
        await agenda.schedule(`in ${seconds} seconds`, "advance-dispatch-batch", { bookingId: bookingId.toString() });
    } catch (error) {
        logger.error("Failed to schedule dispatch advance", {
            bookingId: bookingId.toString(),
            error: error?.message || error,
        });
    }
};

const cancelDispatchAdvanceJobs = async (bookingId) => {
    try {
        const agenda = getAgenda();
        await agenda.cancel({ name: "advance-dispatch-batch", "data.bookingId": bookingId.toString() });
    } catch (error) {
        logger.error("Failed to cancel dispatch advance jobs", {
            bookingId: bookingId.toString(),
            error: error?.message || error,
        });
    }
};

const toRadians = (deg) => (deg * Math.PI) / 180;

const distanceKmBetweenPoints = (pointA, pointB) => {
    const [lng1, lat1] = pointA;
    const [lng2, lat2] = pointB;

    const earthRadiusKm = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
};

const createVendorBatches = (vendorIds, batchSize = BOOKING_DISPATCH.BATCH_SIZE) => {
    const batches = [];
    for (let i = 0; i < vendorIds.length; i += batchSize) {
        batches.push(vendorIds.slice(i, i + batchSize));
    }
    return batches;
};

const pushStateHistory = (booking, state, changedBy, reason) => {
    booking.bookingState = state;
    booking.stateHistory.push({ state, changedBy, reason, timestamp: new Date() });
};

const releaseVendorFromBooking = async (vendorId) => {
    // No longer system-controlled: vendor must update availability manually
    return;
};

const buildLiveTrackingSnapshot = (booking, vendorCoordinates) => {
    const serviceCoordinates = booking.serviceLocation?.coordinates;
    if (!Array.isArray(serviceCoordinates) || serviceCoordinates.length !== 2) {
        return { distanceKm: null, etaMinutes: null };
    }

    const distanceKm = distanceKmBetweenPoints(vendorCoordinates, serviceCoordinates);
    const etaMinutes = Math.max(
        1,
        Math.round((distanceKm / BOOKING_LOCATION.ASSUMED_AVG_SPEED_KMPH) * 60)
    );

    return {
        distanceKm: Number(distanceKm.toFixed(2)),
        etaMinutes,
    };
};

const advanceDispatchBatch = async (bookingId) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return;
    }

    if (booking.bookingState !== BOOKING_STATES.DISPATCHING || booking.vendorId) {
        return;
    }

    const currentBatchIndex = booking.dispatchMeta?.currentBatchIndex || 0;
    const nextBatchIndex = currentBatchIndex + 1;
    const nextBatch = booking.dispatchMeta?.vendorBatches?.[nextBatchIndex] || [];

    if (nextBatch.length === 0) {
        pushStateHistory(booking, BOOKING_STATES.CANCELLED, "SYSTEM", "No vendors available");
        booking.liveTracking.isEnabled = false;
        booking.liveTracking.etaMinutes = null;
        booking.liveTracking.distanceKm = null;
        await booking.save();
        return;
    }

    booking.dispatchMeta.currentBatchIndex = nextBatchIndex;
    booking.dispatchMeta.lastDispatchAt = new Date();
    await booking.save();

    for (const vendorId of nextBatch) {
        await notifyVendor(vendorId.toString(), "NEW_BOOKING", {
            bookingId: booking._id.toString(),
        });
    }

    await scheduleDispatchAdvance(booking._id.toString());
};

const dispatchBooking = async (bookingId) => {
    const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, bookingState: BOOKING_STATES.CREATED },
        {
            $set: { bookingState: BOOKING_STATES.DISPATCHING },
            $push: {
                stateHistory: {
                    state: BOOKING_STATES.DISPATCHING,
                    changedBy: "SYSTEM",
                    reason: "Dispatch flow started",
                    timestamp: new Date(),
                },
            },
        },
        { new: true }
    );

    if (!booking) return;

    let radius = booking.dispatchRadiusKm || BOOKING_DISPATCH.DEFAULT_RADIUS_KM;
    let eligibleVendors = [];

    while (radius <= BOOKING_DISPATCH.MAX_RADIUS_KM && eligibleVendors.length === 0) {
        eligibleVendors = await Vendor.find({
            isVerified: true,
            serviceCategories: { $in: booking.requestedServiceCategories },
            location: {
                $nearSphere: {
                    $geometry: {
                        type: "Point",
                        coordinates: booking.serviceLocation.coordinates,
                    },
                    $maxDistance: radius * 1000,
                },
            },
            $expr: {
                $lt: [
                    { $size: { $ifNull: ["$activeBookingIds", []] } },
                    3
                ]
            }
        })
            .select("_id")
            .limit(BOOKING_DISPATCH.MAX_CANDIDATE_VENDORS);

        // Debug logging
        logger.info("dispatchBooking: eligible vendors search", {
            radius,
            bookingCoords: booking.serviceLocation.coordinates,
            foundCount: eligibleVendors.length,
        });

        if (eligibleVendors.length === 0) {
            radius += BOOKING_DISPATCH.RADIUS_INCREMENT_KM;
        }
    }

    // If still no vendors found with geo query, fall back to ANY verified vendor
    // with matching service categories (for dev/testing when vendors have [0,0] coords)
    if (eligibleVendors.length === 0) {
        logger.warn("dispatchBooking: no geo-eligible vendors, falling back to all matching vendors");
        eligibleVendors = await Vendor.find({
            isVerified: true,
            $or: [
                { serviceCategories: { $in: booking.requestedServiceCategories } },
                { serviceCategories: { $size: 0 } } // Allow new vendors with empty categories
            ],
            $expr: {
                $lt: [
                    { $size: { $ifNull: ["$activeBookingIds", []] } },
                    3
                ]
            }
        })
            .select("_id")
            .limit(BOOKING_DISPATCH.MAX_CANDIDATE_VENDORS);
        logger.info("dispatchBooking: fallback found", { count: eligibleVendors.length });
    }

    if (eligibleVendors.length === 0) {
        await Booking.findByIdAndUpdate(bookingId, {
            $set: { dispatchRadiusKm: radius },
            $push: {
                stateHistory: {
                    state: BOOKING_STATES.DISPATCHING,
                    changedBy: "SYSTEM",
                    reason: "No eligible vendors found in max dispatch radius",
                    timestamp: new Date(),
                },
            },
        });
        return;
    }

    const eligibleVendorIds = eligibleVendors.map((vendor) => vendor._id);

    const rankedVendors = await Vendor.aggregate([
        {
            $match: { _id: { $in: eligibleVendorIds } },
        },
        {
            $lookup: {
                from: "vendorbehaviours",
                localField: "_id",
                foreignField: "vendorId",
                as: "behaviour",
            },
        },
        {
            $unwind: {
                path: "$behaviour",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $addFields: {
                acceptanceRate: {
                    $cond: [
                        { $gt: ["$behaviour.total_requests_received", 0] },
                        {
                            $divide: [
                                { $add: ["$behaviour.total_requests_accepted", 1] },
                                { $add: ["$behaviour.total_requests_received", 2] },
                            ],
                        },
                        0.5,
                    ],
                },
                ratingScore: {
                    $cond: [
                        { $gt: ["$behaviour.rating_count", 0] },
                        { $divide: ["$behaviour.rating_sum", "$behaviour.rating_count"] },
                        4,
                    ],
                },
            },
        },
        {
            $addFields: {
                rankScore: {
                    $add: [
                        { $multiply: ["$acceptanceRate", 0.6] },
                        { $multiply: [{ $divide: ["$ratingScore", 5] }, 0.4] },
                    ],
                },
            },
        },
        { $sort: { rankScore: -1 } },
        { $project: { _id: 1 } },
    ]);

    const rankedVendorIds = rankedVendors.map((v) => v._id);

    await VendorBehaviour.bulkWrite(
        rankedVendorIds.map((vendorId) => ({
            updateOne: {
                filter: { vendorId },
                update: {
                    $setOnInsert: { vendorId },
                    $inc: { total_requests_received: 1 },
                },
                upsert: true,
            },
        }))
    );

    const vendorBatches = createVendorBatches(rankedVendorIds);

    const dispatchMeta = {
        vendorBatches,
        currentBatchIndex: 0,
        lastDispatchAt: new Date(),
    };

    await Booking.findByIdAndUpdate(bookingId, {
        $set: {
            dispatchRadiusKm: radius,
            dispatchMeta,
        },
        $push: {
            stateHistory: {
                state: BOOKING_STATES.DISPATCHING,
                changedBy: "SYSTEM",
                reason: `Dispatch created with ${rankedVendorIds.length} candidate vendors`,
                timestamp: new Date(),
            },
        },
    });

    const firstBatch = dispatchMeta.vendorBatches[0] || [];
    for (const vendorId of firstBatch) {
        await notifyVendor(vendorId.toString(), "NEW_BOOKING", {
            bookingId: booking._id.toString(),
        });
    }

    if (firstBatch.length > 0) {
        await scheduleDispatchAdvance(booking._id.toString());
    }
};

const createBooking = async (userId, payload) => {
    const {
        serviceCategory,
        problemDescription,
        vehicleType,
        brand,
        model,
        coordinates,
        formattedAddress,
        landmark,
        city,
        state,
        pincode,
    } = payload;

    const ongoingBooking = await Booking.findOne({
        userId,
        bookingState: { $in: ACTIVE_BOOKING_STATES },
    });

    if (ongoingBooking) {
        throw new ApiError(400, "You already have an ongoing booking. Please complete or cancel it first.");
    }

    const booking = await Booking.create({
        userId,
        requestedServiceCategories: serviceCategory,
        problemDescription,
        vehicleInfo: { vehicleType, brand, model },
        serviceLocation: {
            type: "Point",
            coordinates,
            serviceAddress: { formattedAddress, landmark, city, state, pincode },
        },
        bookingState: BOOKING_STATES.CREATED,
        stateHistory: [
            {
                state: BOOKING_STATES.CREATED,
                changedBy: "USER",
                reason: "Booking created",
                timestamp: new Date(),
            },
        ],
    });

    dispatchBooking(booking._id).catch((err) => {
        logger.error("dispatchBooking failed", { bookingId: booking._id.toString(), error: err.message });
    });

    return booking;
};

const getMyBookings = async (userId) => {
    return Booking.find({ userId })
        .populate("vendorId", "fullname shopName phone availablityStatus location")
        .sort({ createdAt: -1 });
};

const getBookingDetail = async (userId, bookingId) => {
    // Find the booking regardless of its state (including CANCELLED)
    const booking = await Booking.findOne({
        _id: bookingId,
        userId: userId.toString()
    }).populate(
        "vendorId",
        "fullname shopName phone availablityStatus location"
    ).lean();

    if (!booking) {
        throw new ApiError(404, "Booking not found or invalid ID");
    }

    // Include vendor batch info for cancelled bookings to show assignment history
    if (booking.bookingState === BOOKING_STATES.CANCELLED && !booking.vendorId) {
        // Cancelled before vendor assignment - this is valid
        booking.cancelledBeforeAssignment = true;
    }

    return booking;
};

const acceptBooking = async (vendor, bookingId) => {
    const vendorId = vendor._id;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    if (booking.bookingState !== BOOKING_STATES.DISPATCHING) {
        throw new ApiError(409, "Booking cannot be accepted in current state");
    }

    const allowedVendorIds = (booking.dispatchMeta?.vendorBatches || []).flat().map((v) => v.toString());
    if (!allowedVendorIds.includes(vendorId.toString())) {
        throw new ApiError(403, "This booking is not assigned to your dispatch queue");
    }


    // No single-active-booking check: up to 3 active bookings allowed (enforced by dispatch filter)

    const acceptedBooking = await Booking.findOneAndUpdate(
        { _id: bookingId, bookingState: BOOKING_STATES.DISPATCHING, vendorId: null },
        {
            $set: {
                vendorId,
                bookingState: BOOKING_STATES.VENDOR_ASSIGNED,
                liveTracking: {
                    isEnabled: false,
                    vendorCurrentLocation: {
                        type: "Point",
                        coordinates: vendor.location?.coordinates || [0, 0],
                        updatedAt: new Date(),
                    },
                    etaMinutes: null,
                    distanceKm: null,
                    locationHistory: [
                        {
                            coordinates: vendor.location?.coordinates || [0, 0],
                            timestamp: new Date(),
                            source: "GPS",
                        },
                    ],
                },
            },
            $push: {
                stateHistory: {
                    state: BOOKING_STATES.VENDOR_ASSIGNED,
                    changedBy: "SYSTEM",
                    reason: "Vendor accepted dispatch",
                    timestamp: new Date(),
                },
            },
        },
        { new: true }
    );

    if (!acceptedBooking) throw new ApiError(409, "Booking already accepted by another vendor");

    await cancelDispatchAdvanceJobs(acceptedBooking._id.toString());

    // Add bookingId to vendor's activeBookingIds (max 3 handled by dispatch filter)
    await Vendor.findByIdAndUpdate(
        vendorId,
        { $addToSet: { activeBookingIds: bookingId } }
    );

    await VendorBehaviour.findOneAndUpdate(
        { vendorId },
        { $setOnInsert: { vendorId }, $inc: { total_requests_accepted: 1 } },
        { upsert: true }
    );

    await notifyUser(acceptedBooking.userId.toString(), "BOOKING_ACCEPTED", {
        bookingId: acceptedBooking._id.toString(),
        vendorId: vendorId.toString(),
    });

    return acceptedBooking;
};

const markVendorEnRoute = async (vendorId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, vendorId });
    if (!booking) throw new ApiError(404, "Booking not found");

    if (booking.bookingState !== BOOKING_STATES.VENDOR_ASSIGNED) {
        throw new ApiError(409, "Booking is not ready for en-route status");
    }

    pushStateHistory(booking, BOOKING_STATES.VENDOR_EN_ROUTE, "VENDOR", "Vendor started route to service location");
    booking.liveTracking.isEnabled = true;
    await booking.save();

    return booking;
};

const updateLiveLocation = async (vendorId, bookingId, payload) => {
    const { coordinates, source = "GPS" } = payload;

    const booking = await Booking.findOne({ _id: bookingId, vendorId });
    if (!booking) throw new ApiError(404, "Booking not found");

    if (!TRACKABLE_STATES.includes(booking.bookingState)) {
        throw new ApiError(409, "Live location updates are not allowed in current booking state");
    }

    const tracking = buildLiveTrackingSnapshot(booking, coordinates);

    booking.liveTracking.isEnabled = true;
    booking.liveTracking.vendorCurrentLocation = {
        type: "Point",
        coordinates,
        updatedAt: new Date(),
    };
    booking.liveTracking.distanceKm = tracking.distanceKm;
    booking.liveTracking.etaMinutes =
        booking.bookingState === BOOKING_STATES.VENDOR_EN_ROUTE ? tracking.etaMinutes : null;

    booking.liveTracking.locationHistory.push({ coordinates, timestamp: new Date(), source });
    if (booking.liveTracking.locationHistory.length > BOOKING_LOCATION.MAX_LOCATION_HISTORY) {
        booking.liveTracking.locationHistory = booking.liveTracking.locationHistory.slice(
            -BOOKING_LOCATION.MAX_LOCATION_HISTORY
        );
    }

    await booking.save();

    await Vendor.findByIdAndUpdate(vendorId, {
        $set: {
            "location.type": "Point",
            "location.coordinates": coordinates,
        },
    });

    emitLocationUpdate(booking._id.toString(), {
        lat: coordinates[1],
        lng: coordinates[0],
        timestamp: new Date().toISOString(),
    });

    return booking;
};

const markVendorArrived = async (vendorId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, vendorId });
    if (!booking) throw new ApiError(404, "Booking not found");

    if (booking.bookingState !== BOOKING_STATES.VENDOR_EN_ROUTE) {
        throw new ApiError(409, "Booking is not in VENDOR_EN_ROUTE state");
    }

    pushStateHistory(booking, BOOKING_STATES.INSPECTION_IN_PROGRESS, "VENDOR", "Vendor reached service location");
    booking.inspection.startedAt = booking.inspection.startedAt || new Date();
    booking.liveTracking.etaMinutes = 0;
    booking.liveTracking.distanceKm = 0;

    await booking.save();

    emitVendorArrived(booking._id.toString(), {
        bookingId: booking._id.toString(),
        timestamp: new Date().toISOString(),
    });

    await notifyUser(booking.userId.toString(), "VENDOR_ARRIVED", { bookingId: booking._id.toString() });

    return booking;
};

const submitDiagnosis = async (vendorId, bookingId, payload) => {
    const validatedData = payload;

    const booking = await Booking.findOne({
        _id: bookingId,
        vendorId,
        bookingState: BOOKING_STATES.INSPECTION_IN_PROGRESS,
    });

    if (!booking) throw new ApiError(404, "Invalid booking state for diagnosis");

    const suggestedServices = [];

    for (const service of validatedData.services) {
        if (service.serviceId) {
            const serviceExists = await Service.findById(service.serviceId);
            if (!serviceExists) throw new ApiError(400, "Invalid service selected");

            suggestedServices.push({
                serviceId: service.serviceId,
                vendorQuotedPrice: service.quotedPrice,
            });
        } else {
            suggestedServices.push({
                serviceId: null,
                customServiceName: service.customServiceName,
                vendorQuotedPrice: service.quotedPrice,
            });
        }
    }

    booking.diagnosis = { issues: validatedData.issues, suggestedServices };
    booking.inspection.inspectionFeeFinal = validatedData.inspectionFeeFinal;
    booking.inspection.completedAt = new Date();
    pushStateHistory(
        booking,
        BOOKING_STATES.WAITING_FOR_USER_APPROVAL,
        "VENDOR",
        "Diagnosis submitted for user approval"
    );

    await booking.save();

    await notifyUser(booking.userId.toString(), "DIAGNOSIS_READY", { bookingId: booking._id.toString() });

    return booking;
};

const approveServices = async (userId, bookingId, payload) => {
    const booking = await Booking.findOne({
        _id: bookingId,
        userId,
        bookingState: BOOKING_STATES.WAITING_FOR_USER_APPROVAL,
    });

    if (!booking) throw new ApiError(404, "Invalid booking state for approval");

    const finalServices = payload.approvedIndexes.map((idx) => {
        const suggestedService = booking.diagnosis.suggestedServices[idx];
        if (!suggestedService) throw new ApiError(400, "Invalid service index");

        return {
            serviceId: suggestedService.serviceId || null,
            customServiceName: suggestedService.customServiceName || null,
            finalPrice: suggestedService.vendorQuotedPrice,
        };
    });

    booking.serviceExecution = {
        startedAt: new Date(),
        completedAt: null,
        finalServices,
    };

    booking.userApproval = {
        approvedIndexes: payload.approvedIndexes,
        rejectedIndexes: payload.rejectedIndexes,
        decisionAt: new Date(),
    };

    pushStateHistory(booking, BOOKING_STATES.SERVICE_IN_PROGRESS, "USER", "User approved final service list");
    await booking.save();

    return booking;
};

const completeService = async (vendorId, bookingId, payload) => {
    const { inspectionAmount, serviceAmount, paymentMode } = payload;

    const booking = await Booking.findOne({
        _id: bookingId,
        vendorId,
        bookingState: BOOKING_STATES.SERVICE_IN_PROGRESS,
    });

    if (!booking) throw new ApiError(404, "Invalid booking state for completion");

    booking.serviceExecution.completedAt = new Date();

    booking.payments.inspection.amount = inspectionAmount ?? booking.payments.inspection.amount ?? 0;
    booking.payments.service.amount = serviceAmount ?? booking.payments.service.amount ?? 0;

    if (paymentMode) {
        booking.payments.inspection.mode = paymentMode;
        booking.payments.service.mode = paymentMode;
    }

    pushStateHistory(booking, BOOKING_STATES.COMPLETED, "VENDOR", "Service completed by vendor");
    booking.liveTracking.isEnabled = false;
    booking.liveTracking.etaMinutes = null;
    booking.liveTracking.distanceKm = null;

    await booking.save();
    // Remove bookingId from vendor's activeBookingIds
    await Vendor.findByIdAndUpdate(
        vendorId,
        { $pull: { activeBookingIds: bookingId } }
    );

    await VendorBehaviour.findOneAndUpdate(
        { vendorId },
        {
            $setOnInsert: { vendorId },
            $inc: { total_services_completed: 1 },
        },
        { upsert: true }
    );

    return booking;
};

const cancelBooking = async ({ reqUser, reqVendor, bookingId, reason }) => {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    if ([BOOKING_STATES.COMPLETED, BOOKING_STATES.CANCELLED].includes(booking.bookingState)) {
        throw new ApiError(409, `Booking is already ${booking.bookingState.toLowerCase()}`);
    }

    const cancelledBy = reqUser ? "USER" : "VENDOR";

    if (cancelledBy === "USER" && booking.userId.toString() !== reqUser._id.toString()) {
        throw new ApiError(403, "Unauthorized cancellation request");
    }

    if (cancelledBy === "VENDOR" && booking.vendorId?.toString() !== reqVendor._id.toString()) {
        throw new ApiError(403, "Unauthorized cancellation request");
    }

    booking.cancellation = {
        cancelledBy,
        reason,
        penaltyApplied: false,
        cancelledAt: new Date(),
    };

    pushStateHistory(booking, BOOKING_STATES.CANCELLED, cancelledBy, reason || "Booking cancelled");
    booking.liveTracking.isEnabled = false;
    booking.liveTracking.etaMinutes = null;
    booking.liveTracking.distanceKm = null;

    await booking.save();
    // Remove bookingId from vendor's activeBookingIds if cancelled
    if (booking.vendorId) {
        await Vendor.findByIdAndUpdate(
            booking.vendorId,
            { $pull: { activeBookingIds: booking._id } }
        );
    }

    if (cancelledBy === "VENDOR") {
        await VendorBehaviour.findOneAndUpdate(
            { vendorId: reqVendor._id },
            {
                $setOnInsert: { vendorId: reqVendor._id },
                $inc: { total_requests_rejected: 1 },
            },
            { upsert: true }
        );
    }

    return booking;
};

const getLiveTracking = async (userId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, userId }).select(
        "liveTracking bookingState vendorId serviceLocation"
    );

    if (!booking) throw new ApiError(404, "Booking not found");
    return booking;
};

const getVendorMyBookings = async (vendorId) => {
    // Show all bookings assigned to the vendor so completed work stays visible in history.
    const bookings = await Booking.find({
        vendorId,
    })
    .populate('userId', 'fullname phone address')
    .sort({ createdAt: -1 });

    // Fetch vendor location from DB
    const vendor = await Vendor.findById(vendorId).select('location');

    // Map to only minimal info
    return bookings.map(b => {
        // Calculate distance and eta if vendor and booking location are available
        let distanceKm = null;
        let etaMinutes = null;
        if (
            b.serviceLocation &&
            b.serviceLocation.coordinates &&
            b.serviceLocation.coordinates.length === 2 &&
            vendor &&
            vendor.location &&
            Array.isArray(vendor.location.coordinates) &&
            vendor.location.coordinates.length === 2
        ) {
            const [lng1, lat1] = b.serviceLocation.coordinates;
            const [lng2, lat2] = vendor.location.coordinates;
            const toRadians = (deg) => (deg * Math.PI) / 180;
            const earthRadiusKm = 6371;
            const dLat = toRadians(lat2 - lat1);
            const dLng = toRadians(lng2 - lng1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distanceKm = Math.round(earthRadiusKm * c * 10) / 10;
            // Assume avg speed 30km/h for eta
            etaMinutes = Math.max(1, Math.round((distanceKm / 30) * 60));
        }
        return {
            bookingId: b._id,
            createdAt: b.createdAt,
            requestedServiceCategories: b.requestedServiceCategories,
            problemDescription: b.problemDescription,
            vehicleInfo: b.vehicleInfo,
            address: b.serviceLocation?.serviceAddress?.formattedAddress || null,
            user: b.userId ? {
                fullname: b.userId.fullname,
                phone: b.userId.phone,
                address: b.userId.address || null,
            } : null,
            distanceKm,
            etaMinutes,
            status: b.bookingState,
            inspectionFee: 200,
        };
    });
};

// New: Get bookings where vendor is in ANY batch in dispatchMeta (eligible to accept)
const getVendorRequestedBookings = async (vendorId) => {
    // Find DISPATCHING bookings where the vendor appears in any batch
    // Use a flat search across all vendorBatches arrays
    const bookings = await Booking.find({
        bookingState: BOOKING_STATES.DISPATCHING,
        vendorId: null, // Not yet accepted
        "dispatchMeta.vendorBatches": { $elemMatch: { $elemMatch: { $eq: vendorId } } }
    })
    .populate('userId', 'fullname phone email avatar')
    .sort({ createdAt: -1 });

    // Fetch vendor location from DB
    const vendor = await Vendor.findById(vendorId).select('location');

    // Map to only relevant info
    return bookings.map(b => {
        // Calculate distance if vendor and booking location are available
        let distanceKm = null;
        const bookingCoords = b.serviceLocation?.coordinates;
        const vendorCoords = vendor?.location?.coordinates;
        if (
            Array.isArray(bookingCoords) && bookingCoords.length === 2 &&
            Array.isArray(vendorCoords) && vendorCoords.length === 2 &&
            !(vendorCoords[0] === 0 && vendorCoords[1] === 0)
        ) {
            const [lng1, lat1] = bookingCoords;
            const [lng2, lat2] = vendorCoords;
            const toRadians = (deg) => (deg * Math.PI) / 180;
            const earthRadiusKm = 6371;
            const dLat = toRadians(lat2 - lat1);
            const dLng = toRadians(lng2 - lng1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distanceKm = Math.round(earthRadiusKm * c * 10) / 10;
        }
        return {
            bookingId: b._id,
            createdAt: b.createdAt,
            requestedServiceCategories: b.requestedServiceCategories,
            problemDescription: b.problemDescription,
            vehicleInfo: b.vehicleInfo,
            serviceLocation: b.serviceLocation,
            address: b.serviceLocation?.serviceAddress?.formattedAddress || null,
            user: b.userId ? {
                fullname: b.userId.fullname,
                phone: b.userId.phone,
                email: b.userId.email,
                avatar: b.userId.avatar?.url || null,
            } : null,
            distanceKm,
        };
    });
};

const getVendorBookingDetail = async (vendorId, bookingId) => {
    const booking = await Booking.findOne({ _id: bookingId, vendorId }).populate(
        "userId",
        "fullname phone email"
    );
    if (!booking) throw new ApiError(404, "Booking not found");

    // Calculate distance and ETA
    let distanceKm = null;
    let etaMinutes = null;
    const vendorLoc = booking.liveTracking?.vendorCurrentLocation?.coordinates;
    const serviceLoc = booking.serviceLocation?.coordinates;
    if (Array.isArray(vendorLoc) && Array.isArray(serviceLoc) && vendorLoc.length === 2 && serviceLoc.length === 2) {
        distanceKm = distanceKmBetweenPoints(vendorLoc, serviceLoc);
        etaMinutes = Math.max(1, Math.round((distanceKm / 25) * 60)); // 25 km/h avg speed
    }
    if (!booking.liveTracking) booking.liveTracking = {};
    booking.liveTracking.distanceKm = distanceKm !== null ? Number(distanceKm.toFixed(2)) : null;
    booking.liveTracking.etaMinutes = etaMinutes;

    // Set inspection fee to 200 if not set
    if (!booking.inspection) booking.inspection = {};
    if (booking.inspection.inspectionFeeFinal == null) {
        booking.inspection.inspectionFeeFinal = 200;
    }

    return booking;
};

const findNearbyVendors = async ({ lng, lat, radiusKm = 5, serviceCategory }) => {
    const longitude = Number(lng);
    const latitude = Number(lat);
    const radiusMeters = Number(radiusKm) * 1000;

    if (Number.isNaN(longitude) || Number.isNaN(latitude) || Number.isNaN(radiusMeters)) {
        throw new ApiError(400, "Invalid location query values");
    }

    const filter = {
        isVerified: true,
        availablityStatus: "AVAILABLE",

        location: {
            $nearSphere: {
                $geometry: { type: "Point", coordinates: [longitude, latitude] },
                $maxDistance: radiusMeters,
            },
        },
    };

    if (serviceCategory) {
        filter.serviceCategories = { $in: [serviceCategory] };
    }

    return Vendor.find(filter).select("fullname shopName phone serviceCategories location").limit(50);
};

// Vendor rejects a booking request
const rejectBooking = async (vendor, bookingId) => {
    // Find the booking in DISPATCHING state and where vendor is in the current batch
    const booking = await Booking.findOne({
        _id: bookingId,
        bookingState: BOOKING_STATES.DISPATCHING,
        $expr: {
            $in: [vendor._id, {
                $arrayElemAt: ["$dispatchMeta.vendorBatches", "$dispatchMeta.currentBatchIndex"]
            }]
        }
    });
    if (!booking) throw new ApiError(404, "Booking not found or not eligible for rejection");

    // Remove vendor from current batch
    const batch = booking.dispatchMeta.vendorBatches[booking.dispatchMeta.currentBatchIndex] || [];
    booking.dispatchMeta.vendorBatches[booking.dispatchMeta.currentBatchIndex] = batch.filter(
        vId => vId.toString() !== vendor._id.toString()
    );

    // Optionally, add to rejectedVendors or similar for analytics
    if (!booking.dispatchMeta.rejectedVendors) booking.dispatchMeta.rejectedVendors = [];
    booking.dispatchMeta.rejectedVendors.push(vendor._id);

    await booking.save();
    return booking;
};

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
    advanceDispatchBatch,
    rejectBooking,
};
