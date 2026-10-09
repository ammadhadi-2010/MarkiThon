const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = require('./config/database');
require('./models/Product');
require('./models/Sale');
require('./models/Supplier');
require('./models/SupplierLedger');
require('./models/StockHistory');
require('./models/StockVoucher');
require('./models/WholesaleOrder');
require('./models/WholesaleOrderItem');
require('./models/Wholesaler');
require('./models/WholesalerLedger');
require('./models/RetailCustomer');
require('./models/RetailBill');
require('./models/RetailBillItem');
require('./models/ReportDownload');
require('./models/Ledger');
require('./models/Setting');
require('./models/Expense');
require('./models/ShopProfile');
require('./models/ShopExpense');
require('./models/Staff');
require('./models/ShopSubscription');
require('./models/ShopDigitalSetup');
require('./models/StoreOrder');
require('./models/ProductReview');
require('./models/CatalogTerm');
require('./models/BuyerAccount');
require('./models/VendorAccount');

const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const wholesaleRoutes = require('./routes/wholesaleRoutes');
const wholesalerRoutes = require('./routes/wholesalerRoutes');
const retailRoutes = require('./routes/retailRoutes');
const stockRoutes = require('./routes/stockRoutes');
const reportRoutes = require('./routes/reportRoutes');
const salesReportRoutes = require('./routes/salesReportRoutes');
const settingRoutes = require('./routes/settingRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const storeRoutes = require('./routes/storeRoutes');
const onlineStoreApiRoutes = require('./routes/onlineStoreApiRoutes');
const billRoutes = require('./routes/billRoutes');
const onboardingRoutes = require('./routes/onboardingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const publicStoreRoutes = require('./routes/publicStoreRoutes');
const buyerRoutes = require('./routes/buyerRoutes');
const roleAuthRoutes = require('./routes/roleAuthRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const platformRoutes = require('./routes/platformRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const supportRoutes = require('./routes/supportRoutes');
const { listVouchers, getVoucher } = require('./controllers/voucherList');
const { markDbReady, markDbDown } = require('./config/dbState');
const { corsOptions } = require('./config/corsApp');
const { FRONTEND_URL, API_URL, isProd } = require('./config/cloudEnv');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

if (isProd) app.set('trust proxy', 1);
app.use(cors(corsOptions()));
app.use(express.json({ limit: '8mb' }));
app.get('/api/health', (req, res) => {
    res.status(200).json({
        ok: true,
        engine: 'postgres',
        frontend: FRONTEND_URL,
        api: API_URL
    });
});
app.use(express.static('public', { index: false }));
app.use('/api/products', stockRoutes);
app.use('/api/products', productRoutes);
app.get('/api/stock-receipts', listVouchers);
app.get('/api/stock-receipts/:id', getVoucher);
app.use('/api/sales', saleRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/wholesale', wholesaleRoutes);
app.use('/api/wholesalers', wholesalerRoutes);
app.use('/api/retail', retailRoutes);
app.use('/api/reports/sales', salesReportRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/online-store', onlineStoreApiRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/subcategories', require('./routes/subcategoryRoutes'));
app.use('/api/buyers', buyerRoutes);
app.use('/api/auth', roleAuthRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/support', supportRoutes);
app.use(publicStoreRoutes);

async function connectDatabase() {
    let attempt = 0;
    while (true) {
        try {
            await sequelize.authenticate();
            await sequelize.sync({ alter: true });
            markDbReady();
            console.log('PostgreSQL connection and models synced');
            console.log('[db] Ready:', {
                host: process.env.DB_HOST || process.env.PGHOST,
                port: process.env.DB_PORT || process.env.PGPORT || 5432,
                database: process.env.DB_NAME || process.env.PGDATABASE,
                user: process.env.DB_USER || process.env.PGUSER
            });
            return;
        } catch (error) {
            markDbDown();
            attempt += 1;
            console.error('Database connection error:', error.message);
            const wait = Math.min(1000 * attempt, 8000);
            await new Promise((resolve) => setTimeout(resolve, wait));
        }
    }
}

function startServer() {
    return new Promise((resolve, reject) => {
        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Frontend URL:', FRONTEND_URL);
            console.log('API URL:', API_URL);
            connectDatabase()
                .then(() => resolve(PORT))
                .catch(reject);
        });
        server.on('error', reject);
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error('Server startup error:', error);
    });
}

module.exports = { app, startServer, connectDatabase };
