const { Op, fn, col } = require('sequelize');
const Product = require('../models/Product');
const ShopProfile = require('../models/ShopProfile');
const StoreOrder = require('../models/StoreOrder');
const RetailCustomer = require('../models/RetailCustomer');
const BuyerAccount = require('../models/BuyerAccount');
const RetailBill = require('../models/RetailBill');
const Sale = require('../models/Sale');

function dayStart(date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function dayLabel(date) {
    return date.toLocaleDateString('en', { day: 'numeric', month: 'short' });
}

function bucketMoney(rows, field, from, to) {
    return rows.reduce((sum, row) => {
        const at = new Date(row.createdAt);
        if (at >= from && at < to) return sum + (Number(row[field]) || 0);
        return sum;
    }, 0);
}

async function moneyRows(Model, field, since) {
    return Model.findAll({
        attributes: ['createdAt', field],
        where: { createdAt: { [Op.gte]: since } },
        raw: true
    });
}

async function salesSeries() {
    const today = dayStart(new Date());
    const since = new Date(today);
    since.setDate(today.getDate() - 13);
    const [bills, sales] = await Promise.all([
        moneyRows(RetailBill, 'grandTotal', since),
        moneyRows(Sale, 'totalAmount', since)
    ]);
    const days = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
        const from = new Date(today);
        from.setDate(today.getDate() - offset);
        const to = new Date(from);
        to.setDate(from.getDate() + 1);
        const prevFrom = new Date(from);
        prevFrom.setDate(from.getDate() - 7);
        const prevTo = new Date(to);
        prevTo.setDate(to.getDate() - 7);
        days.push({
            label: dayLabel(from),
            current: bucketMoney(bills, 'grandTotal', from, to) + bucketMoney(sales, 'totalAmount', from, to),
            previous: bucketMoney(bills, 'grandTotal', prevFrom, prevTo) + bucketMoney(sales, 'totalAmount', prevFrom, prevTo)
        });
    }
    return days;
}

async function categoryShares() {
    const rows = await Product.findAll({
        attributes: ['category', [fn('COUNT', col('id')), 'total']],
        group: ['category'],
        raw: true
    });
    return rows
        .map((row) => ({ name: row.category || 'Other', total: Number(row.total) || 0 }))
        .filter((row) => row.total > 0)
        .sort((a, b) => b.total - a.total)
        .slice(0, 6);
}

async function recentShops() {
    const [profiles, counts] = await Promise.all([
        ShopProfile.findAll({
            attributes: ['shopName', 'ownerName', 'isSetupCompleted', 'createdAt', 'ShopId'],
            order: [['createdAt', 'DESC']],
            limit: 5
        }),
        Product.findAll({
            attributes: ['ShopId', [fn('COUNT', col('id')), 'total']],
            group: ['ShopId'],
            raw: true
        })
    ]);
    const byShop = {};
    counts.forEach((row) => { byShop[row.ShopId] = Number(row.total) || 0; });
    return profiles.map((row) => ({
        name: row.shopName,
        owner: row.ownerName,
        status: row.isSetupCompleted ? 'Active' : 'Pending',
        products: byShop[row.ShopId] || 0,
        joined: dayLabel(new Date(row.createdAt))
    }));
}

async function recentProducts() {
    const rows = await Product.findAll({
        attributes: ['title', 'category', 'retailPrice', 'storePublished'],
        order: [['createdAt', 'DESC']],
        limit: 8,
        raw: true
    });
    return rows.map((row) => ({
        title: row.title,
        category: row.category || 'Other',
        price: Number(row.retailPrice) || 0,
        status: row.storePublished ? 'Published' : 'Hidden'
    }));
}

async function recentCustomers() {
    const [retail, buyers] = await Promise.all([
        RetailCustomer.findAll({
            attributes: ['name', 'phone', 'status', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 6,
            raw: true
        }),
        BuyerAccount.findAll({
            attributes: ['name', 'phone', 'email', 'createdAt'],
            order: [['createdAt', 'DESC']],
            limit: 6,
            raw: true
        })
    ]);
    const rows = retail.map((row) => ({
        name: row.name,
        contact: row.phone || '',
        kind: 'Retail',
        status: row.status || 'Active',
        joined: dayLabel(new Date(row.createdAt))
    }));
    buyers.forEach((row) => rows.push({
        name: row.name,
        contact: row.phone || row.email || '',
        kind: 'Buyer',
        status: 'Active',
        joined: dayLabel(new Date(row.createdAt))
    }));
    return rows.slice(0, 8);
}

async function recentOrders() {
    const rows = await StoreOrder.findAll({
        attributes: ['orderNumber', 'customerName', 'total', 'status', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5
    });
    return rows.map((row) => ({
        number: row.orderNumber,
        customer: row.customerName,
        total: Number(row.total) || 0,
        status: row.status || 'New',
        date: dayLabel(new Date(row.createdAt))
    }));
}

async function platformSnapshot() {
    const month = dayStart(new Date());
    month.setDate(1);
    const today = dayStart(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const [shops, active, freshShops, products, orders, buyers, customers, series, categories, shopRows, orderRows, productRows, customerRows, freshProducts, ordersToday, ordersYesterday, freshBuyers, freshRetail] = await Promise.all([
        ShopProfile.count(),
        ShopProfile.count({ where: { isSetupCompleted: true } }),
        ShopProfile.count({ where: { createdAt: { [Op.gte]: month } } }),
        Product.count(),
        StoreOrder.count(),
        BuyerAccount.count(),
        RetailCustomer.count(),
        salesSeries(),
        categoryShares(),
        recentShops(),
        recentOrders(),
        recentProducts(),
        recentCustomers(),
        Product.count({ where: { createdAt: { [Op.gte]: month } } }),
        StoreOrder.count({ where: { createdAt: { [Op.gte]: today } } }),
        StoreOrder.count({ where: { createdAt: { [Op.gte]: yesterday, [Op.lt]: today } } }),
        BuyerAccount.count({ where: { createdAt: { [Op.gte]: month } } }),
        RetailCustomer.count({ where: { createdAt: { [Op.gte]: month } } })
    ]);
    const todaySales = series.length ? series[series.length - 1].current : 0;
    return {
        shops, active, freshShops, products, orders,
        customers: buyers + customers,
        todaySales, series, categories, shopRows, orderRows, productRows, customerRows,
        freshProducts, ordersToday, ordersYesterday, freshCustomers: freshBuyers + freshRetail
    };
}

module.exports = { platformSnapshot };
