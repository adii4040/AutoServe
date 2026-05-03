import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import { logger, morganStream } from './Utils/logger.js'

const app = express()

app.use(helmet())

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const devOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
];

const allowedOrigins = [...new Set([...configuredOrigins, ...devOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(morgan('combined', { stream: morganStream }))

app.use(express.json({
  limit: "16kb",
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static('public'))
app.use(cookieParser())

//import the routes here
import healthCheckRoute from './Routes/healthCheck.route.js'
import userRoutes from './Routes/user.route.js'
import vendorRoutes from './Routes/vendor.route.js'
import bookingRoutes from './Routes/bookings.route.js'
import paymentRoutes from './Routes/payment.route.js'

app.use('/api/v1/healthcheck', healthCheckRoute)
app.use('/api/v1/user', userRoutes)
app.use('/api/v1/vendor/login', authLimiter)
app.use('/api/v1/vendor/register', authLimiter)
app.use('/api/v1/vendor/activate-account', authLimiter)
app.use('/api/v1/vendor', generalLimiter, vendorRoutes)
app.use('/api/v1/payment', paymentLimiter, paymentRoutes)
app.use('/api/v1/bookings', generalLimiter, bookingRoutes)

// Global error handler (must come after all routes)
app.use((err, req, res, next) => {
  logger.error('request_error', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
  });

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      errors: [{ field: err.path || 'id', message: 'Invalid identifier format' }],
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));

    return res.status(422).json({
      success: false,
      errors,
    });
  }

  if (err.type === 'VALIDATION_ERROR') {
    return res.status(err.statusCode || 400).json({
      success: false,
      errors: err.errors || [{ field: 'request', message: err.message || 'Validation failed' }],
    });
  }

  const statusCode = err.statusCode || 500;
  const safeMessage = statusCode >= 500 ? 'Internal Server Error' : (err.message || 'Request failed');

  return res.status(statusCode).json({
    success: false,
    message: safeMessage,
    errors: err.errors || [],
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});


export { app }


