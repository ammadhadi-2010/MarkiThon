const Ledger = require('../models/Ledger');

exports.addTransaction = async (req, res) => {
    try {
        const { customerName, transactionType, amount, description } = req.body;
        if (!customerName) return res.status(400).json({ message: 'Customer name is required.' });
        const record = await Ledger.create({
            customerName,
            transactionType,
            amount,
            description
        });
        res.status(201).json({ message: 'Ledger entry saved.', record });
    } catch (error) {
        res.status(500).json({ message: 'Error adding ledger entry', error: error.message });
    }
};

exports.listLedger = async (req, res) => {
    try {
        const history = await Ledger.findAll({ order: [['createdAt', 'DESC']], limit: 200 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ledger', error: error.message });
    }
};

exports.getCustomerLedger = async (req, res) => {
    try {
        const history = await Ledger.findAll({
            where: { customerName: req.params.customerName },
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ledger', error: error.message });
    }
};

async function recordSaleLedger({ customerName, amount, description, settled }) {
    if (!customerName || !amount) return null;
    await Ledger.create({
        customerName,
        transactionType: 'BILL',
        amount,
        description
    });
    if (settled) {
        await Ledger.create({
            customerName,
            transactionType: 'PAYMENT',
            amount,
            description: `${description} (paid)`
        });
    }
    return true;
}

exports.recordSaleLedger = recordSaleLedger;
