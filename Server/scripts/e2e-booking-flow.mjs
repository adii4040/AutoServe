import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import User from "../src/Models/User.model.js";
import { Vendor } from "../src/Models/Vendor.model.js";
import { Booking } from "../src/Models/Booking.model.js";

dotenv.config();

const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${process.env.PORT || 8002}/api/v1`;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET_KEY || process.env.ACCESS_TOKEN_SECRET;
const RAZORPAY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const USER_EMAIL = "e2e.user@autoserve.test";
const USER_PHONE = "9876500001";
const USER_PASSWORD = "Aa@12345";

const VENDOR_EMAIL = "e2e.vendor@autoserve.test";
const VENDOR_PHONE = "9876500002";
const VENDOR_PASSWORD = "Aa@12345";

const ACTIVE_BOOKING_STATES = [
  "CREATED",
  "DISPATCHING",
  "VENDOR_ASSIGNED",
  "VENDOR_EN_ROUTE",
  "INSPECTION_IN_PROGRESS",
  "WAITING_FOR_USER_APPROVAL",
  "SERVICE_IN_PROGRESS",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = async ({ method, path, token, body }) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const parsed = contentType.includes("application/json")
    ? await response.json()
    : { raw: await response.text() };

  return {
    ok: response.ok,
    status: response.status,
    data: parsed,
  };
};

const ensureSeedData = async () => {
  if (!MONGO_URI) {
    throw new Error("Missing MONGODB_URI/MONGODB_URL in environment");
  }
  if (!ACCESS_SECRET) {
    throw new Error("Missing ACCESS_TOKEN_SECRET(_KEY) in environment");
  }

  await mongoose.connect(MONGO_URI);

  let user = await User.findOne({ email: USER_EMAIL });
  if (!user) {
    user = await User.create({
      fullname: "E2E User",
      email: USER_EMAIL,
      phone: Number(USER_PHONE),
      password: USER_PASSWORD,
      address: "Andheri West, Mumbai",
      isEmailVerified: true,
    });
  } else {
    user.fullname = "E2E User";
    user.phone = Number(USER_PHONE);
    user.address = "Andheri West, Mumbai";
    user.password = USER_PASSWORD;
    user.isEmailVerified = true;
    await user.save();
  }

  let vendor = await Vendor.findOne({ email: VENDOR_EMAIL }).select("+password");
  if (!vendor) {
    vendor = await Vendor.create({
      fullname: "E2E Vendor",
      email: VENDOR_EMAIL,
      phone: VENDOR_PHONE,
      password: VENDOR_PASSWORD,
      shopName: "E2E Garage",
      address: {
        personalAddress: "Andheri West",
        shopAddress: "Andheri West",
      },
      location: {
        type: "Point",
        coordinates: [72.8777, 19.076],
      },
      serviceCategories: ["Mechanical Service"],
      availablityStatus: "AVAILABLE",
      isOnlineVerified: true,
      isPhysicalVerified: true,
      isVerified: true,
      verificationStatus: "APPROVED",
    });
  } else {
    vendor.fullname = "E2E Vendor";
    vendor.phone = VENDOR_PHONE;
    vendor.password = VENDOR_PASSWORD;
    vendor.shopName = "E2E Garage";
    vendor.address.personalAddress = "Andheri West";
    vendor.address.shopAddress = "Andheri West";
    vendor.location = {
      type: "Point",
      coordinates: [72.8777, 19.076],
    };
    vendor.serviceCategories = ["Mechanical Service"];
    vendor.availablityStatus = "AVAILABLE";
    vendor.activeBookingId = null;
    vendor.isOnlineVerified = true;
    vendor.isPhysicalVerified = true;
    vendor.isVerified = true;
    vendor.verificationStatus = "APPROVED";
    await vendor.save();
  }

  await Booking.updateMany(
    {
      userId: user._id,
      bookingState: { $in: ACTIVE_BOOKING_STATES },
    },
    {
      $set: {
        bookingState: "CANCELLED",
        cancellation: {
          cancelledBy: "SYSTEM",
          reason: "Cancelled by E2E setup",
          penaltyApplied: false,
          cancelledAt: new Date(),
        },
      },
      $push: {
        stateHistory: {
          state: "CANCELLED",
          changedBy: "SYSTEM",
          reason: "Cancelled by E2E setup",
          timestamp: new Date(),
        },
      },
    }
  );

  await Vendor.findByIdAndUpdate(vendor._id, {
    $set: {
      activeBookingId: null,
      availablityStatus: "AVAILABLE",
    },
  });

  const userToken = jwt.sign({ _id: user._id.toString() }, ACCESS_SECRET, { expiresIn: "1h" });
  const vendorToken = jwt.sign({ _id: vendor._id.toString(), role: "VENDOR" }, ACCESS_SECRET, {
    expiresIn: "1h",
  });

  return { userToken, vendorToken };
};

const getBookingDetail = async (bookingId, userToken) => {
  const res = await api({ method: "GET", path: `/bookings/${bookingId}`, token: userToken });
  if (!res.ok) {
    throw new Error(`Failed to fetch booking detail: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data?.data?.booking;
};

