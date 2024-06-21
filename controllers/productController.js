const Product = require('../models/productModel');

// Create a new product
const createProduct = async (req, res) => {
    try {
        const { name, price, description, quantity } = req.body;
        const newProduct = new Product({ name, price, description, quantity });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Recherche de produits avec pagination
const searchProducts = async (req, res) => {
    try {
        const { query, category, page = 1, limit = 10 } = req.query;

        // Construction du filtre de recherche
        let filter = {};
        if (query) {
            filter.$text = { $search: query };
        }
        if (category) {
            filter.category = category;
        }

        const products = await Product.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .exec();

        const count = await Product.countDocuments(filter);

        res.status(200).json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update a product
const updateProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { name, price, description },
            { new: true }
        );
        if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(updatedProduct);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createProduct,
    searchProducts,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
