const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { sendWelcomeEmail } = require("../utils/emailService");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/emailService");

const register = async (req, res, next) => {
   try{
     

     const errors = validationResult(req);
     if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
     }
     
    const { name, email, password } = req.body;
     
     const existingUser = await User.findOne({ email });
     if(existingUser) {
       return res.status(400).json({error: "email already exists"})
     }

     const hashedPassword = await bcrypt.hash(password, 10);

     const newUser = new User({
        name,
        email,
        password: hashedPassword,
     })
     
     await newUser.save();

     try {
        await sendWelcomeEmail(name, email);
     } catch (emailError) {
        console.log("Welcome email failed:", emailError.message);
     }

     res.status(201).json({message: "✔ Registered successfully!"});
   } catch(error) {
    next(error);
   }
};

const login = async (req, res, next) => {
    try {
         

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }
    
    const {email, password} = req.body;
    
    const user = await User.findOne({ email});

    if(!user) {
        return res.status(404).json({message: "user not found"})
    } else {
        const isMatch = await bcrypt.compare(password, user.password);
        
        if(!isMatch) {
            return res.status(401).json({ error: "Wrong password"})
        }
        const token = jwt.sign(
            { id: user._id, name: user.name, role:user.role},
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            message: "Login successful",
            token: token,
        });
        
    }
} catch(error) {
    next(error);
}
    
};

const forgotPassword = async (req, res, next) => {
    try {
        // Temporary debug
        console.log("EMAIL_USER:", process.env.EMAIL_USER);
        console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
        
        const { email } = req.body;

        if(!email) {
            return res.status(400).json({ error: "Please provide email"});
        }

        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ error: "No user found with this email"});
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetUrl = `http://localhost:3000/api/auth/reset-password/${resetToken}`;

        try {
            await sendPasswordResetEmail(user.name, user.email, resetUrl);
            res.status(200).json({
                message: "Password reset email sent"
            });
        } catch (emailError) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ error: "Email could not be sent"});
        }
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password }  = req.body;

        if(!password) {
            return res.status(400).json({ error: "Please provide new password"});
        }

        if(password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters"});
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpire: { $gt: Date.now()},
        });

        if(!user) {
            return res.status(400).json({error: "Invalid or expired reset token"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        
        res.status(200).json({ message: "Password reset successfully"});
    } catch (error) {
        next(error);
    }
}

module.exports = { register, login, forgotPassword, resetPassword};

   