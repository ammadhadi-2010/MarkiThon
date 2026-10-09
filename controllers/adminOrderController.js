const { listOrders, createOrder, updateOrder } = require('../utils/adminOrders');

exports.orders = async (req, res) => {
    try {
        const data = await listOrders();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Could not load orders.', error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const row = await createOrder(req.body || {});
        if (!row) return res.status(400).json({ message: 'Enter the customer, shop, and total.' });
        const data = await listOrders();
        res.status(201).json({ message: 'Order saved.', order: row, ...data });
    } catch (error) {
        res.status(500).json({ message: 'Could not save the order.' });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const row = await updateOrder(req.params.id, req.body || {});
        if (row && row.missing) return res.status(404).json({ message: 'Order not found.' });
        if (!row) return res.status(400).json({ message: 'Choose a valid status.' });
        const data = await listOrders();
        res.status(200).json({ message: 'Order status updated.', order: row, ...data });
    } catch (error) {
        res.status(500).json({ message: 'Could not update the order.' });
    }
};
