import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { validateEnv } from './Utils/validateEnv.js'
import { startAgenda } from './Jobs/agenda.js'
import { registerDispatchJob } from './Jobs/dispatch.job.js'
import { registerWebhookRetryJob } from './Jobs/webhookRetry.job.js'
import { registerPaymentCleanupJob } from './Jobs/paymentCleanup.job.js'

validateEnv()

import { app } from "./app.js";
import { connectDb } from "./db/db.js"
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'

import { logger } from './Utils/logger.js'
import { initTrackingSocket } from './Socket/tracking.socket.js'

const port = Number(process.env.PORT) || 8002
const server = http.createServer(app)
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:5173',
        credentials: true,
    },
})

initTrackingSocket(io)


connectDb()
    .then(async () => {

        try {
            registerDispatchJob()
            registerWebhookRetryJob()
            registerPaymentCleanupJob()
            await startAgenda()
        } catch (error) {
            logger.error('Agenda startup failed', { error: error?.message || error })
        }

        app.on('error', (err) => {
            logger.error('App connection error', { error: err?.message || err })
        })

        server.on('error', (err) => {
            if (err?.code === 'EADDRINUSE') {
                logger.error(`Port ${port} is already in use. Stop the existing process or change PORT in .env.`)
            } else {
                logger.error('HTTP server failed to start', {
                    error: err?.message || err,
                    code: err?.code,
                    port,
                })
            }
            process.exit(1)
        })

        server.listen(port, () => {
            logger.info(`Server successfully running on port:${port}`)
        })
    })
    .catch((err) => logger.error('Error connecting database', { error: err?.message || err }))

const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`)
    server.close(() => {
        logger.info('HTTP server closed')
        mongoose.connection.close(false).then(() => {
            logger.info('MongoDB connection closed')
            process.exit(0)
        }).catch((error) => {
            logger.error('Error while closing MongoDB connection', { error: error?.message || error })
            process.exit(1)
        })
    })

    setTimeout(() => {
        logger.error('Forced shutdown after timeout')
        process.exit(1)
    }, 10000)
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))




