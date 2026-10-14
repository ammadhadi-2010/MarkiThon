const ShopDigitalSetup = require('../models/ShopDigitalSetup');
const Setting = require('../models/Setting');
const { activeShopId } = require('../utils/shopScope');

async function getOrCreate() {
    const shopId = await activeShopId();
    let row = await Setting.findOne({ where: { ShopId: shopId } });
    if (!row) {
        row = await Setting.create({
            shopName: 'Ammad Hadi Stor',
            ownerName: 'Admin',
            phone: '0300-1234567',
            address: 'Pakistan',
            ShopId: shopId
        });
    }
    return row;
}

exports.getSettings = async (req, res) => {
    try {
        res.status(200).json(await getOrCreate());
    } catch (error) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
    }
};

exports.saveSettings = async (req, res) => {
    try {
        const row = await getOrCreate();
        await row.update({
            shopName: req.body.shopName || row.shopName,
            ownerName: req.body.ownerName || row.ownerName,
            phone: req.body.phone,
            address: req.body.address
        });
        res.status(200).json({ message: 'Settings saved.', setting: row });
    } catch (error) {
        res.status(500).json({ message: 'Error saving settings', error: error.message });
    }
};

function safeQrData(raw) {
    const data = String(raw || '').trim().slice(0, 400);
    if (/^https:\/\/markithon\.com\/[a-z0-9]+(?:\?mode=(?:wholesale|retail))?$/i.test(data)) {
        return data;
    }
    return 'https://markithon.com/ammadhadistor';
}

exports.getStoreQr = async (req, res) => {
    try {
        const size = Math.min(720, Math.max(128, Number(req.query.size) || 220));
        const data = encodeURIComponent(safeQrData(req.query.data));
        const url = 'https://api.qrserver.com/v1/create-qr-code/?ecc=H&margin=12&size='
            + size + 'x' + size + '&data=' + data;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('QR service error');
        const buf = Buffer.from(await resp.arrayBuffer());
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.send(buf);
    } catch (error) {
        res.status(502).json({ message: 'Could not generate QR code.' });
    }
};

exports.getStoreApproval = async (req, res) => {
    try {
        const shopId = await activeShopId();
        const [row] = await ShopDigitalSetup.findOrCreate({
            where: { ShopId: shopId },
            defaults: { ShopId: shopId, isApproved: false }
        });
        res.status(200).json({ isApproved: Boolean(row.isApproved) });
    } catch (error) {
        res.status(500).json({ message: 'Could not load store approval.' });
    }
};

exports.putStoreApproval = async (req, res) => {
    try {
        const shopId = Number(req.body && req.body.shopId) || 1;
        const [row] = await ShopDigitalSetup.findOrCreate({
            where: { ShopId: shopId },
            defaults: { ShopId: shopId, isApproved: false }
        });
        const isApproved = Boolean(req.body && req.body.isApproved);
        await row.update({ isApproved });
        res.status(200).json({
            message: isApproved ? 'Store approved and verified.' : 'Store set to pending admin approval.',
            isApproved,
            shopId
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not update store approval.' });
    }
};
