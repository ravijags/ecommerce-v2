const Product = require("../models/Product");

const { validationResult } = require("express-validator");

const getAllProducts = async (req, res, next) => {
    try {
        const search = req.query.search || "";
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const category = req.query.category || "";
        const sort = req.query.sort || "";
        const minPrice = req.query.minPrice || 0;
        const maxPrice = req.query.maxPrice || Infinity;

        const skip = (page - 1) * limit;
        const filter = search  
          ? { name: { $regex: search, $options: "i"}} : {};
        
        if (category) {
            filter.category = category;
        }

        let sortOption = {};
        if (sort === "low") {
            sortOption = {price: 1};
        } else if ( sort === "high") {
            sortOption = {price: -1};
        }

        filter.price = { $gte: Number(minPrice), $lte: Number(maxPrice)};
        const products = await Product.find(filter)
                         .sort(sortOption)
                         .skip(skip)
                         .limit(limit);
        
        const total = await Product.countDocuments(filter);
        res.status(200).json({ 
            products: products,
            total: total,
            page: page,
            totalPages: Math.ceil(total/limit),
        });
    } catch(error) {
        next(error);
    }
};

const getOneProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if(!product) {
            return res.status(404).json({ error: "Product not found"});
        }

        res.status(200).json({ product: product});
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array()});
        }
        const {name, description, price, stock, category} = req.body;
        
        

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            category,
            createdBy: req.user.id,
        });

        await newProduct.save();

        res.status(201).json({
            message: "Product created",
            product: newProduct,
        });
    } catch (error) {
        next(error);
    }
};

const updateProduct = async (req, res, next) => {
    try {
        
        const {name, description, price, stock, category } = req.body;

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, price, stock, category },
            { new: true }
        );

        if(!updatedProduct) {
            return res.status(404).json({ message: " Product not found"});
        }
        
        res.status(200).json({
             message: " Product updated",
             product: updatedProduct            
            
            });
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
                
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if(!deletedProduct) {
            return res.status(404).json({ message: " Not found"});
        }

        res.status(200).json({message: "product deleted successfully"});
    } catch (error) {
        next(error);
    }
};

const uploadProductImage = async (req, res, next) => {
    try {
        
        if (!req.file) {
            return res.status(400).json({ error: "Please upload an image"});
        }

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: "Product not found"});
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { image: req.file.path},
            {new: true},
        );

        res.status(200).json({
            message: "Image upload successfully",
            product: updatedProduct,
        })
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllProducts,
    getOneProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
};