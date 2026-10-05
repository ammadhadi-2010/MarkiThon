const { Op } = require('sequelize');
const StockHistory = require('../models/StockHistory');
const Product = require('../models/Product');
const { serializeLog } = require('../utils/stockHistory');
const { activeShopId, sameShop } = require('../utils/shopScope');

function whereProduct(productId) {
    return { [Op.or]: [{ ProductId: productId }, { productId }] };
}

exports.getProductStockHistory = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.productId);
        if (!product) return res.status(404).json({ message: 'Product not found.' });
        if (!sameShop(product, await activeShopId())) {
            return res.status(403).json({ message: 'You can only view stock for this shop.' });
        }

        const logs = await StockHistory.findAll({
            where: whereProduct(req.params.productId),
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        });

        res.status(200).json({
            product,
            logs: logs.map(serializeLog)
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock history', error: error.message });
    }
};

exports.getStockMovement = async (req, res) => {
    try {
        const shopId = await activeShopId();
        const owned = await Product.findAll({
            where: { ShopId: shopId },
            attributes: ['id']
        });
        const ids = owned.map((row) => row.id);
        const logs = ids.length ? await StockHistory.findAll({
            where: { [Op.or]: [{ ProductId: ids }, { productId: ids }] },
            order: [['date', 'DESC'], ['createdAt', 'DESC']]
        }) : [];
        res.status(200).json(logs.map(serializeLog));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stock movement', error: error.message });
    }
};
