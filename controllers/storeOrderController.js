const StoreOrder = require('../models/StoreOrder');
const { readBuyerToken } = require('../utils/buyerToken');
const { normalizeItems, mergeDetails, packOrder } = require('../utils/storeOrderDetails');
const { resolveCustomerEmail, queueOrderEmail } = require('../utils/orderEmail');

const STATUSES = StoreOrder.STATUSES;
const PAYMENTS = StoreOrder.PAYMENTS;

function pack(row) {
    return packOrder(row, STATUSES, PAYMENTS);
}

async function nextNumber() {
    const last = await StoreOrder.findOne({ order: [['createdAt', 'DESC']] });
    const raw = last && String(last.orderNumber || '').replace(/\D/g, '');
    const n = Number(raw || 10000) + 1;
    return 'MK-' + String(n).padStart(5, '0');
}

exports.listOrders = async (req, res) => {
    try {
        const rows = await StoreOrder.findAll({ order: [['createdAt', 'DESC']] });
        res.status(200).json({ orders: rows.map(pack), statuses: STATUSES });
    } catch (error) {
        res.status(500).json({ message: 'Could not load store orders.', error: error.message });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const row = await StoreOrder.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Order not found.' });
        res.status(200).json(pack(row));
    } catch (error) {
        res.status(500).json({ message: 'Could not load order.', error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const body = req.body || {};
        const name = String(body.customerName || '').trim();
        if (!name) return res.status(400).json({ message: 'Customer name is required.' });
        const items = normalizeItems(body.items && body.items.length
            ? body.items
            : [{ title: 'Manual order', qty: body.itemCount || 1, price: body.total || 0 }]);
        const details = mergeDetails(body, items, new Date().toISOString(), {}, true);
        let buyerId = null;
        try {
            const payload = readBuyerToken(req.headers.authorization);
            if (payload) buyerId = payload.sub;
        } catch (error) {
            buyerId = null;
        }
        const orderNumber = await nextNumber();
        const row = await StoreOrder.create({
            orderNumber,
            customerName: name,
            customerPhone: String(body.customerPhone || '').trim(),
            items,
            itemCount: items.reduce((sum, item) => sum + item.qty, 0),
            total: (details.subtotal - details.discount + details.deliveryCharges) || Number(body.total) || 0,
            payment: PAYMENTS.includes(body.payment) ? body.payment : 'Paid',
            status: STATUSES.includes(body.status) ? body.status : 'New',
            note: String(body.note || '').trim(),
            details,
            buyerId,
            ShopId: 1
        });
        const placed = body.source === 'checkout';
        const email = await resolveCustomerEmail({
            email: body.customerEmail || body.email,
            customerPhone: row.customerPhone,
            buyerId,
            details
        });
        queueOrderEmail(email, {
            number: orderNumber,
            customerName: name,
            total: row.total,
            payment: row.payment,
            items,
            shopName: 'Ammad Hadi Stor'
        });
        res.status(201).json({ message: placed ? 'Order placed.' : 'Manual order created.', order: pack(row) });
    } catch (error) {
        res.status(500).json({ message: 'Could not create order.', error: error.message });
    }
};

exports.patchOrder = async (req, res) => {
    try {
        const row = await StoreOrder.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Order not found.' });
        const body = req.body || {};
        const status = STATUSES.includes(body.status) ? body.status : row.status;
        const payment = PAYMENTS.includes(body.payment) ? body.payment : row.payment;
        const note = body.note == null ? row.note : String(body.note).trim();
        const name = body.customerName != null ? String(body.customerName).trim() : row.customerName;
        const phone = body.customerPhone != null ? String(body.customerPhone).trim() : row.customerPhone;
        const items = normalizeItems(body.items || row.items);
        const details = mergeDetails(Object.assign({}, body, { status, payment, customerPhone: phone }),
            items, row.createdAt, row.details, true);
        await row.update({
            status, payment, note, customerName: name || row.customerName,
            customerPhone: phone, items, details,
            itemCount: items.reduce((sum, item) => sum + item.qty, 0),
            total: details.subtotal - details.discount + details.deliveryCharges
        });
        res.status(200).json({ message: 'Order updated.', order: pack(row) });
    } catch (error) {
        res.status(500).json({ message: 'Could not update order.', error: error.message });
    }
};
