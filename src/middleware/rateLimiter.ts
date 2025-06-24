import rateLimit from 'express-rate-limit';

// Create a rate limiter for GST verification - 5 requests per day per IP
export const gstRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: 'Too many GST verification requests from this IP. Please try again after 24 hours.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
}); 