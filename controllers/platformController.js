const { platformSnapshot } = require('../utils/platformRead');
const { listApplications } = require('../utils/platformQueue');
const { listVendors } = require('../utils/adminVendors');
const { buildLiveShop } = require('../utils/adminShopProfile');
const { readPlans } = require('../utils/subscriptionPlans');

exports.overview = async (req, res) => {
    try {
        const stats = await platformSnapshot();
        const applications = listApplications();
        const pending = applications.filter((row) => row.status === 'pending');
        const activity = stats.orderRows.slice(0, 4).map((row) => ({
            title: 'Order placed',
            text: row.number + ' · ' + row.customer,
            time: row.date
        }));
        res.status(200).json({
            readOnly: true,
            stats: {
                shops: stats.shops,
                freshShops: stats.freshShops,
                active: stats.active,
                pending: pending.length,
                products: stats.products,
                orders: stats.orders,
                customers: stats.customers,
                todaySales: stats.todaySales,
                freshProducts: stats.freshProducts,
                ordersToday: stats.ordersToday,
                ordersYesterday: stats.ordersYesterday,
                freshCustomers: stats.freshCustomers,
                yesterdaySales: stats.series.length > 1 ? stats.series[stats.series.length - 2].current : 0
            },
            series: stats.series,
            categories: stats.categories,
            shops: stats.shopRows,
            orders: stats.orderRows,
            products: stats.productRows,
            customers: stats.customerRows,
            applications: pending,
            activity,
            health: [
                { name: 'Server Status', state: 'Online' },
                { name: 'Database', state: 'Connected' },
                { name: 'Website', state: 'Online' }
            ]
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not load platform overview.' });
    }
};

exports.reports = async (req, res) => {
    try {
        const stats = await platformSnapshot();
        const live = await buildLiveShop();
        const plans = readPlans().plans;
        res.status(200).json({
            series: stats.series,
            categories: stats.categories,
            totals: {
                shops: stats.shops,
                products: stats.products,
                orders: stats.orders,
                customers: stats.customers,
                todaySales: stats.todaySales
            },
            liveShop: live ? {
                name: live.name,
                package: live.package,
                status: live.status,
                cnic: live.profile.cnic,
                shopSku: live.profile.shopSku
            } : null,
            plans: plans.map((p) => ({ id: p.id, monthlyPrice: p.monthlyPrice, yearlyPrice: p.yearlyPrice })),
            vendors: (await listVendors()).length
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not load admin reports.' });
    }
};

exports.decide = (req, res) => {
    const { decideApplication } = require('../utils/platformQueue');
    const status = String((req.body && req.body.status) || '');
    if (status !== 'approved' && status !== 'rejected') {
        return res.status(400).json({ message: 'Choose approve or reject.' });
    }
    const row = decideApplication(req.params.id, status);
    if (!row) return res.status(404).json({ message: 'Application not found.' });
    res.status(200).json({ message: 'Application updated.', application: row });
};
