const { requireRole } = require('./authGuard');
const VendorAccount = require('../models/VendorAccount');
const { ensureVendorShopBound } = require('../utils/vendorShopBind');
const { runWithShopContext } = require('../utils/shopScope');

const vendorRole = requireRole('vendor');

/** Require an Active shopkeeper session and bind ShopId into request context. */
function requireVendorShop(req, res, next) {
    vendorRole(req, res, async () => {
        try {
            if (req.auth.status && req.auth.status !== 'Active') {
                return res.status(403).json({
                    message: 'Your account is Pending Admin Approval. Inventory access is locked.'
                });
            }
            const vendor = await VendorAccount.findByPk(req.auth.sub);
            if (!vendor) {
                return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
            }
            if (vendor.status !== 'Active') {
                return res.status(403).json({
                    message: 'Your account is Pending Admin Approval. Inventory access is locked.'
                });
            }
            const shopId = await ensureVendorShopBound(vendor);
            if (!shopId) {
                return res.status(403).json({ message: 'No shop is linked to this account.' });
            }
            req.auth.shopId = shopId;
            req.shopId = shopId;
            req.vendor = vendor;
            return runWithShopContext(shopId, 'vendor', () => next());
        } catch (error) {
            return res.status(500).json({ message: 'Could not verify shop ownership.' });
        }
    });
}

module.exports = { requireVendorShop };
