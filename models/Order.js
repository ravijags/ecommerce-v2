const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    items: [
        {
            product:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },

            quantity: {
                type: Number,
                required: true
        },
        price: {
            type: Number,
        }
     }],
    
     totalAmount: {
        type: Number,
        required: true
     },

     status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
     },
    
     shippingAddress: {
        type: String,
        required: true,
     },
     paymentId: {
        type: String,
        default: "",
     },
     razorpayOrderId: {
        type: String,
        default: "",
     },
     paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending",
     },
}, { timestamps: true});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;