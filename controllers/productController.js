const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
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
        res.status(500).json({error: error.message});
    }
};

const getOneProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if(!product) {
            return res.status(404).json({ error: "Product not found"});
        }

        res.status(200).json({ product: product});
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

const createProduct = async (req, res) => {
    try {
        const {name, description, price, stock, category} = req.body;
        
        if(!name || !description || !price || !stock || !category) {
            return res.status(400).json({message: "All fields are required"});
        }

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
        res.status(500).json({ error: error.message});
    }
};

const updateProduct = async (req, res) => {
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
        res.status(500).json({ error: error.message});
    }
};

const deleteProduct = async (req, res) => {
    try {
                
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);

        if(!deletedProduct) {
            return res.status(404).json({ message: " Not found"});
        }

        res.status(200).json({message: "product deleted successfully"});
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
};

module.exports = {
    getAllProducts,
    getOneProduct,
    createProduct,
    updateProduct,
    deleteProduct,
};