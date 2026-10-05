const { Op } = require('sequelize');
const Product = require('../models/Product');
const RetailBillItem = require('../models/RetailBillItem');
const WholesaleOrderItem = require('../models/WholesaleOrderItem');
const StockHistory = require('../models/StockHistory');
const StockVoucher = require('../models/StockVoucher');
const SupplierLedger = require('../models/SupplierLedger');
const { collectProductMedia, purgeUrls } = require('./purgeMedia');

async function relatedDestroy(ids) {
    await RetailBillItem.destroy({ where: { ProductId: ids } });
    await WholesaleOrderItem.destroy({ where: { ProductId: ids } });
    await StockHistory.destroy({
        where: { [Op.or]: [{ ProductId: ids }, { productId: ids }] }
    });
    await StockVoucher.destroy({ where: { productId: ids } });
    await SupplierLedger.destroy({ where: { productId: ids } });
}

async function loadPack(product) {
    if (!product) return [];
    const title = String(product.title || '').trim();
    if (!title) return [product];
    const pack = await Product.findAll({ where: { title, ShopId: product.ShopId || 1 } });
    return pack.length ? pack : [product];
}

async function purgeProductById(id) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    const pack = await loadPack(product);
    const ids = pack.map((row) => row.id);
    const urls = pack.flatMap((row) => collectProductMedia(row));
    await relatedDestroy(ids);
    await Product.destroy({ where: { id: ids } });
    await purgeUrls(urls);
    return {
        ids: ids.map(String),
        title: product.title || '',
        sku: product.sku || ''
    };
}

module.exports = { purgeProductById, loadPack, relatedDestroy };
