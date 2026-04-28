const rateLimit = require("express-rate-limit");


const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: "Too many requests, please try again after 15 minutes",
    },
    
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        error: "Too many attempts, please try again after 15 minutes",
    },

    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { generalLimiter, authLimiter };