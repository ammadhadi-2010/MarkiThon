const { Op } = require('sequelize');
const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');
const SupplierLedger = require('../models/SupplierLedger');
const { toNum } = require('./profit');

async function revertVoucherStock(billNo, transaction) {
    const ref = String(billNo || '').trim();
    if (!ref) return;
    const logs = await StockHistory.findAll({
        where: {
            type: 'Purchase',
            [Op.or]: [{ referenceNumber: ref }, { ref }]
        },
        transaction
    });
    for (const log of logs) {
        const pid = log.ProductId || log.productId;
        const product = pid ? await Product.findByPk(pid, { transaction }) : null;
        const qty = toNum(log.quantityChange ?? log.quantity);
        if (product) {
            product.stockMeters = Math.max(0, toNum(product.stockMeters) - qty);
            await product.save({ transaction });
        }
        await log.destroy({ transaction });
    }
    await SupplierLedger.destroy({ where: { ref }, transaction });
}

module.exports = { revertVoucherStock };
