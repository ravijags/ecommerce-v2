const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const placeOrder = async (req, res) => {
     try {
        const { shippingAddress } = req.body;

        if(!shippingAddress) {
            return res.status(400).json({message: "provide shipping address"});
        }

        const cart = await Cart.findOne(({ user: req.user.id}))
                                .populate("items.product");
        if(!cart) {
            return res.status(400).json({message: "cart is empty", items: []});
        }

        let totalAmount = 0;
        const orderItems = [];

        for( const item of cart.items) {
            const product = item.product;
            const itemTotal = product.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
            });

            await Product.findByIdAndUpdate(product._id, {
                stock: product.stock -item.quantity,
            });
        }

        const newOrder = new Order({
            user: req.user.id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            status: "pending",
        });
        await newOrder.save();

        cart.items = [];
        await cart.save();

        res.status(200).json({message: "order placed"});
     } catch(error) {
        res.status(500).json({ error: error.message});
     }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id})
            .populate("items.product")
            .sort({ createdAt: -1});
        
        res.status(200).json({ order : orders});
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const getOneOrder = async (req, res) => {
    try {
        const order  = await Order.findById(req.params.id)
                                .populate("items.product")
        if(!order) {
            return res.status(404).json({ message: "Not found"});
        }

        if(order.user.toString() !== req.user.id) {
            return res.status(401).json({ error: " not authorized"});
        }

        res.status(200).json({ order: order});
    } catch (error) {
        res.status(500).json({ error: error.message});
    }

    
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

        if(!validStatuses.includes(status)) {
            return res.status(400).json({ error: "Invalid status"});
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if(!updatedOrder) {
            return res.status(404).json({ error: "order not found"})
        }

        res.status(200).json({ order: updatedOrder});
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

module.exports = { placeOrder, getMyOrders, getOneOrder, updateOrderStatus};
