const { Op } = require('sequelize');
const Supplier = require('../models/Supplier');
const { withTotals } = require('./supplierLedgerController');

exports.addSupplier = async (req, res) => {
    try {
        const { name, contactPerson, phone, email, address, status, ShopId } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Supplier name is required.' });
        }
        if (!phone || !String(phone).trim()) {
            return res.status(400).json({ message: 'Phone number is required.' });
        }

        const supplier = await Supplier.create({
            name: String(name).trim(),
            contactPerson,
            phone: String(phone).trim(),
            email,
            address,
            status: status === 'Inactive' ? 'Inactive' : 'Active',
            ShopId: ShopId || 1
        });

        res.status(201).json({ message: 'Supplier saved successfully.', supplier });
    } catch (error) {
        res.status(500).json({ message: 'Error adding supplier', error: error.message });
    }
};

exports.getSuppliers = async (req, res) => {
    try {
        const { q } = req.query;
        const where = {};

        if (q && String(q).trim()) {
            const term = `%${String(q).trim()}%`;
            where[Op.or] = [
                { name: { [Op.iLike]: term } },
                { phone: { [Op.iLike]: term } },
                { contactPerson: { [Op.iLike]: term } },
                { email: { [Op.iLike]: term } }
            ];
        }

        const suppliers = await Supplier.findAll({
            where,
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(await withTotals(suppliers, req.query.from, req.query.to));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
    }
};

exports.toggleSupplierStatus = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        supplier.status = supplier.status === 'Active' ? 'Inactive' : 'Active';
        await supplier.save();

        res.status(200).json({ message: 'Supplier status updated.', supplier });
    } catch (error) {
        res.status(500).json({ message: 'Error updating supplier', error: error.message });
    }
};

exports.updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        const { name, contactPerson, phone, email, address, status } = req.body;
        if (name) supplier.name = String(name).trim();
        if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
        if (phone) supplier.phone = String(phone).trim();
        if (email !== undefined) supplier.email = email;
        if (address !== undefined) supplier.address = address;
        if (status === 'Active' || status === 'Inactive') supplier.status = status;

        await supplier.save();
        res.status(200).json({ message: 'Supplier updated.', supplier });
    } catch (error) {
        res.status(500).json({ message: 'Error updating supplier', error: error.message });
    }
};

exports.deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByPk(req.params.id);
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found.' });
        }

        await supplier.destroy();
        res.status(200).json({ message: 'Supplier deleted.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting supplier', error: error.message });
    }
};
