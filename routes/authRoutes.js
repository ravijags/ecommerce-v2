const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authLimiter } = require("../middleware/rateLimiter");

const { register, login, forgotPassword, resetPassword } = require("../controllers/authController");

const registerValidation = [
    body("name")
      .notEmpty().withMessage("Name is required")
      .isLength({ min: 2}).withMessage("Name must be at least 2 characters")
      .isLength({ max: 50}).withMessage("Name must be less than 50 characters"),
    
    body("email")
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email"),
    
    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 6 }).withMessage("Password must be atleast 6 characters "),
];

const loginValidation = [
    body("email")
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Please enter a valid email"),

    body("password")
      .notEmpty().withMessage("Password is required"),

];

router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;