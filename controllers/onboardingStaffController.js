const Staff = require('../models/Staff');
const ShopProfile = require('../models/ShopProfile');

const ACCESS_KEYS = ['Owner', 'Manager', 'Salesman', 'Inventory Staff', 'Accountant'];

async function shopProfile() {
    return ShopProfile.findOne({ where: { ShopId: 1 } });
}

exports.listStaff = async (req, res) => {
    try {
        const rows = await Staff.findAll({ where: { ShopId: 1 }, order: [['id', 'ASC']] });
        const shop = await shopProfile();
        res.status(200).json({
            rows,
            accessPermissions: (shop && shop.accessPermissions) || ACCESS_KEYS
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching staff', error: error.message });
    }
};

exports.addStaff = async (req, res) => {
    try {
        const fullName = String(req.body.fullName || '').trim();
        const phone = String(req.body.phone || '').trim();
        const role = Staff.STAFF_ROLES.includes(req.body.role) ? req.body.role : '';
        if (!fullName || !phone || !role) {
            return res.status(400).json({ message: 'Name, phone, and role are required.' });
        }
        const staff = await Staff.create({
            fullName,
            phone,
            role,
            salary: Number(req.body.salary) || 0,
            status: req.body.status === 'Inactive' ? 'Inactive' : 'Active',
            permissions: Array.isArray(req.body.permissions) ? req.body.permissions : [],
            ShopId: 1
        });
        res.status(201).json({ message: 'Staff member saved.', staff });
    } catch (error) {
        res.status(500).json({ message: 'Error adding staff', error: error.message });
    }
};

exports.updateStaff = async (req, res) => {
    try {
        const staff = await Staff.findByPk(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff member not found.' });
        const role = Staff.STAFF_ROLES.includes(req.body.role) ? req.body.role : staff.role;
        await staff.update({
            fullName: String(req.body.fullName || staff.fullName).trim(),
            phone: String(req.body.phone || staff.phone).trim(),
            role,
            salary: req.body.salary === undefined ? staff.salary : Number(req.body.salary) || 0,
            status: req.body.status === 'Inactive' ? 'Inactive' : 'Active'
        });
        res.status(200).json({ message: 'Staff member updated.', staff });
    } catch (error) {
        res.status(500).json({ message: 'Error updating staff', error: error.message });
    }
};

exports.deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByPk(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff member not found.' });
        await staff.destroy();
        res.status(200).json({ message: 'Staff member removed.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting staff', error: error.message });
    }
};

exports.savePermissions = async (req, res) => {
    try {
        const incoming = Array.isArray(req.body.accessPermissions) ? req.body.accessPermissions : [];
        const accessPermissions = incoming.filter((key) => ACCESS_KEYS.includes(key));
        const shop = await shopProfile();
        if (!shop) return res.status(404).json({ message: 'Shop profile not found.' });
        await shop.update({ accessPermissions });
        res.status(200).json({ message: 'Access permissions saved.', accessPermissions });
    } catch (error) {
        res.status(500).json({ message: 'Error saving permissions', error: error.message });
    }
};
