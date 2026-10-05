const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Shop = require('../models/Shop');

// 1. Shopkeeper Signup / Register
exports.registerShop = async (req, res) => {
    try {
        const { shopName, ownerName, phone, password } = req.body;

        // Check if shop already exists
        const existingShop = await Shop.findOne({ where: { phone } });
        if (existingShop) {
            return res.status(400).json({ message: 'Is phone number par pehle se account bana hua hai.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new Shop
        const newShop = await Shop.create({
            shopName,
            ownerName,
            phone,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'Shop successfully register ho gayi hai!',
            shopId: newShop.id
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// 2. Shopkeeper Login
exports.loginShop = async (req, res) => {
    try {
        const { phone, password } = req.body;

        // Find Shop by phone
        const shop = await Shop.findOne({ where: { phone } });
        if (!shop) {
            return res.status(404).json({ message: 'Dukan nahi mili. Sahi phone number daalein.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, shop.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Galat password!' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { shopId: shop.id, phone: shop.phone },
            process.env.JWT_SECRET || 'markithon_secret',
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: 'Login successful!',
            token,
            shop: {
                id: shop.id,
                shopName: shop.shopName,
                ownerName: shop.ownerName
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};