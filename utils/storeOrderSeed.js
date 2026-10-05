const StoreOrder = require('../models/StoreOrder');
const { demoOrders } = require('./storeOrderSeedData');

async function ensureStoreOrders() {
    const demos = demoOrders();
    const count = await StoreOrder.count();
    if (!count) {
        await StoreOrder.bulkCreate(demos);
        return;
    }
    const rows = await StoreOrder.findAll({
        where: { orderNumber: demos.map((row) => row.orderNumber) }
    });
    await Promise.all(rows.map((row) => {
        const demo = demos.find((item) => item.orderNumber === row.orderNumber);
        if (!demo) return null;
        const patch = {};
        if (!(row.details && row.details.address)
            || !(row.items && row.items[0] && row.items[0].sku)) {
            patch.details = demo.details;
            patch.items = demo.items;
            patch.total = demo.total;
            patch.itemCount = demo.itemCount;
            patch.customerPhone = demo.customerPhone;
        }
        if (row.orderNumber === 'MK-10010') {
            patch.details = Object.assign({}, row.details || {}, demo.details, {
                subtotal: 8900,
                discount: 300,
                deliveryCharges: 350,
                eta: '2 - 3 Working Days'
            });
            patch.total = 8950;
        }
        const year = row.createdAt && new Date(row.createdAt).getFullYear();
        if (year !== 2026) {
            patch.createdAt = demo.createdAt;
            patch.updatedAt = demo.updatedAt;
        }
        return row.update(patch);
    }));
}

module.exports = { ensureStoreOrders, demoOrders };
