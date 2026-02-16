import { Booking } from '../Models/Booking.model.js'
import { Vendor } from '../Models/Vendor.model.js'
import { asyncHandler, ApiError, ApiResponse, uploadOnCloudinary, sendMail, emailVerificationMailGen, forgotPasswordReqMailGen, cookieOption, } from '../Utils/index.js'
import { BookingStateEnum } from '../Utils/Constants.js'


/*------------------- CREATE BOOKING ------------------*/

const createBooking = asyncHandler(async (req, res) => {
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
        pincode
    } = req.body;

    const userId = req.user._id;

    const ongoingBooking = await Booking.findOne({
        userId, bookingState: {
            $in: [
                "CREATED",
                "DISPATCHING",
                "VENDOR_ASSIGNED",
                "INSPECTION_IN_PROGRESS",
                "WAITING_FOR_USER_APPROVAL",
                "SERVICE_IN_PROGRESS"
            ]
        }
    });

    if (ongoingBooking) {
        throw new ApiError(400, "You have an ongoing booking. Please complete or cancel it before creating a new one.");
    }

    const newBooking = await Booking.create({
        userId,
        vendorId: null,
        requestedServiceCategories: serviceCategory,
        problemDescription,
        vehicleInfo: {
            vehicleType,
            brand,
            model,
        },
        serviceLocation: {
            type: "Point",
            coordinates,
            serviceAddress: {
                formattedAddress,
                landmark,
                city,
                state,
                pincode
            }
        },
        bookingState: BookingStateEnum[0],
        dispatchRadiusKm: 5,
        stateHistory: [{
            state: BookingStateEnum[0],
            changedBy: "USER",
            reason: "Booking created",
            timestamp: new Date()
        }],
    });

    dispatchBooking(newBooking._id)
        .catch((err) => {
            console.error(`Error dispatching booking ${newBooking._id}:`, err);
        });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                bookingDetails: {
                    bookingId: newBooking._id,
                    bookingState: newBooking.bookingState,
                    createdAt: newBooking.createdAt
                }
            },
            "Booking created successfully"
        )
    )


})

/*------------------- DISPATCHING ------------------*/

async function dispatchBooking(bookingId) {
    const booking = await Booking.findOneAndUpdate(
        { _id: bookingId, bookingState: "CREATED" },
        {
            $set: { bookingState: "DISPATCHING" },
            $push: { stateHistory: { state: "DISPATCHING", changedBy: "SYSTEM" } }
        },
        { new: true }
    );

    if (!booking) return;

    const vendors = await findEligibleVendors(booking);
    const ranked = await rankVendors(vendors, booking);
    const batches = createVendorBatches(ranked.map(v => v._id), 3);

    await Booking.findByIdAndUpdate(bookingId, {
        dispatchMeta: {
            vendorBatches: batches,
            currentBatchIndex: 0,
            lastDispatchAt: new Date()
        }
    });

    sendBatch(bookingId);
}

async function findEligibleVendors(booking) {

    const { coordinates } = booking.serviceLocation;
    const radiusMeter = booking.dispatchRadiusKm * 1000; // convert km to meters

    if (
        !Array.isArray(booking.serviceLocation.coordinates) ||
        booking.serviceLocation.coordinates.length !== 2
    ) {
        throw new Error("Invalid booking coordinates");
    }


    const vendors = await Vendor.find({
        isVerified: true,
        availablityStatus: "AVAILABLE",
        serviceCategories: { $in: booking.requestedServiceCategories },
        activeBookingId: null,
        location: {
            $nearSphere: {
                $geometry: {
                    type: "Point",
                    coordinates
                },
                $maxDistance: radiusMeter
            }
        }
    }).limit(10); // limit to top 10 nearest vendors

    if (!vendors || vendors.length === 0) {
        return [];
    };
    return vendors;
}

