const { verifyAuth, readAuthToken } = require('../utils/authToken');

function requireAdminPage(req, res, next) {
    const payload = verifyAuth(readAuthToken(req));
    if (payload && payload.role === 'admin') return next();
    const nextPath = encodeURIComponent(req.originalUrl || '/admin');
    return res.redirect(302, '/login?reason=unauthorized&next=' + nextPath);
}

module.exports = { requireAdminPage };
