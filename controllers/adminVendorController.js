const { listVendors, updateVendorStatus } = require('../utils/adminVendors');

exports.vendors = async (req, res) => {
    try {
        res.status(200).json({ vendors: await listVendors() });
    } catch (error) {
        res.status(500).json({ message: 'Could not load shopkeeper accounts.' });
    }
};

exports.updateVendor = async (req, res) => {
    try {
        const status = String((req.body && req.body.status) || '').trim();
        const row = await updateVendorStatus(req.params.id, status);
        if (row && row.missing) return res.status(404).json({ message: 'Shopkeeper account not found.' });
        if (!row) return res.status(400).json({ message: 'Choose Active, Pending Admin Approval, or Suspended.' });
        res.status(200).json({ message: 'Shopkeeper status updated.', vendor: row });
    } catch (error) {
        res.status(500).json({ message: 'Could not update the shopkeeper account.' });
    }
};
