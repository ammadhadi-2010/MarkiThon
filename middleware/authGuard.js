const { verifyAuth, readAuthToken } = require('../utils/authToken');

function requireAuth(req, res, next) {
    const payload = verifyAuth(readAuthToken(req));
    if (!payload || !payload.sub || !payload.role) {
        return res.status(401).json({ message: 'Sign in to continue.' });
    }
    req.auth = payload;
    return next();
}

function requireRole(roles) {
    const allowed = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
        requireAuth(req, res, () => {
            if (!allowed.includes(req.auth.role)) {
                return res.status(403).json({ message: 'You do not have access to this area.' });
            }
            return next();
        });
    };
}

module.exports = { requireAuth, requireRole };
