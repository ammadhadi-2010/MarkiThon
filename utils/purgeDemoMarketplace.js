const { Op } = require('sequelize');
const StoreOrder = require('../models/StoreOrder');
const RetailCustomer = require('../models/RetailCustomer');
const { demoOrders } = require('./storeOrderSeedData');
const { featuredCustomers } = require('./customerSeedData');

function demoPhones() {
    const featured = featuredCustomers().map((row) => String(row.phone || '').replace(/\D/g, ''));
    return featured.filter(Boolean);
}

async function purgeDemoMarketplace() {
    const numbers = demoOrders().map((row) => row.orderNumber).filter(Boolean);
    let ordersRemoved = 0;
    let customersRemoved = 0;
    if (numbers.length) {
        ordersRemoved = await StoreOrder.destroy({ where: { orderNumber: { [Op.in]: numbers } } });
    }
    const phones = demoPhones();
    if (phones.length) {
        const rows = await RetailCustomer.findAll({ attributes: ['id', 'phone'] });
        const ids = rows
            .filter((row) => phones.includes(String(row.phone || '').replace(/\D/g, '')))
            .map((row) => row.id);
        if (ids.length) {
            customersRemoved += await RetailCustomer.destroy({ where: { id: { [Op.in]: ids } } });
        }
    }
    customersRemoved += await RetailCustomer.destroy({
        where: { phone: { [Op.like]: '0301-%' } }
    });
    return { ordersRemoved, customersRemoved };
}

module.exports = { purgeDemoMarketplace };
