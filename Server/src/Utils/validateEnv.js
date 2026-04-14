import { logger } from "./logger.js";

const REQUIRED_ENV_VARS = [
    "PORT",
    "MONGODB_URI",
    "ACCESS_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRY",
    "REFRESH_TOKEN_SECRET",
    "REFRESH_TOKEN_EXPIRY",
    "CORS_ORIGIN",
    "SOCKET_CORS_ORIGIN",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "ILTRAP_SMTP_HOST",
    "ILTRAP_SMTP_PORT",
    "ILTRAP_SMTP_USER",
    "ILTRAP_SMTP_PASS",
    "ZORPAY_KEY_ID",
    "ZORPAY_KEY_SECRET",
    "RAZORPAY_WEBHOOK_SECRET",
    "DISPATCH_BATCH_TIMEOUT_MS",
];

const hydrateAliases = () => {
    process.env.MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL;

    process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET_KEY;
    process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || process.env.REFRESH_TOKEN_SECRET_KEY;

    process.env.ACCESS_TOKEN_SECRET_KEY = process.env.ACCESS_TOKEN_SECRET_KEY || process.env.ACCESS_TOKEN_SECRET;
    process.env.REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY || process.env.REFRESH_TOKEN_SECRET;

    process.env.ILTRAP_SMTP_HOST = process.env.ILTRAP_SMTP_HOST || process.env.MAILTRAP_SMTP_HOST;
    process.env.ILTRAP_SMTP_PORT = process.env.ILTRAP_SMTP_PORT || process.env.MAILTRAP_SMTP_PORT;
    process.env.ILTRAP_SMTP_USER = process.env.ILTRAP_SMTP_USER || process.env.MAILTRAP_SMTP_USER;
    process.env.ILTRAP_SMTP_PASS = process.env.ILTRAP_SMTP_PASS || process.env.MAILTRAP_SMTP_PASS;

    process.env.MAILTRAP_SMTP_HOST = process.env.MAILTRAP_SMTP_HOST || process.env.ILTRAP_SMTP_HOST;
    process.env.MAILTRAP_SMTP_PORT = process.env.MAILTRAP_SMTP_PORT || process.env.ILTRAP_SMTP_PORT;
    process.env.MAILTRAP_SMTP_USER = process.env.MAILTRAP_SMTP_USER || process.env.ILTRAP_SMTP_USER;
    process.env.MAILTRAP_SMTP_PASS = process.env.MAILTRAP_SMTP_PASS || process.env.ILTRAP_SMTP_PASS;

    process.env.ZORPAY_KEY_ID = process.env.ZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    process.env.ZORPAY_KEY_SECRET = process.env.ZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

    process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.ZORPAY_KEY_ID;
    process.env.RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.ZORPAY_KEY_SECRET;

};

export const validateEnv = () => {
    hydrateAliases();

    const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        logger.error(`Missing required environment variables: ${missing.join(", ")}`);
        process.exit(1);
    }
    logger.info("Environment variables validated successfully");
};
