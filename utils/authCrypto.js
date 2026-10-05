const bcrypt = require('bcryptjs');

async function hashPassword(value) {
    return bcrypt.hash(String(value || ''), 10);
}

async function matchPassword(value, hash) {
    if (!hash) return false;
    return bcrypt.compare(String(value || ''), hash);
}

function cleanEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function cleanPhone(value) {
    return String(value || '').replace(/[^\d+]/g, '');
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validPhone(phone) {
    return /^\+?\d{10,15}$/.test(phone);
}

module.exports = {
    hashPassword,
    matchPassword,
    cleanEmail,
    cleanPhone,
    validEmail,
    validPhone
};
