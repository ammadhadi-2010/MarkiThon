const StockVoucher = require('../models/StockVoucher');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { serializeVoucher } = require('../utils/stockVoucher');
const { backfillVouchers } = require('./voucherBackfill');
const { isDbReady, voucherListError } = require('../config/dbState');
const { activeShopId } = require('../utils/shopScope');

function safeSerialize(row) {
    try {
        return serializeVoucher(row);
    } catch (error) {
        const json = row && row.toJSON ? row.toJSON() : (row || {});
        return {
            id: json.id,
            date: json.receivedAt,
            billNo: json.billNo || '-',
            supplierId: json.supplierId,
            supplierName: json.supplierName || '-',
            productId: json.productId,
            productTitle: json.productTitle || '-',
            colors: '-',
            qty: json.quantity || 0,
            unit: json.stockUnit || 'Meter',
            total: json.total || 0,
            amountPaid: json.amountPaid || 0,
            status: 'Unpaid',
            paymentMode: json.paymentMode,
            payMethod: json.payMethod,
            purchasePrice: json.purchasePrice || 0,
            wholesalePrice: json.wholesalePrice || 0,
            retailPrice: json.retailPrice || 0,
            sellUnit: json.sellUnit || 'Gaz',
            variants: []
        };
    }
}

async function enrichVoucher(row) {
    const item = safeSerialize(row);
    if (!item) return null;
    try {
        if ((!item.supplierName || item.supplierName === '-') && item.supplierId) {
            const supplier = await Supplier.findByPk(item.supplierId);
            if (supplier) item.supplierName = supplier.name || '-';
        }
        if ((!item.productTitle || item.productTitle === '-') && item.productId) {
            const product = await Product.findByPk(item.productId);
            if (product) item.productTitle = product.title || '-';
        }
    } catch (error) {
        console.error('Receipt enrich skipped', error.message);
    }
    if (!Array.isArray(item.variants)) item.variants = [];
    return item;
}

async function listReceiptRows() {
    if (!isDbReady()) {
        const err = new Error('Database is still starting.');
        err.code = 'DB_STARTING';
        throw err;
    }
    try {
        await backfillVouchers();
    } catch (error) {
        console.error('Voucher backfill skipped', error.message);
    }
    const rows = await StockVoucher.findAll({
        where: { ShopId: await activeShopId() },
        order: [['receivedAt', 'DESC'], ['createdAt', 'DESC']],
        limit: 200
    });
    const vouchers = [];
    for (const row of rows || []) {
        const item = await enrichVoucher(row);
        if (item) vouchers.push(item);
    }
    return vouchers;
}

exports.listVouchers = async (req, res) => {
    try {
        const vouchers = await listReceiptRows();
        res.json(vouchers);
    } catch (error) {
        const body = voucherListError(error);
        if (error.code === 'DB_STARTING') {
            body.code = 'DB_STARTING';
            body.message = 'Database is still starting. Retrying stock receipts.';
        }
        console.error('GET stock receipts failed', body);
        res.status(503).json(body);
    }
};

exports.getVoucher = async (req, res) => {
    try {
        if (!isDbReady()) {
            return res.status(503).json(voucherListError(new Error('Database is still starting.')));
        }
        const row = await StockVoucher.findByPk(req.params.id);
        if (!row) return res.status(404).json({ ok: false, message: 'Voucher was not found.' });
        res.json(await enrichVoucher(row));
    } catch (error) {
        res.status(500).json(voucherListError(error));
    }
};
