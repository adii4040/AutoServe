import { describe, test, expect, beforeAll, beforeEach, jest } from "@jest/globals";
import express from "express";
import request from "supertest";
import crypto from "crypto";

const bookingDoc = {
    _id: "507f1f77bcf86cd799439012",
    userId: "user-1",
    vendorId: "vendor-1",
    inspection: {
        inspectionFeeFinal: 399,
    },
    serviceExecution: {
        finalServices: [{ finalPrice: 500 }, { finalPrice: 700 }],
    },
    bookingState: "COMPLETED",
    payment: {
        orderId: null,
        paymentId: null,
        status: "CREATED",
        amount: 0,
        paidAt: null,
    },
    payments: {
        inspection: { status: "UNPAID", amount: 0, paidAt: null },
        service: { status: "UNPAID", amount: 0, paidAt: null },
    },
    save: jest.fn(async function save() {
        return this;
    }),
};

const createOrderMock = jest.fn(async () => ({
    id: "order_123",
    amount: 120000,
    currency: "INR",
    receipt: "booking_507f1f77bcf86cd799439012",
    status: "created",
}));

const fetchOrderMock = jest.fn(async () => ({
    notes: { paymentType: "inspection" },
}));

jest.unstable_mockModule("razorpay", () => ({
    default: class Razorpay {
        constructor() {
            this.orders = { create: createOrderMock, fetch: fetchOrderMock };
            this.webhooks = {};
        }
    },
}));

jest.unstable_mockModule("../src/Models/Booking.model.js", () => ({
    Booking: {
        findOne: jest.fn(async (query) => {
            if (query._id === "missing") return null;
            if (query["payment.orderId"] === "order_missing") return null;
            return bookingDoc;
        }),
    },
}));

jest.unstable_mockModule("../src/Services/notification.service.js", () => ({
    notifyVendor: jest.fn(async () => true),
}));

const { createOrder, verifyPayment, paymentWebhook } = await import("../src/Controllers/payment.controller.js");

let app;

beforeAll(() => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_123";
    process.env.RAZORPAY_KEY_SECRET = "razorpay_secret";

    app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
        req.user = { _id: "user-1" };
        next();
    });
    app.post("/payment/create-order", createOrder);
    app.post("/payment/verify", verifyPayment);
    app.use((req, _res, next) => {
        if (req.path === "/payment/webhook") {
            req.rawBody = JSON.stringify(req.body || {});
        }
        next();
    });
    app.post("/payment/webhook", paymentWebhook);
});

beforeEach(() => {
    jest.clearAllMocks();
    bookingDoc.payment = {
        orderId: null,
        paymentId: null,
        status: "CREATED",
        amount: 0,
        paidAt: null,
    };
    bookingDoc.payments.inspection = { status: "UNPAID", amount: 0, paidAt: null };
    bookingDoc.payments.service = { status: "UNPAID", amount: 0, paidAt: null };
    bookingDoc.inspection.inspectionFeeFinal = 399;
    bookingDoc.bookingState = "COMPLETED";
    fetchOrderMock.mockResolvedValue({ notes: { paymentType: "inspection" } });
});

describe("payment controller", () => {
    test("create-order returns order shape", async () => {
        const res = await request(app).post("/payment/create-order").send({ bookingId: bookingDoc._id, paymentType: "service" });

        expect(res.status).toBe(201);
        expect(res.body.data.order).toEqual(
            expect.objectContaining({ id: "order_123", amount: 120000, currency: "INR" })
        );
        expect(createOrderMock).toHaveBeenCalled();
        expect(createOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 120000,
                notes: expect.objectContaining({ paymentType: "service" }),
            })
        );
    });

    test("create-order with inspection uses inspection fee", async () => {
        bookingDoc.bookingState = "WAITING_FOR_USER_APPROVAL";

        createOrderMock.mockResolvedValueOnce({
            id: "order_456",
            amount: 39900,
            currency: "INR",
            receipt: "inspection_507f1f77bcf86cd799439012",
            status: "created",
        });

        const res = await request(app).post("/payment/create-order").send({ bookingId: bookingDoc._id, paymentType: "inspection" });

        expect(res.status).toBe(201);
        expect(createOrderMock).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 39900,
                notes: expect.objectContaining({ paymentType: "inspection" }),
            })
        );
    });

    test("paying inspection twice returns 400", async () => {
        bookingDoc.payments.inspection.status = "PAID";

        const res = await request(app).post("/payment/create-order").send({ bookingId: bookingDoc._id, paymentType: "inspection" });

        expect(res.status).toBe(400);
        expect(createOrderMock).not.toHaveBeenCalled();
    });

    test("paying service twice returns 400", async () => {
        bookingDoc.payments.service.status = "PAID";

        const res = await request(app).post("/payment/create-order").send({ bookingId: bookingDoc._id, paymentType: "service" });

        expect(res.status).toBe(400);
        expect(createOrderMock).not.toHaveBeenCalled();
    });

    test("verify succeeds with valid signature", async () => {
        const orderId = "order_123";
        const paymentId = "pay_123";
        const signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        const res = await request(app).post("/payment/verify").send({
            bookingId: bookingDoc._id,
            paymentType: "service",
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
        });

        expect(res.status).toBe(200);
        expect(bookingDoc.payment.status).toBe("PAID");
        expect(bookingDoc.payments.service.status).toBe("PAID");
    });

    test("verify with inspection updates inspection payment", async () => {
        const orderId = "order_123";
        const paymentId = "pay_789";
        const signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest("hex");

        const res = await request(app).post("/payment/verify").send({
            bookingId: bookingDoc._id,
            paymentType: "inspection",
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
        });

        expect(res.status).toBe(200);
        expect(bookingDoc.payments.inspection.status).toBe("PAID");
        expect(bookingDoc.payments.service.status).toBe("UNPAID");
    });

    test("verify fails with tampered signature", async () => {
        const res = await request(app).post("/payment/verify").send({
            bookingId: bookingDoc._id,
            paymentType: "service",
            razorpay_order_id: "order_123",
            razorpay_payment_id: "pay_123",
            razorpay_signature: "bad_signature",
        });

        expect(res.status).toBe(400);
    });

    test("webhook payment.captured updates inspection payment via order notes", async () => {
        const payload = {
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: "pay_webhook_1",
                        order_id: "order_123",
                        amount: 39900,
                    },
                },
            },
        };
        const raw = JSON.stringify(payload);
        const signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(raw)
            .digest("hex");

        const res = await request(app)
            .post("/payment/webhook")
            .set("x-razorpay-signature", signature)
            .set("Content-Type", "application/json")
            .send(raw);

        expect(res.status).toBe(200);
        expect(fetchOrderMock).toHaveBeenCalledWith("order_123");
        expect(bookingDoc.payments.inspection.status).toBe("PAID");
        expect(bookingDoc.payments.inspection.amount).toBe(399);
    });

    test("webhook returns 200 when booking is not found", async () => {
        const payload = {
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: "pay_webhook_2",
                        order_id: "order_missing",
                        amount: 5000,
                    },
                },
            },
        };
        const raw = JSON.stringify(payload);
        const signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(raw)
            .digest("hex");

        const res = await request(app)
            .post("/payment/webhook")
            .set("x-razorpay-signature", signature)
            .set("Content-Type", "application/json")
            .send(raw);

        expect(res.status).toBe(200);
    });
});
