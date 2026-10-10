const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const VendorAccount = require('../models/VendorAccount');
const { hashPassword } = require('./authCrypto');

const challenges = new Map();

function publicVendor(row) {
    const vendor = row.toJSON ? row.toJSON() : row;
    return {
        id: vendor.id,
        role: 'vendor',
        shopkeeperId: vendor.shopkeeperId,
        shopName: vendor.shopName,
        ownerName: vendor.ownerName,
        fullName: vendor.ownerName || '',
        name: vendor.shopName || vendor.ownerName || '',
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        imageUrl: vendor.imageUrl || '',
        status: vendor.status,
        isApproved: vendor.status === 'Active',
        verified: vendor.status === 'Active',
        biometricEnabled: Boolean(vendor.biometricEnabled),
        hasWebAuthn: Boolean(vendor.webauthnCredId)
    };
}

async function nextShopkeeperId() {
    for (let attempt = 0; attempt < 12; attempt += 1) {
        const code = 'SK-' + String(Math.floor(1000 + Math.random() * 9000));
        const hit = await VendorAccount.findOne({ where: { shopkeeperId: code } });
        if (!hit) return code;
    }
    return 'SK-' + String(Date.now()).slice(-4);
}

function saveVendorImage(dataUrl) {
    const match = String(dataUrl || '').match(/^data:image\/(png|jpeg|jpg|webp);base64,([a-z0-9+/=\s]+)$/i);
    if (!match) return '';
    const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
    if (!buffer.length || buffer.length > 2 * 1024 * 1024) return '';
    const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase();
    const dir = path.join(__dirname, '../public/uploads/vendors');
    const name = 'vendor-' + Date.now() + '.' + ext;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buffer);
    return '/uploads/vendors/' + name;
}

function safeImage(value) {
    const url = String(value || '').trim();
    if (/^https?:\/\//i.test(url)) return url.slice(0, 300);
    if (/^\/uploads\/vendors\/[a-z0-9._-]+$/i.test(url)) return url;
    if (url.startsWith('data:image/')) return saveVendorImage(url);
    return '';
}

function putChallenge(key, value) {
    challenges.set(key, { value, at: Date.now() });
}

function takeChallenge(key) {
    const row = challenges.get(key);
    challenges.delete(key);
    if (!row || Date.now() - row.at > 5 * 60 * 1000) return '';
    return row.value;
}

function randomChallenge() {
    return crypto.randomBytes(32).toString('base64url');
}

async function ensureDefaultVendor() {
    const rows = await VendorAccount.findAll();
    for (const row of rows) {
        if (!row.shopkeeperId) {
            row.shopkeeperId = await nextShopkeeperId();
            await row.save();
        }
    }
    const email = 'shopkeeper@markithon.com';
    let row = await VendorAccount.findOne({ where: { email } });
    if (row) {
        if (row.status !== 'Active') {
            row.status = 'Active';
            await row.save();
        }
        return row;
    }
    return VendorAccount.create({
        shopkeeperId: 'SK-9042',
        shopName: 'Ammad Hadi Stor',
        ownerName: 'Ammad Hadi',
        email,
        phone: '03001234567',
        address: 'Local Market, Pakistan',
        password: await hashPassword('Shopkeeper@123'),
        status: 'Active',
        biometricEnabled: false
    });
}

module.exports = {
    publicVendor,
    nextShopkeeperId,
    safeImage,
    putChallenge,
    takeChallenge,
    randomChallenge,
    ensureDefaultVendor
};
