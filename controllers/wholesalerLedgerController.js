const { Op } = require('sequelize');
const Wholesaler = require('../models/Wholesaler');
const WholesalerLedger = require('../models/WholesalerLedger');
const WholesaleOrder = require('../models/WholesaleOrder');

function balanceOf(entries) {
    let due = 0;
    entries.forEach((row) => {
        const amt = Number(row.amount || 0);
        if (row.type === 'SALE') due += amt;
        else due -= amt;
    });
    return due;
}

exports.withStats = async function withStats(rows) {
    const ids = rows.map((r) => r.id);
    const [ledger, orders] = await Promise.all([
        ids.length ? WholesalerLedger.findAll({ where: { wholesalerId: { [Op.in]: ids } } }) : [],
        WholesaleOrder.findAll({ attributes: ['id', 'WholesalerId', 'customerName'] })
    ]);
    return rows.map((row) => {
        const json = row.toJSON ? row.toJSON() : row;
        const mine = ledger.filter((e) => Number(e.wholesalerId) === Number(json.id));
        const bulk = orders.filter((o) =>
            Number(o.WholesalerId) === Number(json.id) || o.customerName === json.name
        );
        return {
            ...json,
            orderCount: bulk.length,
            creditBalance: balanceOf(mine)
        };
    });
};

exports.recordSale = async function recordSale({ wholesalerId, amount, ref, paid, transaction }) {
    const id = Number(wholesalerId);
    const value = Number(amount);
    if (!id || !value) return;
    const opts = transaction ? { transaction } : {};
    await WholesalerLedger.create({
        wholesalerId: id,
        type: 'SALE',
        amount: value,
        note: 'Bulk order',
        ref: ref || null,
        entryDate: new Date(),
        ShopId: 1
    }, opts);
    if (paid) {
        await WholesalerLedger.create({
            wholesalerId: id,
            type: 'PAYMENT',
            amount: value,
            note: 'Cash settlement',
            ref: ref || null,
            entryDate: new Date(),
            ShopId: 1
        }, opts);
    }
};

exports.listLedger = async (req, res) => {
    try {
        const rows = await WholesalerLedger.findAll({
            where: { wholesalerId: req.params.id },
            order: [['entryDate', 'DESC']]
        });
        res.status(200).json({ rows, creditBalance: balanceOf(rows) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wholesaler ledger', error: error.message });
    }
};

exports.addPayment = async (req, res) => {
    try {
        const party = await Wholesaler.findByPk(req.params.id);
        if (!party) return res.status(404).json({ message: 'Wholesaler not found.' });
        const amount = Number(req.body.amount);
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Payment amount must be greater than zero.' });
        }
        const row = await WholesalerLedger.create({
            wholesalerId: party.id,
            type: 'PAYMENT',
            amount,
            note: req.body.note || 'Wholesaler payment',
            ref: req.body.ref || null,
            entryDate: req.body.entryDate ? new Date(req.body.entryDate) : new Date(),
            ShopId: 1
        });
        res.status(201).json({ message: 'Payment recorded.', entry: row });
    } catch (error) {
        res.status(500).json({ message: 'Error recording payment', error: error.message });
    }
};
