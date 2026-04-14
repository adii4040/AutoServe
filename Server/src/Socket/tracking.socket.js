import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { Booking } from "../Models/Booking.model.js";
import { BOOKING_ROOM_PREFIX } from "../Constants/booking.constants.js";
import { logger } from "../Utils/logger.js";

let trackingNamespace = null;

const resolveToken = (socket) => {
    const authToken = socket.handshake?.auth?.token;
    if (authToken) return authToken;

    const authorization = socket.handshake?.headers?.authorization || "";
    if (authorization.startsWith("Bearer ")) {
        return authorization.split(" ")[1];
    }

    return null;
};

const bookingRoom = (bookingId) => `${BOOKING_ROOM_PREFIX}${bookingId}`;

const initTrackingSocket = (io) => {
    trackingNamespace = io.of("/tracking");

    trackingNamespace.use((socket, next) => {
        try {
            const token = resolveToken(socket);
            if (!token) return next(new Error("Unauthorized: missing token"));

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
            if (!decoded?._id || decoded?.role === "VENDOR") {
                return next(new Error("Unauthorized: only users can subscribe to tracking"));
            }

            socket.userId = decoded._id;
            next();
        } catch (error) {
            next(new Error("Unauthorized: invalid token"));
        }
    });

    trackingNamespace.on("connection", (socket) => {
        socket.on("tracking:join", async (payload = {}, ack) => {
            try {
                const { bookingId } = payload;
                if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
                    if (ack) ack({ success: false, message: "Invalid bookingId" });
                    return;
                }

                const booking = await Booking.findOne({ _id: bookingId, userId: socket.userId }).select("_id");
                if (!booking) {
                    if (ack) ack({ success: false, message: "Unauthorized booking room access" });
                    return;
                }

                socket.join(bookingRoom(bookingId));
                if (ack) ack({ success: true, room: bookingRoom(bookingId) });
            } catch (error) {
                logger.error("tracking:join failed", { error: error.message });
                if (ack) ack({ success: false, message: "Unable to join tracking room" });
            }
        });

        socket.on("tracking:leave", ({ bookingId } = {}, ack) => {
            if (!bookingId) {
                if (ack) ack({ success: false, message: "bookingId required" });
                return;
            }

            socket.leave(bookingRoom(bookingId));
            if (ack) ack({ success: true });
        });
    });

    return trackingNamespace;
};

const emitLocationUpdate = (bookingId, payload) => {
    if (!trackingNamespace) return;
    trackingNamespace.to(bookingRoom(bookingId)).emit("location:update", payload);
};

const emitVendorArrived = (bookingId, payload) => {
    if (!trackingNamespace) return;
    trackingNamespace.to(bookingRoom(bookingId)).emit("vendor:arrived", payload);
};

export { initTrackingSocket, emitLocationUpdate, emitVendorArrived, bookingRoom };
