const VendorAccount = require('../models/VendorAccount');
const { updateLiveShop, buildLiveShop } = require('./adminShopProfile');

function waitLabel(date) {
    const at = new Date(date).getTime();
    if (!at) return 'Just now';
    const mins = Math.max(0, Math.round((Date.now() - at) / 60000));
    if (mins < 60) return mins + 'm ago';
    const hours = Math.round(mins / 60);
    if (hours < 48) return hours + 'h ago';
    return Math.round(hours / 24) + 'd ago';
}

async function listApplications() {
    const rows = await VendorAccount.findAll({
        where: { status: 'Pending Admin Approval' },
        order: [['createdAt', 'ASC']]
    });
    return rows.map((row) => ({
        id: row.id,
        name: row.shopName,
        owner: row.ownerName,
        wait: waitLabel(row.createdAt),
        status: 'pending'
    }));
}

async function decideApplication(id, status) {
    if (status !== 'approved' && status !== 'rejected') return null;
    const vendor = await VendorAccount.findByPk(id);
    if (!vendor) return null;
    const next = status === 'approved' ? 'Active' : 'Suspended';
    vendor.status = next;
    await vendor.save();
    const live = await buildLiveShop();
    if (live && live.name === vendor.shopName) {
        await updateLiveShop({ status: status === 'approved' ? 'Active' : 'Suspended' });
    }
    return {
        id: vendor.id,
        name: vendor.shopName,
        wait: waitLabel(vendor.createdAt),
        status: status === 'approved' ? 'approved' : 'rejected'
    };
}

module.exports = { listApplications, decideApplication };