async function rankVendors(eligibleVendors, booking) {
    const BAYESIAN_K = 1;

    if (!eligibleVendors || eligibleVendors.length === 0) return [];

    const vendorIds = eligibleVendors.map(v => v._id);

    const rankedVendors = await Vendor.aggregate([
        /* -------- LIMIT TO ELIGIBLE VENDORS BY MATCHING THE ELIGIBLE VENDORS IDs -------- */
        {
            $match: {
                _id: { $in: vendorIds }
            }
        },

        /* -------- JOIN WITH VENDOR_BEHAVIORS COLLECTION -------- */
        {
            $lookup: {
                from: "vendorbehaviours",
                localField: "_id",
                foreignField: "vendorId",
                as: "behaviour"
            }
        },
        {
            $unwind: {
                path: "$behaviour",
                preserveNullAndEmptyArrays: true
            }
        },

        /* -------- DISTANCE CALCULATION -------- */
        {
            $addFields: {
                distanceKm: {
                    $divide: [
                        {
                            $sqrt: {
                                $add: [
                                    { $pow: [{ $subtract: ["$location.coordinates.0", booking.serviceLocation.coordinates[0]] }, 2] },
                                    { $pow: [{ $subtract: ["$location.coordinates.1", booking.serviceLocation.coordinates[1]] }, 2] }
                                ]
                            }
                        },
                        1
                    ]
                }
            }
        },

        /* -------- METRIC COMPUTATION -------- */
        {
            $addFields: {
                acceptanceRate: {
                    $cond: [
                        { $gt: ["$behaviour.total_requests_received", 0] },
                        {
                            $divide: [
                                { $add: ["$behaviour.total_requests_accepted", BAYESIAN_K] },
                                { $add: ["$behaviour.total_requests_received", 2 * BAYESIAN_K] }
                            ]
                        },
                        0.5
                    ]
                },

                ratingScore: {
                    $cond: [
                        { $gte: ["$behaviour.rating_count", 5] },
                        {
                            $divide: ["$behaviour.rating_sum", "$behaviour.rating_count"]
                        },
                        4.0
                    ]
                },

                experienceScore: {
                    $log10: {
                        $add: ["$behaviour.total_services_completed", 1]
                    }
                },

                noShowRate: {
                    $cond: [
                        { $gte: ["$behaviour.total_requests_accepted", 3] },
                        {
                            $divide: [
                                "$behaviour.total_requests_no_show",
                                "$behaviour.total_requests_accepted"
                            ]
                        },
                        0
                    ]
                },

                distanceScore: {
                    $divide: [1, { $add: ["$distanceKm", 1] }]
                }
            }
        },

        /* -------- FINAL VENDOR SCORE -------- */
        {
            $addFields: {
                vendorScore: {
                    $subtract: [
                        {
                            $add: [
                                { $multiply: ["$acceptanceRate", 0.30] },
                                { $multiply: [{ $divide: ["$ratingScore", 5] }, 0.25] },
                                { $multiply: ["$distanceScore", 0.20] },
                                { $multiply: ["$experienceScore", 0.15] }
                            ]
                        },
                        { $multiply: ["$noShowRate", 0.40] }
                    ]
                }
            }
        },

        /* -------- SORT BY SCORE -------- */
        {
            $sort: { vendorScore: -1 }
        }
    ]);

    return rankedVendors;
}

async function sendBatch(bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.vendorId) return;

    const batch = booking.dispatchMeta.vendorBatches[
        booking.dispatchMeta.currentBatchIndex
    ];

    if (!batch) return expandRadiusAndRestart(booking);

    console.log("Dispatching to vendors:", batch);

    setTimeout(() => checkBatchResult(bookingId), 30000);
}

async function checkBatchResult(bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.vendorId) return;

    await Booking.findByIdAndUpdate(bookingId, {
        $inc: { "dispatchMeta.currentBatchIndex": 1 },
        $set: { "dispatchMeta.lastDispatchAt": new Date() }
    });

    sendBatch(bookingId);
}

async function expandRadiusAndRestart(booking) {
    const newRadius = booking.dispatchRadiusKm + 5;
    await Booking.findByIdAndUpdate(booking._id, {
        dispatchRadiusKm: newRadius,
        dispatchMeta: {
            vendorBatches: [],
            currentBatchIndex: 0,
            lastDispatchAt: null
        }
    });
    dispatchBooking(booking._id);
}


