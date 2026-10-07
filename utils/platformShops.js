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

function vendorStatusFromShop(status) {
    if (status === 'Active') return 'Active';
    if (status === 'Suspended') return 'Suspended';
    return 'Pending Admin Approval';
}

function vendorProfile(row) {
    return {
        storeName: row.shopName,
        ownerName: row.ownerName,
        cnic: '',
        shopSku: '',
        phone: row.phone || '',
        whatsapp: row.phone || '',
        email: row.email || '',
        address: row.address || '',
        marketName: '',
        shopNumber: '',
        location: '',
        landmark: '',
        map: '',
        shopType: '',
        businessType: '',
        latitude: null,
        longitude: null,
        website: '',
        imageUrl: row.imageUrl || '',
        coverBanner: '',
        setup: 'Incomplete',
        approved: row.status === 'Active',
        shopkeeperId: row.shopkeeperId || '',
        vendorStatus: row.status || '',
        productTypes: [],
        subscription: null
    };
}

function vendorToShop(vendor) {
    const row = vendor.toJSON ? vendor.toJSON() : vendor;
    return {
        id: row.id,
        name: row.shopName,
        owner: row.ownerName,
        phone: row.phone || '',
        package: 'Basic',
        months: 1,
        status: mapStatus(row.status),
        email: row.email || '',
        shopkeeperId: row.shopkeeperId || '',
        imageUrl: row.imageUrl || '',
        profile: vendorProfile(row)
    };
}

function cleanShop(body) {
    const name = String((body && body.name) || '').trim();
    const owner = String((body && body.owner) || '').trim();
    const phone = String((body && body.phone) || '').trim();
    const pack = ['Basic', 'Business', 'Premium', 'Standard'].includes(body && body.package)
        ? (body.package === 'Standard' ? 'Basic' : body.package) : 'Basic';
    const months = Math.min(24, Math.max(1, Number(body && body.months) || 3));
    const status = ['Active', 'Pending', 'Suspended'].includes(body && body.status)
        ? body.status : 'Pending';
    if (name.length < 2 || owner.length < 2 || phone.length < 7) return null;
    return { name, owner, phone, package: pack, months, status };
}

async function listManagedShops() {
    const [vendors, live] = await Promise.all([
        VendorAccount.findAll({ order: [['createdAt', 'DESC']] }),
        buildLiveShop()
    ]);
    const rows = vendors.map(vendorToShop);
    if (!live) return rows;
    const match = rows.find((row) => row.name === live.name || row.id === live.id);
    if (!match) return [{ ...live, id: live.id || 'live-shop' }, ...rows];
    return rows.map((row) => (row.id === match.id
        ? {
            ...live,
            id: row.id,
            email: row.email || live.email,
            shopkeeperId: row.shopkeeperId || live.shopkeeperId,
            imageUrl: live.imageUrl || row.imageUrl
        }
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
    const patch = body || {};
    if (id === 'live-shop') return updateLiveShop(patch);
    const vendor = await VendorAccount.findByPk(id);
    if (!vendor) return null;

    if (['Active', 'Pending', 'Suspended'].includes(patch.status)) {
        await vendor.update({ status: vendorStatusFromShop(patch.status) });
    }
    if (patch.name || patch.owner || patch.phone) {
        const next = cleanShop({
            name: patch.name || vendor.shopName,
            owner: patch.owner || vendor.ownerName,
            phone: patch.phone || vendor.phone,
            package: patch.package || 'Basic',
            months: patch.months || 3,
            status: mapStatus(vendor.status)
        });
        if (next) {
            await vendor.update({
                shopName: next.name,
                ownerName: next.owner,
                phone: next.phone
            });
        }
    }

    const live = await buildLiveShop(vendor.id);
    const isLive = live && (live.name === vendor.shopName || live.id === vendor.id);
    if (isLive && (patch.status || patch.package || patch.selectedPackage || patch.billingCycle)) {
        await updateLiveShop(patch, vendor.id);
    }

    const found = await findManagedShop(vendor.id);
    return found ? found.shop : vendorToShop(await vendor.reload());
}

async function findManagedShop(id) {
    if (id === 'live-shop') {
        const live = await buildLiveShop();
        if (!live) return null;
        const metrics = await shopMetrics(true);
        return { shop: live, metrics };
    }
    const shop = (await listManagedShops()).find((row) => String(row.id) === String(id));
    if (!shop) return null;
    const live = await buildLiveShop(id);
    const tracked = Boolean(live && (live.name === shop.name || live.id === shop.id));
    return { shop, metrics: await shopMetrics(tracked) };
}

async function shopMetrics(tracked) {
    const metrics = { tracked: false, products: 0, orders: 0, sales: 0 };
    if (!tracked) return metrics;
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
    return metrics;
}

module.exports = { listManagedShops, createManagedShop, updateManagedShop, findManagedShop };
