const RetailCustomer = require('../models/RetailCustomer');
const { packCustomer, customerStats, customerAreas, applyCustomerPatch } = require('../utils/customerPack');

exports.listCustomerHub = async (req, res) => {
    try {
        const rows = await RetailCustomer.findAll({
            order: [['lastOrderAt', 'DESC'], ['id', 'DESC']]
        });
        const customers = rows.map(packCustomer);
        res.status(200).json({
            customers,
            stats: customerStats(customers),
            areas: customerAreas(customers)
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not load customers.', error: error.message });
    }
};

exports.destroyCustomer = async (req, res) => {
    try {
        const row = await RetailCustomer.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Customer not found.' });
        await row.destroy();
        res.status(200).json({ message: 'Customer deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Could not delete customer.', error: error.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const row = await RetailCustomer.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Customer not found.' });
        const data = applyCustomerPatch(row, req);
        if (!data.name) return res.status(400).json({ message: 'Customer name is required.' });
        await row.update(data);
        res.status(200).json({ message: 'Customer updated.', customer: packCustomer(row) });
    } catch (error) {
        res.status(500).json({ message: 'Could not update customer.', error: error.message });
    }
};
