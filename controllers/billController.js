const RetailBill = require('../models/RetailBill');
const RetailBillItem = require('../models/RetailBillItem');
const WholesaleOrder = require('../models/WholesaleOrder');
const WholesaleOrderItem = require('../models/WholesaleOrderItem');
const { productInclude, asInvoice } = require('../utils/invoiceMap');

async function loadRetail(id) {
    return RetailBill.findByPk(id, {
        include: [{ model: RetailBillItem, as: 'items', include: [productInclude] }]
    });
}

async function loadWholesale(id) {
    return WholesaleOrder.findByPk(id, {
        include: [{ model: WholesaleOrderItem, as: 'items', include: [productInclude] }]
    });
}

exports.getBill = async (req, res) => {
    try {
        const type = String(req.query.type || req.query.channel || '').toLowerCase();
        const id = req.params.id;
        let row = null;
        let channel = type;
        if (type === 'wholesale') {
            row = await loadWholesale(id);
            channel = 'wholesale';
        } else if (type === 'retail') {
            row = await loadRetail(id);
            channel = 'retail';
        } else {
            row = await loadRetail(id);
            channel = 'retail';
            if (!row) {
                row = await loadWholesale(id);
                channel = 'wholesale';
            }
        }
        if (!row) return res.status(404).json({ message: 'Bill not found.' });
        res.status(200).json(asInvoice(row, channel));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bill', error: error.message });
    }
};

module.exports.loadRetail = loadRetail;
module.exports.loadWholesale = loadWholesale;
