const { Op } = require('sequelize');
const StoreOrder = require('../models/StoreOrder');
const { publicBuyer } = require('../utils/buyerToken');

function orderCard(row) {
    const details = row.details || {};
    const items = Array.isArray(row.items) ? row.items : [];
    return {
        id: row.id,
        orderNumber: row.orderNumber,
        status: row.status,
        payment: row.payment,
        total: row.total,
        createdAt: row.createdAt,
        items: items.map((item) => ({
            title: item.title,
            qty: item.qty,
            total: item.total
        })),
        delivery: {
            address: details.address || '',
            method: details.deliveryMethod || '',
            eta: details.eta || '',
            trackingNumber: details.trackingNumber || '',
            charges: Number(details.deliveryCharges || 0)
        }
    };
}

async function me(req, res) {
    res.json({ buyer: publicBuyer(req.buyer) });
}

async function updateMe(req, res) {
    const buyer = req.buyer;
    const name = String(req.body.name || '').trim();
    if (name) buyer.name = name.slice(0, 80);
    const prefs = Object.assign({ notifyOrders: true, wishlist: [], deliveryNote: '' }, buyer.preferences || {});
    if (typeof req.body.notifyOrders === 'boolean') prefs.notifyOrders = req.body.notifyOrders;
    if (typeof req.body.deliveryNote === 'string') prefs.deliveryNote = req.body.deliveryNote.slice(0, 240);
    if (Array.isArray(req.body.wishlist)) {
        prefs.wishlist = req.body.wishlist.map((id) => String(id)).filter(Boolean).slice(0, 40);
    }
    buyer.preferences = prefs;
    buyer.changed('preferences', true);
    await buyer.save();
    res.json({ buyer: publicBuyer(buyer) });
}

async function orders(req, res) {
    const match = [{ buyerId: req.buyer.id }];
    if (req.buyer.phone) match.push({ customerPhone: req.buyer.phone });
    const rows = await StoreOrder.findAll({
        where: { [Op.or]: match },
        order: [['createdAt', 'DESC']],
        limit: 20
    });
    res.json({ orders: rows.map(orderCard) });
}

module.exports = { me, updateMe, orders };
