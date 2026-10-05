const { listCustomers, createCustomer, updateCustomer } = require('../utils/adminCustomers');

exports.customers = async (req, res) => {
    try {
        res.status(200).json({ customers: await listCustomers() });
    } catch (error) {
        res.status(500).json({ message: 'Could not load customers.' });
    }
};

exports.createCustomer = (req, res) => {
    const row = createCustomer(req.body || {});
    if (!row) return res.status(400).json({ message: 'Enter the customer name.' });
    res.status(201).json({ message: 'Customer added to the admin list.', customer: row });
};

exports.updateCustomer = async (req, res) => {
    try {
        const row = await updateCustomer(req.params.id, req.body || {});
        if (row && row.missing) return res.status(404).json({ message: 'Customer not found.' });
        if (!row) return res.status(400).json({ message: 'Choose a valid status.' });
        res.status(200).json({ message: 'Customer status updated.', customer: row });
    } catch (error) {
        res.status(500).json({ message: 'Could not update the customer.' });
    }
};
