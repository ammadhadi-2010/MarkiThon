const ShopProfile = require('../models/ShopProfile');
const { parsePoints } = require('../utils/publicPolicy');

function clip(value, max) {
    return String(value || '').trim().slice(0, max);
}

function pointsPayload(raw) {
    const text = typeof raw === 'string' ? raw : JSON.stringify(raw || []);
    return JSON.stringify(parsePoints(text));
}

function policyJson(row) {
    return {
        policyHighlights: (row && row.policyHighlights) || '[]',
        policyDeliveryTime: (row && row.policyDeliveryTime) || '',
        policyDeliveryCharge: (row && row.policyDeliveryCharge) || '',
        policyDeliveryDetail: (row && row.policyDeliveryDetail) || '',
        policyReturn: (row && row.policyReturn) || ''
    };
}

exports.getStorePolicies = async (req, res) => {
    try {
        const row = await ShopProfile.findOne({ order: [['id', 'ASC']] });
        if (!row) return res.status(404).json({ message: 'Shop profile not found.' });
        res.status(200).json(policyJson(row));
    } catch (error) {
        res.status(500).json({ message: 'Error loading store policies', error: error.message });
    }
};

exports.saveStorePolicies = async (req, res) => {
    try {
        const row = await ShopProfile.findOne({ order: [['id', 'ASC']] });
        if (!row) return res.status(404).json({ message: 'Shop profile not found.' });
        const body = req.body || {};
        await row.update({
            policyHighlights: pointsPayload(body.policyHighlights),
            policyDeliveryTime: clip(body.policyDeliveryTime, 120),
            policyDeliveryCharge: clip(body.policyDeliveryCharge, 160),
            policyDeliveryDetail: clip(body.policyDeliveryDetail, 500),
            policyReturn: clip(body.policyReturn, 500)
        });
        await row.reload();
        res.status(200).json({ message: 'Store policies saved.', ...policyJson(row) });
    } catch (error) {
        res.status(500).json({ message: 'Error saving store policies', error: error.message });
    }
};
