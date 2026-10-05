const Sale = require('../models/Sale');
const Product = require('../models/Product');
const { activeShopId, sameShop } = require('../utils/shopScope');

// Create New Bill & Deduct Stock
exports.createSale = async (req, res) => {
    try {
        const { customerName, customerPhone, items, paidAmount } = req.body; 
        // items array format: [{ productId: 1, meters: 10, rate: 500 }]

        let totalAmount = 0;
        const shopId = await activeShopId();

        // Calculate Total & Check Stock
        for (let item of items) {
            const product = await Product.findByPk(item.productId);
            if (product && !sameShop(product, shopId)) {
                return res.status(403).json({ message: 'You can only bill products from this shop.' });
            }
            if (!product) {
                return res.status(404).json({ message: `Product ID ${item.productId} nahi mila.` });
            }
            if (product.stockMeters < item.meters) {
                return res.status(400).json({ message: `${product.title} ka stock kam hai! Available: ${product.stockMeters}m` });
            }
            totalAmount += item.meters * item.rate;
        }

        const dueAmount = totalAmount - paidAmount;

        // Save Sale Record
        const sale = await Sale.create({
            customerName,
            customerPhone,
            totalAmount,
            paidAmount,
            dueAmount
        });

        // Deduct Stock from Products
        for (let item of items) {
            const product = await Product.findByPk(item.productId);
            if (!product || !sameShop(product, shopId)) {
                return res.status(403).json({ message: 'You can only bill products from this shop.' });
            }
            product.stockMeters -= item.meters;
            await product.save();
        }

        res.status(201).json({ message: 'Bill successfully generate ho gaya!', sale });
    } catch (error) {
        res.status(500).json({ message: 'Error generating sale', error: error.message });
    }
};

// Get All Sales History
exports.getSales = async (req, res) => {
    try {
        const sales = await Sale.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sales', error: error.message });
    }
};