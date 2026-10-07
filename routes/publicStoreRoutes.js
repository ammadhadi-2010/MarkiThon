const path = require('path');
const express = require('express');
const router = express.Router();

const SKIP = new Set([
    'api', 'css', 'js', 'img', 'images', 'fonts', 'assets', 'public',
    'app', 'dashboard', 'market', 'views', 'components', 'online-store', 'customers',
    'about', 'contact', 'blog', 'product', 'store', 'admin', 'profile',
    'mission', 'careers', 'terms', 'privacy', 'faqs', 'delivery', 'returns',
    'vendor', 'login', 'signup', 'forgot-password', 'settings', 'store-settings', 'inventory', 'expenses'
]);

function sendMarketplace(req, res) {
    res.sendFile(path.join(__dirname, '../public/views/public/marketplace.html'));
}

function sendAdminApp(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
}

function sendPlatformAdmin(req, res) {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
}

function sendAdminLogin(req, res) {
    res.sendFile(path.join(__dirname, '../public/admin-login.html'));
}

function sendVendorLogin(req, res) {
    res.sendFile(path.join(__dirname, '../public/vendor-login.html'));
}

function sendVendorRegister(req, res) {
    res.sendFile(path.join(__dirname, '../public/vendor-register.html'));
}

function sendCustomerLogin(req, res) {
    res.sendFile(path.join(__dirname, '../public/customer-login.html'));
}

function sendCustomerSignup(req, res) {
    res.sendFile(path.join(__dirname, '../public/customer-signup.html'));
}

function sendCustomerForgot(req, res) {
    res.sendFile(path.join(__dirname, '../public/customer-forgot.html'));
}

function sendShopCatalog(req, res, next) {
    const slug = String(req.params.shopSlug || '').toLowerCase();
    if (!slug || SKIP.has(slug) || slug.includes('.')) return next();
    res.sendFile(path.join(__dirname, '../public/storefront.html'));
}

function redirectStoreCustomers(req, res) {
    res.redirect(302, '/customers');
}

router.get('/', sendMarketplace);
router.get('/about', sendMarketplace);
router.get('/mission', sendMarketplace);
router.get('/careers', sendMarketplace);
router.get('/terms', sendMarketplace);
router.get('/privacy', sendMarketplace);
router.get('/faqs', sendMarketplace);
router.get('/delivery', sendMarketplace);
router.get('/returns', sendMarketplace);
router.get('/contact', sendMarketplace);
router.get('/blog', sendMarketplace);
router.get('/product/:id', sendMarketplace);
router.get('/profile/orders', sendMarketplace);
router.get('/profile/orders/:id', sendMarketplace);
router.get('/login', sendCustomerLogin);
router.get('/signup', sendCustomerSignup);
router.get('/forgot-password', sendCustomerForgot);
router.get('/vendor/login', sendVendorLogin);
router.get('/vendor/register', sendVendorRegister);
router.get('/vendor/dashboard', sendAdminApp);
router.get('/vendor/dashboard/*', sendAdminApp);
router.get('/store/:shopSlug', sendShopCatalog);
router.get('/admin/login', sendAdminLogin);
router.get('/admin', sendPlatformAdmin);
router.get('/admin/shops/:id', sendPlatformAdmin);
router.get('/admin/support/:id', sendPlatformAdmin);
router.get('/app', sendAdminApp);
router.get('/app/*', sendAdminApp);
router.get('/online-store/customers', redirectStoreCustomers);
router.get('/online-store/customers/:rest', redirectStoreCustomers);
router.get('/customers', sendAdminApp);
router.get('/customers/:rest', sendAdminApp);
router.get('/online-store/products', sendAdminApp);
router.get('/online-store/products/edit/:id', sendAdminApp);
router.get('/dashboard', sendAdminApp);
router.get('/dashboard/*', sendAdminApp);
router.get('/settings', sendAdminApp);
router.get('/settings/*', sendAdminApp);
router.get('/store-settings', sendAdminApp);
router.get('/store-settings/*', sendAdminApp);
router.get('/inventory', sendAdminApp);
router.get('/inventory/*', sendAdminApp);
router.get('/expenses', sendAdminApp);
router.get('/expenses/*', sendAdminApp);
router.get('/:shopSlug', sendShopCatalog);

module.exports = router;