const waitForState = async (bookingId, userToken, expectedState, maxAttempts = 20) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const booking = await getBookingDetail(bookingId, userToken);
    if (booking?.bookingState === expectedState) return booking;
    await sleep(1000);
  }
  const booking = await getBookingDetail(bookingId, userToken);
  throw new Error(`Timed out waiting for ${expectedState}. Current: ${booking?.bookingState}`);
};

const waitForDispatchVendors = async (bookingId, maxAttempts = 20) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const booking = await Booking.findById(bookingId).select("bookingState dispatchMeta").lean();
    const ids = (booking?.dispatchMeta?.vendorBatches || []).flat().map((id) => id?.toString());
    if (ids.length > 0) {
      return ids;
    }

    if (booking?.bookingState === "CANCELLED") {
      throw new Error("Booking got cancelled before vendor dispatch batches were formed");
    }

    await sleep(1000);
  }

  throw new Error("Timed out waiting for dispatch vendor batches");
};

const assertOk = (label, response) => {
  if (!response.ok) {
    throw new Error(`${label} failed (${response.status}): ${JSON.stringify(response.data)}`);
  }
};

const logStep = (label, details) => {
  console.log(`\\n[PASS] ${label}`);
  if (details) {
    console.log(typeof details === "string" ? details : JSON.stringify(details, null, 2));
  }
};

