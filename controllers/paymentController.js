const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");


const createOrder = async (req, res, next) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if(!order) {
            return res.status(404).json({error: "Order is not found"});
        }

        if(order.user.toString() !== req.user.id) {
            return res.status(401).json({ error: "Not authorized"});
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const razorpayOrder = await razorpay.orders.create({
            amount: order.totalAmount *100,
            currency: "INR",
            receipt: orderId,
        });

        res.status(200).json({
            success: true,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (error) {
        next(error);
    }
};

const verifyPayment = async (req, res, next) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;


        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
          .update(body)
          .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ error: "Invalid payment signature"});
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                paymentId: razorpayPaymentId,
                razorpayOrderId: razorpayOrderId,
                paymentStatus: "paid",
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Payment verified succesfully",
            order: order,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder, verifyPayment };