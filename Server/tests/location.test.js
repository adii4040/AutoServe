import { describe, test, expect, beforeAll, afterAll, jest } from "@jest/globals";
import http from "http";
import { Server } from "socket.io";
import { io as clientIO } from "socket.io-client";

const emitLocationUpdateMock = jest.fn();

jest.unstable_mockModule("../src/Models/Booking.model.js", () => ({
    Booking: {
        findOne: jest.fn(async () => ({ _id: "507f1f77bcf86cd799439013" })),
    },
}));

const trackingSocketModule = await import("../src/Socket/tracking.socket.js");

describe("location tracking", () => {
    test("unauthorized user cannot join tracking namespace", async () => {
        const server = http.createServer();
        const ioServer = new Server(server);
        trackingSocketModule.initTrackingSocket(ioServer);

        await new Promise((resolve) => server.listen(0, resolve));
        const { port } = server.address();

        const result = await new Promise((resolve) => {
            const socket = clientIO(`http://localhost:${port}/tracking`, {
                transports: ["websocket"],
                reconnection: false,
                auth: {},
            });

            socket.on("connect_error", (err) => {
                resolve(err.message);
                socket.close();
            });
        });

        expect(result).toMatch(/Unauthorized/);

        ioServer.close();
        server.close();
    });
});
