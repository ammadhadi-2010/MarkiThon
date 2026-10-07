const { listManagedShops, createManagedShop, updateManagedShop, findManagedShop } = require('../utils/platformShops');
const { buildLiveShop } = require('../utils/adminShopProfile');

exports.shops = async (req, res) => {
    try {
        const rows = await listManagedShops();
        res.status(200).json({ shops: rows });
    } catch (error) {
        res.status(500).json({ message: 'Could not load shops.' });
    }
};

exports.shopOne = async (req, res) => {
    try {
        const found = await findManagedShop(req.params.id);
        if (!found) return res.status(404).json({ message: 'Shop not found.' });
        res.status(200).json(found);
    } catch (error) {
        res.status(500).json({ message: 'Could not load the shop profile.' });
    }
};

exports.createShop = async (req, res) => {
    try {
        const row = await createManagedShop(req.body || {});
        if (!row) {
            return res.status(400).json({
                message: 'Enter the shop name, owner, and phone. Email must be unique if provided.'
            });
        }
        res.status(201).json({ message: 'Shopkeeper added for approval.', shop: row });
    } catch (error) {
        res.status(500).json({ message: 'Could not create the shopkeeper account.' });
    }
};

exports.updateShop = async (req, res) => {
    try {
        const row = await updateManagedShop(req.params.id, req.body || {});
        if (!row) return res.status(404).json({ message: 'Shop not found.' });
        const message = req.params.id === 'live-shop'
            ? 'Live shop profile updated.'
            : 'Shop updated.';
        res.status(200).json({ message, shop: row });
    } catch (error) {
        res.status(500).json({ message: 'Could not update the shop.' });
    }
};

exports.liveProfile = async (req, res) => {
    try {
        const shop = await buildLiveShop();
        if (!shop) return res.status(404).json({ message: 'Live shop profile was not found.' });
        res.status(200).json({ shop });
    } catch (error) {
        res.status(500).json({ message: 'Could not load the live shop profile.' });
    }
};
