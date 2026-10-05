const { Op } = require('sequelize');
const Wholesaler = require('../models/Wholesaler');
const WholesalerLedger = require('../models/WholesalerLedger');
const { withStats } = require('./wholesalerLedgerController');

function payloadFrom(body) {
    return {
        name: String(body.name || '').trim(),
        shopName: body.shopName || '',
        phone: String(body.phone || '').trim(),
        email: body.email || '',
        city: body.city || '',
        creditLimit: Number(body.creditLimit) || 0,
        notes: body.notes || '',
        ShopId: body.ShopId || 1
    };
}

exports.addWholesaler = async (req, res) => {
    try {
        const data = payloadFrom(req.body);
        if (!data.name) return res.status(400).json({ message: 'Wholesaler name is required.' });
        if (!data.phone) return res.status(400).json({ message: 'Phone number is required.' });
        const wholesaler = await Wholesaler.create(data);
        res.status(201).json({ message: 'Wholesaler saved.', wholesaler });
    } catch (error) {
        res.status(500).json({ message: 'Error adding wholesaler', error: error.message });
    }
};

exports.getWholesalers = async (req, res) => {
    try {
        const { q } = req.query;
        const where = {};
        if (q && String(q).trim()) {
            const term = `%${String(q).trim()}%`;
            where[Op.or] = [
                { name: { [Op.iLike]: term } },
                { shopName: { [Op.iLike]: term } },
                { phone: { [Op.iLike]: term } },
                { city: { [Op.iLike]: term } }
            ];
        }
        const rows = await Wholesaler.findAll({ where, order: [['createdAt', 'DESC']] });
        res.status(200).json(await withStats(rows));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching wholesalers', error: error.message });
    }
};

exports.updateWholesaler = async (req, res) => {
    try {
        const row = await Wholesaler.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Wholesaler not found.' });
        const data = payloadFrom(req.body);
        if (!data.name) return res.status(400).json({ message: 'Wholesaler name is required.' });
        if (!data.phone) return res.status(400).json({ message: 'Phone number is required.' });
        Object.assign(row, data);
        await row.save();
        res.status(200).json({ message: 'Wholesaler updated.', wholesaler: row });
    } catch (error) {
        res.status(500).json({ message: 'Error updating wholesaler', error: error.message });
    }
};

exports.deleteWholesaler = async (req, res) => {
    try {
        const row = await Wholesaler.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Wholesaler not found.' });
        await WholesalerLedger.destroy({ where: { wholesalerId: row.id } });
        await row.destroy();
        res.status(200).json({ message: 'Wholesaler deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting wholesaler', error: error.message });
    }
};
