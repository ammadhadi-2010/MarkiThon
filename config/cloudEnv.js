const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const FRONTEND_URL = String(process.env.FRONTEND_URL || 'http://localhost:5000').replace(/\/$/, '');
const API_URL = String(process.env.API_URL || FRONTEND_URL).replace(/\/$/, '');
const isProd = process.env.NODE_ENV === 'production';

function defaultOrigins() {
    const list = [
        FRONTEND_URL,
        API_URL,
        'https://markithon.com',
        'https://www.markithon.com',
        'https://api.markithon.com',
        'http://localhost:5000',
        'http://127.0.0.1:5000'
    ];
    const extra = String(process.env.CORS_ORIGINS || '')
        .split(',')
        .map((row) => row.trim())
        .filter(Boolean);
    return [...new Set(list.concat(extra).filter(Boolean))];
}

function cookieDomain() {
    if (!isProd) return '';
    if (process.env.COOKIE_DOMAIN) return process.env.COOKIE_DOMAIN;
    try {
        const host = new URL(FRONTEND_URL).hostname;
        if (host.endsWith('markithon.com')) return '.markithon.com';
    } catch (error) {
        /* Keep host-only cookie. */
    }
    return '';
}

module.exports = {
    FRONTEND_URL,
    API_URL,
    isProd,
    corsOrigins: defaultOrigins(),
    cookieDomain: cookieDomain()
};
