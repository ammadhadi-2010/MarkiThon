const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'markithon_secret';

function signBuyer(buyer) {
    return jwt.sign(
        { sub: buyer.id, role: 'customer', provider: buyer.authProvider },
        SECRET,
        { expiresIn: '30d' }
    );
}

function readBuyerToken(header) {
    const raw = String(header || '');
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : '';
    if (!token) return null;
    const payload = jwt.verify(token, SECRET);
    if (!payload || !payload.sub) return null;
    if (payload.role !== 'buyer' && payload.role !== 'customer') return null;
    return payload;
}

function publicBuyer(row) {
    const buyer = row.toJSON ? row.toJSON() : row;
    const prefs = buyer.preferences || {};
    const roleRaw = String(buyer.role || 'buyer').toLowerCase();
    const isVendor = roleRaw === 'shopkeeper' || roleRaw === 'vendor' || prefs.isVendor === true;
    return {
        id: buyer.id,
        role: isVendor ? 'shopkeeper' : 'customer',
        isVendor,
        hasShop: isVendor || Boolean(prefs.hasShop),
        name: buyer.name,
        email: buyer.email || '',
        phone: buyer.phone || '',
        authProvider: buyer.authProvider,
        imageUrl: prefs.avatar || '',
        verified: Boolean(prefs.verified) || buyer.authProvider === 'google',
        subtitle: isVendor ? 'Vendor' : 'Customer',
        preferences: prefs
    };
}

module.exports = { signBuyer, readBuyerToken, publicBuyer };
