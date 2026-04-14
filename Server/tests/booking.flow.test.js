import { describe, test, expect, beforeAll, beforeEach, jest } from "@jest/globals";
import request from "supertest";

process.env.RAZORPAY_KEY_ID = "rzp_test_mock";
process.env.RAZORPAY_KEY_SECRET = "mock_secret";

const bookingStore = {
    _id: "507f1f77bcf86cd799439011",
    userId: "user-1",
    vendorId: null,
    bookingState: "CREATED",
    requestedServiceCategories: ["Mechanical Service"],
    diagnosis: { suggestedServices: [] },
    serviceExecution: {},
    liveTracking: {},
};

const bookingServiceMock = {
    createBooking: jest.fn(async () => ({ ...bookingStore })),
    getMyBookings: jest.fn(async () => [{ ...bookingStore }]),
    getBookingDetail: jest.fn(async () => ({ ...bookingStore })),
    acceptBooking: jest.fn(async () => {
        if (bookingStore.bookingState !== "DISPATCHING") throw Object.assign(new Error("invalid"), { statusCode: 409 });
        bookingStore.bookingState = "VENDOR_ASSIGNED";
        bookingStore.vendorId = "vendor-1";
        return { ...bookingStore };
    }),
    markVendorEnRoute: jest.fn(async () => {
        if (bookingStore.bookingState !== "VENDOR_ASSIGNED") throw Object.assign(new Error("invalid"), { statusCode: 409 });
        bookingStore.bookingState = "VENDOR_EN_ROUTE";
        return { ...bookingStore };
    }),
    markVendorArrived: jest.fn(async () => {
        if (bookingStore.bookingState !== "VENDOR_EN_ROUTE") throw Object.assign(new Error("invalid"), { statusCode: 409 });
        bookingStore.bookingState = "INSPECTION_IN_PROGRESS";
        return { ...bookingStore };
    }),
    updateLiveLocation: jest.fn(async () => ({ ...bookingStore })),
    submitDiagnosis: jest.fn(async (_vendorId, _bookingId, payload) => {
        if (bookingStore.bookingState !== "INSPECTION_IN_PROGRESS") throw Object.assign(new Error("invalid"), { statusCode: 409 });
        bookingStore.bookingState = "WAITING_FOR_USER_APPROVAL";
        bookingStore.diagnosis.suggestedServices = payload.services.map((s) => ({
            serviceId: s.serviceId || null,
            customServiceName: s.customServiceName || null,
            vendorQuotedPrice: s.quotedPrice,
        }));
        return { ...bookingStore };
    }),
    approveServices: jest.fn(async () => {
        if (bookingStore.bookingState !== "WAITING_FOR_USER_APPROVAL") throw Object.assign(new Error("invalid"), { statusCode: 409 });
        bookingStore.bookingState = "SERVICE_IN_PROGRESS";
        return { ...bookingStore };
    }),
    completeService: jest.fn(async () => {
        if (bookingStore.bookingState !== "SERVICE_IN_PROGRESS") throw Object.assign(new Error("invalid"), { statusCode: 409 });
        bookingStore.bookingState = "COMPLETED";
        return { ...bookingStore };
    }),
    cancelBooking: jest.fn(async () => ({ ...bookingStore, bookingState: "CANCELLED" })),
    getLiveTracking: jest.fn(async () => ({ ...bookingStore, liveTracking: {} })),
    getVendorMyBookings: jest.fn(async () => [{ ...bookingStore }]),
    getVendorBookingDetail: jest.fn(async () => ({ ...bookingStore })),
    findNearbyVendors: jest.fn(async () => []),
};

jest.unstable_mockModule("../src/Services/booking.service.js", () => bookingServiceMock);
jest.unstable_mockModule("../src/Middlewares/auth.middleware.js", () => ({
    default: (req, _res, next) => {
        req.user = { _id: "user-1" };
        next();
    },
}));
jest.unstable_mockModule("../src/Middlewares/authVendor.middleware.js", () => ({
    default: (req, _res, next) => {
        req.vendor = { _id: "vendor-1", location: { coordinates: [77.2, 28.6] } };
        next();
    },
}));

let app;

beforeAll(async () => {
    process.env.ACCESS_TOKEN_SECRET_KEY = "test_secret";
    process.env.REFRESH_TOKEN_SECRET_KEY = "test_refresh";
    const appModule = await import("../src/app.js");
    app = appModule.app;
});

beforeEach(() => {
    bookingStore.bookingState = "CREATED";
    bookingStore.vendorId = null;
    bookingStore.diagnosis = { suggestedServices: [] };
    jest.clearAllMocks();
});

describe("booking flow", () => {
    test("happy path lifecycle", async () => {
        const createRes = await request(app).post("/api/v1/bookings").send({
            serviceCategory: ["Mechanical Service"],
            vehicleType: "Car",
            brand: "Honda",
            model: "City",
            coordinates: [77.2, 28.6],
            formattedAddress: "Test address",
            city: "Delhi",
            state: "Delhi",
            pincode: "110001",
        });
        expect(createRes.status).toBe(201);

        bookingStore.bookingState = "DISPATCHING";

        const acceptRes = await request(app).patch(`/api/v1/bookings/${bookingStore._id}/accept`).send({});
        expect(acceptRes.status).toBe(200);

        const enRouteRes = await request(app).patch(`/api/v1/bookings/${bookingStore._id}/en-route`).send({});
        expect(enRouteRes.status).toBe(200);

        const arrivedRes = await request(app).patch(`/api/v1/bookings/${bookingStore._id}/arrived`).send({});
        expect(arrivedRes.status).toBe(200);

        const diagnosisRes = await request(app)
            .post(`/api/v1/bookings/${bookingStore._id}/diagnosis`)
            .send({
                issues: ["Noise from engine"],
                inspectionFeeFinal: 399,
                services: [{ customServiceName: "Engine check", quotedPrice: 1200 }],
            });
        expect(diagnosisRes.status).toBe(200);

        const approveRes = await request(app)
            .post(`/api/v1/bookings/${bookingStore._id}/approve-services`)
            .send({ approvedIndexes: [0], rejectedIndexes: [] });
        expect(approveRes.status).toBe(200);

        const completeRes = await request(app)
            .post(`/api/v1/bookings/${bookingStore._id}/complete`)
            .send({ serviceAmount: 1200, inspectionAmount: 0, paymentMode: "UPI" });
        expect(completeRes.status).toBe(200);
        expect(bookingStore.bookingState).toBe("COMPLETED");
    });

    test("invalid state transition is rejected", async () => {
        bookingStore.bookingState = "VENDOR_ASSIGNED";

        const completeRes = await request(app)
            .post(`/api/v1/bookings/${bookingStore._id}/complete`)
            .send({ serviceAmount: 1000 });

        expect(completeRes.status).toBe(409);
    });
});
