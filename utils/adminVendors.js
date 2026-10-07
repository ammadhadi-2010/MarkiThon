const VendorAccount = require('../models/VendorAccount');
const { publicVendor } = require('./vendorProfile');

async function listVendors() {
    const rows = await VendorAccount.findAll({ order: [['createdAt', 'DESC']] });
    return rows.map(publicVendor);
}

async function updateVendorStatus(id, status) {
    const allowed = ['Active', 'Pending Admin Approval', 'Suspended'];
    if (!allowed.includes(status)) return null;
    const vendor = await VendorAccount.findByPk(id);
    if (!vendor) return { missing: true };
    vendor.status = status;
    await vendor.save();
    return publicVendor(vendor);
}

module.exports = { listVendors, updateVendorStatus };