/* --------------------VENDOR ACCEPTANCE API-------------------------- */

// ZOD: bookingId param validation
const acceptBooking = asyncHandler(async (req, res) => {

    const { bookingId } = req.params;
    const vendorId = req.vendor._id;

    const booking = await Booking.findOneAndUpdate(
        {
            _id: bookingId,
            bookingState: "DISPATCHING",
            vendorId: null
        },
        {
            $set: {
                vendorId: vendorId,
                bookingState: "VENDOR_ASSIGNED"
            },
            $push: {
                stateHistory: {
                    state: "VENDOR_ASSIGNED",
                    changedBy: "VENDOR"
                }
            }
        },
        { new: true }
    );

    if (!booking) {
        throw new ApiError(409, "Booking already taken");
    }

    return res.json(
        new ApiResponse(200, booking, "Booking accepted")
    );
});

// ZOD: diagnosisValidation
const submitDiagnosis = asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({
        _id: req.params.id,
        vendorId: req.vendor._id,
        bookingState: "INSPECTION_IN_PROGRESS"
    });

    if (!booking) {
        throw new ApiError(404, "Invalid booking state");
    }

    const suggestedServices = [];

    for (const s of req.body.services) {
        if (s.serviceId) {
            const serviceExists = await Service.findById(s.serviceId);
            if (!serviceExists) {
                throw new ApiError(400, "Invalid service selected");
            }
            suggestedServices.push({
                serviceId: s.serviceId,
                vendorQuotedPrice: s.quotedPrice
            });
        } else {
            // custom service
            suggestedServices.push({
                serviceId: null,
                customServiceName: s.customServiceName,
                vendorQuotedPrice: s.quotedPrice
            });
        }
    }

    booking.diagnosis = {
        issues: req.body.issues,
        suggestedServices
    };

    booking.bookingState = "WAITING_FOR_USER_APPROVAL";
    booking.stateHistory.push({
        state: "WAITING_FOR_USER_APPROVAL",
        changedBy: "VENDOR"
    });

    await booking.save();

    return res.json(
        new ApiResponse(200, booking, "Diagnosis submitted")
    );
});

// ZOD: approvalValidation
const approveServices = asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({
        _id: req.params.id,
        userId: req.user._id,
        bookingState: "WAITING_FOR_USER_APPROVAL"
    });

    if (!booking) {
        throw new ApiError(404, "Invalid booking state");
    }

    const finalServices = req.body.approvedIndexes.map(idx => {
        const svc = booking.diagnosis.suggestedServices[idx];
        if (!svc) throw new ApiError(400, "Invalid service index");

        return {
            serviceId: svc.serviceId ?? null,
            customServiceName: svc.customServiceName ?? null,
            finalPrice: svc.vendorQuotedPrice
        };
    });

    booking.serviceExecution = {
        startedAt: new Date(),
        finalServices
    };

    booking.userApproval = {
        approvedIndexes: req.body.approvedIndexes,
        rejectedIndexes: req.body.rejectedIndexes,
        decisionAt: new Date()
    };

    booking.bookingState = "SERVICE_IN_PROGRESS";
    booking.stateHistory.push({
        state: "SERVICE_IN_PROGRESS",
        changedBy: "USER"
    });

    await booking.save();

    return res.json(
        new ApiResponse(200, booking, "Services approved")
    );
});

// ZOD: cancelValidation
const cancelBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new ApiError(404, "Booking not found");

    booking.bookingState = "CANCELLED";
    booking.cancellation = {
        cancelledBy: req.body.by,
        reason: req.body.reason,
        cancelledAt: new Date()
    };

    booking.stateHistory.push({
        state: "CANCELLED",
        changedBy: req.body.by
    });

    await booking.save();

    return res.json(
        new ApiResponse(200, booking, "Booking cancelled")
    );
});






export {
    createBooking,
    acceptBooking,
    submitDiagnosis,
    approveServices,
    cancelBooking,
}