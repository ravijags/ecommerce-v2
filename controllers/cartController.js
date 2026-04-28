const Cart = require("../models/Cart");

const Product = require("../models/Product");

const getCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id })
                               .populate("items.product");
        if(!cart) {
            return res.status(200).json({ message: "cart is empty", items: []});
        }

        res.status(200).json({cart: cart})
    } catch (error) {
        next(error);
    }
};

const addToCart = async (req, res, next) => {
    try {
        
        const { productId, quantity } = req.body;

        if(!productId || !quantity) {
            return res.status(400).json({ message: " both required"});
        }

        const product = await Product.findById(productId);
        if(!product) {
            return res.status(404).json({ error: "Product not found"});
        }

        let cart  = await Cart.findOne({ user: req.user.id});

        if(!cart) {
            cart = new Cart({
                user: req.user.id,
                items: [{ product: productId, quantity}],

            });
        } else {
            const itemIndex = cart.items.findIndex(
                (item) => item.product.toString() === productId
            );

            if(itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ product: productId, quantity});
            }
        }
        
        await cart.save();
        res.status(200).json({ message: "Added to cart", cart});

    } catch (error) {
        next(error);
    }
};

const removeFromCart = async (req, res, next) => {
    try {
        const cart = await Cart.findOne({user: req.user.id})

        if(!cart) {
            return res.status(404).json({error: "cart not found"});
        } else {
            cart.items = cart.items.filter(
                (item) => item.product.toString() !== req.params.productId
            );

            await cart.save();
            res.status(200).json({message: "item removed "});
        }
    } catch (error) {
        next(error);
    }
};

const clearCart = async (req, res, next) => {
    try {
        const cart  = await Cart.findOne({ user: req.user.id});

        if(!cart) {
            return res.status(404).json({message: "not found"});
        } else {
            cart.items = [];
            await cart.save();
            res.status(200).json({message: "cart cleared"});
        }
    } catch (error) {
        next(error);
    }
};

module.exports = { getCart, addToCart, removeFromCart, clearCart };