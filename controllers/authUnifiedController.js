const VendorAccount = require('../models/VendorAccount');
const BuyerAccount = require('../models/BuyerAccount');
const { matchPassword, cleanEmail, validEmail } = require('../utils/authCrypto');
const { signAuth, setAuthCookie } = require('../utils/authToken');
const { publicAdmin, verifyAdmin, ensureOfficialAdmin } = require('../utils/adminAuthStore');
const { publicVendor } = require('../utils/vendorProfile');

function publicCustomer(row) {
    const buyer = row.toJSON ? row.toJSON() : row;
    return {
        id: buyer.id,
        role: 'customer',
        name: buyer.name,
        email: buyer.email || '',
        phone: buyer.phone || ''
    };
}

async function unifiedLogin(req, res) {
    try {
        await ensureOfficialAdmin();
        const email = cleanEmail(req.body.email);
        const password = String(req.body.password || '');
        if (!validEmail(email) || !password) {
            return res.status(400).json({ message: 'Enter email and password.' });
        }

        const admin = await verifyAdmin(email, password);
        if (admin) {
            const token = signAuth({ sub: admin.id, role: 'admin', email: admin.email }, '7d');
            setAuthCookie(res, token);
            return res.status(200).json({
                token,
                role: 'admin',
                redirect: '/admin',
                user: publicAdmin(admin),
                message: 'Signed in as Super Admin.'
            });
        }

        const vendor = await VendorAccount.findOne({ where: { email } });
        if (vendor) {
            const ok = await matchPassword(password, vendor.password);
            if (!ok) return res.status(401).json({ message: 'Invalid email or password.' });
            if (vendor.status !== 'Active') {
                return res.status(403).json({
                    message: 'Your account is Pending Admin Approval. You can sign in after an admin approves it.',
                    user: publicVendor(vendor),
                    role: 'shopkeeper'
                });
            }
            const token = signAuth({ sub: vendor.id, role: 'vendor', status: vendor.status }, '7d');
            setAuthCookie(res, token);
            return res.status(200).json({
                token,
                role: 'shopkeeper',
                redirect: '/app',
                user: publicVendor(vendor),
                message: 'Signed in as shopkeeper.'
            });
        }

        const buyer = await BuyerAccount.findOne({ where: { email } });
        if (buyer && buyer.role === 'buyer' && buyer.password) {
            if (buyer.authProvider === 'google') {
                return res.status(400).json({ message: 'Use Continue with Google for this account.' });
            }
            const ok = await matchPassword(password, buyer.password);
            if (!ok) return res.status(401).json({ message: 'Invalid email or password.' });
            const token = signAuth({ sub: buyer.id, role: 'customer', provider: buyer.authProvider }, '30d');
            setAuthCookie(res, token);
            return res.status(200).json({
                token,
                role: 'customer',
                redirect: '/',
                user: publicCustomer(buyer),
                message: 'Signed in as customer.'
            });
        }

        return res.status(401).json({ message: 'Invalid email or password.' });
    } catch (error) {
        return res.status(500).json({ message: 'Could not sign in.' });
    }
}

module.exports = { unifiedLogin };
