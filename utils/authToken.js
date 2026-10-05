const jwt = require('jsonwebtoken');
const { isProd, cookieDomain } = require('../config/cloudEnv');

const SECRET = process.env.JWT_SECRET || 'markithon_secret';
const COOKIE = 'mt_token';
const MAX_AGE = 60 * 60 * 24 * 7;

function signAuth(payload, days) {
    return jwt.sign(payload, SECRET, { expiresIn: days || '7d' });
}

function verifyAuth(token) {
    if (!token) return null;
    try {
        return jwt.verify(token, SECRET);
    } catch (error) {
        return null;
    }
}

function readCookie(req, name) {
    const raw = String(req.headers.cookie || '');
    const match = raw.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[1]) : '';
}

function readAuthToken(req) {
    const header = String(req.headers.authorization || '');
    if (header.startsWith('Bearer ')) return header.slice(7).trim();
    return readCookie(req, COOKIE);
}

function cookieFlags(maxAge) {
    const parts = [
        'HttpOnly',
        'Path=/',
        'Max-Age=' + maxAge
    ];
    if (isProd) {
        parts.push('Secure');
        parts.push('SameSite=None');
        const domain = cookieDomain();
        if (domain) parts.push('Domain=' + domain);
    } else {
        parts.push('SameSite=Lax');
    }
    return parts.join('; ');
}

function setAuthCookie(res, token) {
    res.setHeader(
        'Set-Cookie',
        COOKIE + '=' + encodeURIComponent(token) + '; ' + cookieFlags(MAX_AGE)
    );
}

function clearAuthCookie(res) {
    res.setHeader(
        'Set-Cookie',
        COOKIE + '=; ' + cookieFlags(0)
    );
}

module.exports = {
    COOKIE,
    signAuth,
    verifyAuth,
    readAuthToken,
    setAuthCookie,
    clearAuthCookie
};
