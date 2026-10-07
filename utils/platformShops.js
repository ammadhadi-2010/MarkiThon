const VendorAccount = require('../models/VendorAccount');
const Product = require('../models/Product');
const StoreOrder = require('../models/StoreOrder');
const { buildLiveShop, updateLiveShop } = require('./adminShopProfile');
const { hashPassword } = require('./authCrypto');
const { nextShopkeeperId } = require('./vendorProfile');

function mapStatus(vendorStatus) {
    if (vendorStatus === 'Active') return 'Active';
    if (vendorStatus === 'Suspended') return 'Suspended';
    return 'Pending';
}

function vendorToShop(vendor) {
    const row = vendor.toJSON ? vendor.toJSON() : vendor;
    return {
        id: row.id,
        name: row.shopName,
        owner: row.ownerName,
        phone: row.phone || '',
        package: 'Standard',
        months: 3,
        status: mapStatus(row.status),
        email: row.email || '',
        shopkeeperId: row.shopkeeperId || ''
    };
}

function cleanShop(body) {
    const name = String((body && body.name) || '').trim();
    const owner = String((body && body.owner) || '').trim();
    const phone = String((body && body.phone) || '').trim();
    const pack = body && body.package === 'Premium' ? 'Premium' : 'Standard';
    const months = Math.min(24, Math.max(1, Number(body && body.months) || 3));
    const status = ['Active', 'Pending', 'Suspended'].includes(body && body.status)
        ? body.status : 'Pending';
    if (name.length < 2 || owner.length < 2 || phone.length < 7) return null;
    return { name, owner, phone, package: pack, months, status };
}

function vendorStatusFromShop(status) {
    if (status === 'Active') return 'Active';
    if (status === 'Suspended') return 'Suspended';
    return 'Pending Admin Approval';
}

async function listManagedShops() {
    const [vendors, live] = await Promise.all([
        VendorAccount.findAll({ order: [['createdAt', 'DESC']] }),
        buildLiveShop()
    ]);
    const rows = vendors.map(vendorToShop);
    if (!live) return rows;
    const match = rows.find((row) => row.name === live.name);
    if (!match) return [live, ...rows];
    return rows.map((row) => (row.id === match.id
        ? { ...live, id: row.id, email: row.email, shopkeeperId: row.shopkeeperId }
        : row));
}

async function createManagedShop(body) {
    const next = cleanShop(body);
    if (!next) return null;
    const email = String((body && body.email) || '').trim().toLowerCase()
        || ('shop' + Date.now() + '@markithon.local');
    const existing = await VendorAccount.findOne({ where: { email } });
    if (existing) return null;
    const vendor = await VendorAccount.create({
        shopkeeperId: await nextShopkeeperId(),
        shopName: next.name,
        ownerName: next.owner,
        email,
        phone: next.phone,
        address: String((body && body.address) || 'Address pending').trim() || 'Address pending',
        password: await hashPassword(String((body && body.password) || 'ChangeMe@123')),
        status: 'Pending Admin Approval'
    });
    return vendorToShop(vendor);
}

async function updateManagedShop(id, body) {
    if (id === 'live-shop') {
        return updateLiveShop(body || {});
    }
    const vendor = await VendorAccount.findByPk(id);
    if (!vendor) return null;
    const next = cleanShop({
        name: vendor.shopName,
        owner: vendor.ownerName,
        phone: vendor.phone,
        package: 'Standard',
        months: 3,
        status: mapStatus(vendor.status),
        ...body
    });
    if (!next) return null;
    await vendor.update({
        shopName: next.name,
        ownerName: next.owner,
        phone: next.phone,
        status: vendorStatusFromShop(next.status)
    });
    const live = await buildLiveShop();
    if (live && live.name === vendor.shopName && body && body.status) {
        await updateLiveShop({ status: next.status });
    }
    return vendorToShop(vendor);
}

async function findManagedShop(id) {
    const shop = (await listManagedShops()).find((row) => row.id === id);
    if (!shop) return null;
    const metrics = { tracked: false, products: 0, orders: 0, sales: 0 };
    if (shop.id === 'live-shop' || shop.name === ((await buildLiveShop()) || {}).name) {
        const where = { ShopId: 1 };
        const [products, orders, sales] = await Promise.all([
            Product.count({ where }),
            StoreOrder.count({ where }),
            StoreOrder.sum('total', { where })
        ]);
        metrics.tracked = true;
        metrics.products = products;
        metrics.orders = orders;
        metrics.sales = Number(sales) || 0;
    }
    return { shop, metrics };
}

module.exports = { listManagedShops, createManagedShop, updateManagedShop, findManagedShop };
