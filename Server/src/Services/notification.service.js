import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import { logger } from "../Utils/logger.js";
import User from "../Models/User.model.js";
import { Vendor } from "../Models/Vendor.model.js";

const getTransporter = () => nodemailer.createTransport({
    host: process.env.ILTRAP_SMTP_HOST,
    port: parseInt(process.env.ILTRAP_SMTP_PORT),
    auth: {
        user: process.env.ILTRAP_SMTP_USER,
        pass: process.env.ILTRAP_SMTP_PASS,
    },
});

const mailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "AutoServe",
        link: process.env.CORS_ORIGIN || "http://localhost:5173",
    },
});

const sendEmail = async ({ to, subject, body }) => {
    const emailHtml = mailGenerator.generate(body);
    const emailText = mailGenerator.generatePlaintext(body);

    const transporter = getTransporter();
    await transporter.sendMail({
        from: `"AutoServe" <${process.env.ILTRAP_SMTP_USER}>`,
        to,
        subject,
        html: emailHtml,
        text: emailText,
    });
};

const buildUserEmailPayload = (event, payload) => {
    const bookingId = payload?.bookingId || "N/A";

    if (event === "BOOKING_ACCEPTED") {
        return {
            subject: "Your vendor is on the way",
            body: {
                body: {
                    name: "AutoServe User",
                    intro: "Your booking has been accepted.",
                    action: {
                        instructions: "Track the booking in your dashboard:",
                        button: {
                            color: "#22BC66",
                            text: "Open AutoServe",
                            link: process.env.CORS_ORIGIN || "http://localhost:5173",
                        },
                    },
                    outro: `Booking ID: ${bookingId}`,
                },
            },
        };
    }

    if (event === "VENDOR_ARRIVED") {
        return {
            subject: "Your vendor has arrived",
            body: {
                body: {
                    name: "AutoServe User",
                    intro: "Your vendor has arrived at your location.",
                    outro: `Booking ID: ${bookingId}`,
                },
            },
        };
    }

    if (event === "DIAGNOSIS_READY") {
        return {
            subject: "Diagnosis is ready, please review and approve",
            body: {
                body: {
                    name: "AutoServe User",
                    intro: "Diagnosis has been submitted. Please review and approve to proceed.",
                    outro: `Booking ID: ${bookingId}`,
                },
            },
        };
    }

    if (event === "INSPECTION_PAYMENT_RECEIVED") {
        return {
            subject: "Inspection payment confirmed",
            body: {
                body: {
                    name: "AutoServe User",
                    intro: "Your inspection payment has been successfully received.",
                    outro: `Booking ID: ${bookingId}`,
                },
            },
        };
    }

    return null;
};

const buildVendorEmailPayload = (event, payload) => {
    const bookingId = payload?.bookingId || "N/A";

    if (event === "NEW_BOOKING") {
        return {
            subject: "A new booking is available near you",
            body: {
                body: {
                    name: "AutoServe Partner",
                    intro: "A new nearby booking is available for acceptance.",
                    outro: `Booking ID: ${bookingId}`,
                },
            },
        };
    }

    if (event === "PAYMENT_RECEIVED") {
        return {
            subject: "Payment received for your service",
            body: {
                body: {
                    name: "AutoServe Partner",
                    intro: "Payment has been received for your service.",
                    outro: `Booking ID: ${bookingId}`,
                },
            },
        };
    }

    return null;
};

const notifyUser = async (userId, event, payload = {}) => {
    try {
        const user = await User.findById(userId).select("email fullname");
        if (!user?.email) {
            logger.warn("notifyUser skipped: recipient email not found", { userId, event });
            return false;
        }

        const emailPayload = buildUserEmailPayload(event, payload);
        if (!emailPayload) {
            logger.info("notifyUser skipped: unsupported event", { userId, event });
            return false;
        }

        await sendEmail({
            to: user.email,
            subject: emailPayload.subject,
            body: emailPayload.body,
        });
        logger.info("notifyUser sent", { userId, event });
        return true;
    } catch (error) {
        logger.error("notifyUser failed", { userId, event, error: error?.message || error });
        return false;
    }
};

const notifyVendor = async (vendorId, event, payload = {}) => {
    try {
        const vendor = await Vendor.findById(vendorId).select("email fullname shopName");
        if (!vendor?.email) {
            logger.warn("notifyVendor skipped: recipient email not found", { vendorId, event });
            return false;
        }

        const emailPayload = buildVendorEmailPayload(event, payload);
        if (!emailPayload) {
            logger.info("notifyVendor skipped: unsupported event", { vendorId, event });
            return false;
        }

        await sendEmail({
            to: vendor.email,
            subject: emailPayload.subject,
            body: emailPayload.body,
        });
        logger.info("notifyVendor sent", { vendorId, event });
        return true;
    } catch (error) {
        logger.error("notifyVendor failed", { vendorId, event, error: error?.message || error });
        return false;
    }
};

export { notifyUser, notifyVendor };
