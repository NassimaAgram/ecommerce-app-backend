const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');

// Create a new order
const createOrder = async (req, res) => {
    try {
        const { products } = req.body;
        const userId = req.user.userId;  
        
        const user = await User.findById(userId);

        let totalAmount = 0;
        for (const item of products) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product} not found` });
            }
            if (item.quantity > product.quantity) {
                return res.status(400).json({ message: `Not enough quantity for product ${product.name}` });
            }
            totalAmount += item.quantity * product.price;
        }
        const newOrder = new Order({ user, products, totalAmount });
        await newOrder.save();

        // Reduce product quantities
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            });
        }

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update an order by ID
const updateOrder = async (req, res) => {
    try {
        const { products } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Restore previous product quantities
        for (const item of order.products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: item.quantity }
            });
        }

        let totalAmount = 0;
        for (const item of products) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product} not found` });
            }
            if (item.quantity > product.quantity) {
                return res.status(400).json({ message: `Not enough quantity for product ${product.name}` });
            }
            totalAmount += item.quantity * product.price;
        }
        order.products = products;
        order.totalAmount = totalAmount;
        await order.save();

        // Reduce new product quantities
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: -item.quantity }
            });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete an order by ID
const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Restore product quantities
        for (const item of order.products) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { quantity: item.quantity }
            });
        }

        res.status(200).json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all orders
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('user').populate('products.product');
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get a single order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user').populate('products.product');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};
