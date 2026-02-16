import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static('public'))
app.use(cookieParser())

//import the routes here
import healthCheckRoute from './Routes/healthCheck.route.js'
import userRoutes from './Routes/user.route.js'
import vendorRoutes from './Routes/vendor.route.js'
import bookingRoutes from './Routes/bookings.route.js'

app.use('/api/v1/healthcheck', healthCheckRoute)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/vendor', vendorRoutes)
app.use('/api/v1/bookings', bookingRoutes)

// Global error handler (must come after all routes)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res.status(statusCode).json({
    statusCode: statusCode,
    success: false,
    message,
    errors: err.errors || [],
    data: null,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});


export { app }