const run = async () => {
  const { userToken } = await ensureSeedData();

  const createBookingRes = await api({
    method: "POST",
    path: "/bookings",
    token: userToken,
    body: {
      serviceCategory: ["Mechanical Service"],
      problemDescription: "Engine noise and oil leakage",
      vehicleType: "Car",
      brand: "Honda",
      model: "City",
      coordinates: [72.8777, 19.076],
      formattedAddress: "Andheri West, Mumbai",
      landmark: "Near Metro Station",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400053",
    },
  });
  assertOk("Create booking", createBookingRes);

  const bookingId = createBookingRes.data?.data?.booking?._id;
  if (!bookingId) {
    throw new Error(`bookingId missing in create response: ${JSON.stringify(createBookingRes.data)}`);
  }
  logStep("Booking initialized", { bookingId });

  await waitForState(bookingId, userToken, "DISPATCHING", 25);
  logStep("State moved to DISPATCHING");

  const dispatchedVendorIds = await waitForDispatchVendors(bookingId, 25);
  if (!dispatchedVendorIds.length) {
    throw new Error("No dispatched vendors found for this booking");
  }

  let acceptRes = null;
  let acceptedVendorToken = null;
  let acceptedVendorId = null;

  for (const vendorId of dispatchedVendorIds) {
    const candidateToken = jwt.sign({ _id: vendorId, role: "VENDOR" }, ACCESS_SECRET, { expiresIn: "1h" });
    const candidateAcceptRes = await api({
      method: "PATCH",
      path: `/bookings/${bookingId}/accept`,
      token: candidateToken,
    });

    if (candidateAcceptRes.ok) {
      acceptRes = candidateAcceptRes;
      acceptedVendorToken = candidateToken;
      acceptedVendorId = vendorId;
      break;
    }
  }

  if (!acceptRes) {
    throw new Error(`Could not accept booking with dispatched vendors: ${JSON.stringify(dispatchedVendorIds)}`);
  }

  assertOk("Accept booking", acceptRes);
  logStep("Vendor accepted booking", {
    state: acceptRes.data?.data?.booking?.bookingState,
    vendorId: acceptedVendorId,
  });

  const enRouteRes = await api({
    method: "PATCH",
    path: `/bookings/${bookingId}/en-route`,
    token: acceptedVendorToken,
  });
  assertOk("Mark vendor en-route", enRouteRes);
  logStep("State moved to VENDOR_EN_ROUTE", { state: enRouteRes.data?.data?.booking?.bookingState });

  const locationRes = await api({
    method: "PATCH",
    path: `/bookings/${bookingId}/live-location`,
    token: acceptedVendorToken,
    body: {
      coordinates: [72.8782, 19.0771],
      source: "GPS",
    },
  });
  assertOk("Update live location", locationRes);
  logStep("Vendor live location updated");

  const trackingRes = await api({
    method: "GET",
    path: `/bookings/${bookingId}/live-tracking`,
    token: userToken,
  });
  assertOk("Get live tracking", trackingRes);
  logStep("Live tracking fetch successful", trackingRes.data?.data?.liveTracking || trackingRes.data?.data);

  const arrivedRes = await api({
    method: "PATCH",
    path: `/bookings/${bookingId}/arrived`,
    token: acceptedVendorToken,
  });
  assertOk("Mark vendor arrived", arrivedRes);
  logStep("State moved to INSPECTION_IN_PROGRESS", { state: arrivedRes.data?.data?.booking?.bookingState });

  const diagnosisRes = await api({
    method: "POST",
    path: `/bookings/${bookingId}/diagnosis`,
    token: acceptedVendorToken,
    body: {
      issues: ["Brake pads worn out", "Engine oil leak detected"],
      inspectionFeeFinal: 499,
      services: [
        { customServiceName: "Brake pad replacement", quotedPrice: 1800 },
        { customServiceName: "Engine oil seal replacement", quotedPrice: 2200 },
      ],
    },
  });
  assertOk("Submit diagnosis", diagnosisRes);
  logStep("State moved to WAITING_FOR_USER_APPROVAL", { state: diagnosisRes.data?.data?.booking?.bookingState });

  const inspectionOrderRes = await api({
    method: "POST",
    path: "/payment/create-order",
    token: userToken,
    body: {
      bookingId,
      paymentType: "inspection",
    },
  });
  assertOk("Create inspection order", inspectionOrderRes);

  const inspectionOrderId = inspectionOrderRes.data?.data?.order?.id;
  const inspectionPaymentId = `pay_inspect_${Date.now()}`;
  const inspectionSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(`${inspectionOrderId}|${inspectionPaymentId}`)
    .digest("hex");

  const verifyInspectionRes = await api({
    method: "POST",
    path: "/payment/verify",
    token: userToken,
    body: {
      bookingId,
      paymentType: "inspection",
      razorpay_order_id: inspectionOrderId,
      razorpay_payment_id: inspectionPaymentId,
      razorpay_signature: inspectionSignature,
    },
  });
  assertOk("Verify inspection payment", verifyInspectionRes);
  logStep("Inspection payment flow completed", { orderId: inspectionOrderId, paymentId: inspectionPaymentId });

  const approveRes = await api({
    method: "POST",
    path: `/bookings/${bookingId}/approve-services`,
    token: userToken,
    body: {
      approvedIndexes: [0, 1],
      rejectedIndexes: [],
    },
  });
  assertOk("Approve services", approveRes);
  logStep("State moved to SERVICE_IN_PROGRESS", { state: approveRes.data?.data?.booking?.bookingState });

  const completeRes = await api({
    method: "POST",
    path: `/bookings/${bookingId}/complete`,
    token: acceptedVendorToken,
    body: {
      inspectionAmount: 499,
      serviceAmount: 4000,
      paymentMode: "UPI",
    },
  });
  assertOk("Complete service", completeRes);
  logStep("State moved to COMPLETED", { state: completeRes.data?.data?.booking?.bookingState });

  const serviceOrderRes = await api({
    method: "POST",
    path: "/payment/create-order",
    token: userToken,
    body: {
      bookingId,
      paymentType: "service",
    },
  });
  assertOk("Create service order", serviceOrderRes);

  const serviceOrderId = serviceOrderRes.data?.data?.order?.id;
  const servicePaymentId = `pay_service_${Date.now()}`;
  const serviceSignature = crypto
    .createHmac("sha256", RAZORPAY_SECRET)
    .update(`${serviceOrderId}|${servicePaymentId}`)
    .digest("hex");

  const verifyServiceRes = await api({
    method: "POST",
    path: "/payment/verify",
    token: userToken,
    body: {
      bookingId,
      paymentType: "service",
      razorpay_order_id: serviceOrderId,
      razorpay_payment_id: servicePaymentId,
      razorpay_signature: serviceSignature,
    },
  });
  assertOk("Verify service payment", verifyServiceRes);
  logStep("Service payment flow completed", { orderId: serviceOrderId, paymentId: servicePaymentId });

  const finalBooking = await getBookingDetail(bookingId, userToken);

  console.log("\\n=== FINAL BOOKING SNAPSHOT ===");
  console.log(
    JSON.stringify(
      {
        bookingId: finalBooking._id,
        bookingState: finalBooking.bookingState,
        liveTrackingEnabled: finalBooking?.liveTracking?.isEnabled,
        inspectionPayment: finalBooking?.payments?.inspection,
        servicePayment: finalBooking?.payments?.service,
      },
      null,
      2
    )
  );

  console.log("\\nE2E booking API flow completed successfully.");
};

run()
  .catch((error) => {
    console.error("\\nE2E booking API flow failed.");
    console.error(error?.stack || error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
