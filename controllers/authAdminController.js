const { signAuth, setAuthCookie, clearAuthCookie, verifyAuth, readAuthToken } = require('../utils/authToken');
const {
    publicAdmin,
    findAdminByEmail,
    verifyAdmin,
    ensureOfficialAdmin,
    changeAdminPassword,
    updateAdminProfile
} = require('../utils/adminAuthStore');
const { cleanEmail } = require('../utils/authCrypto');

function sendAdmin(res, user, status) {
    const token = signAuth({ sub: user.id, role: 'admin', email: user.email }, '7d');
    setAuthCookie(res, token);
    res.status(status || 200).json({
        token,
        role: 'admin',
        redirect: '/admin',
        user: publicAdmin(user)
    });
}

function adminFromReq(req) {
    const payload = verifyAuth(readAuthToken(req));
    if (!payload || payload.role !== 'admin') return null;
    return payload;
}

async function adminLogin(req, res) {
    try {
        await ensureOfficialAdmin();
        const email = cleanEmail(req.body.email);
        const password = String(req.body.password || '');
        const user = await verifyAdmin(email, password);
        if (!user) return res.status(401).json({ message: 'Invalid admin email or password.' });
        return sendAdmin(res, user);
    } catch (error) {
        return res.status(500).json({ message: 'Could not sign in as admin.' });
    }
}

async function adminMe(req, res) {
    try {
        const payload = adminFromReq(req);
        if (!payload) return res.status(401).json({ message: 'Sign in as an admin to continue.' });
        const user = await findAdminByEmail(payload.email || '');
        if (!user) return res.status(401).json({ message: 'Sign in as an admin to continue.' });
        return res.status(200).json({ user: publicAdmin(user) });
    } catch (error) {
        return res.status(401).json({ message: 'Sign in as an admin to continue.' });
    }
}

async function adminUpdateProfile(req, res) {
    try {
        const payload = adminFromReq(req);
        if (!payload) return res.status(401).json({ message: 'Sign in as an admin to continue.' });
        const user = await updateAdminProfile(payload.email || '', {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone != null ? req.body.phone : req.body.phoneNumber,
            avatarUrl: req.body.avatarUrl || req.body.avatar
        });
        if (user && user.conflict) {
            return res.status(400).json({ message: 'That email is already in use.' });
        }
        if (!user) return res.status(404).json({ message: 'Admin account was not found.' });
        return sendAdmin(res, user);
    } catch (error) {
        return res.status(500).json({ message: 'Could not update the admin profile.' });
    }
}

async function adminUpdatePassword(req, res) {
    try {
        const payload = adminFromReq(req);
        if (!payload) return res.status(401).json({ message: 'Sign in as an admin to continue.' });
        const current = String(req.body.currentPassword || req.body.current || '');
        const next = String(req.body.newPassword || '');
        const confirm = String(req.body.confirmPassword || '');
        if (!current) return res.status(400).json({ message: 'Enter your current password.' });
        if (next.length < 6) {
            return res.status(400).json({ message: 'Use a new password of at least 6 characters.' });
        }
        if (next !== confirm) {
            return res.status(400).json({ message: 'New password and confirmation do not match.' });
        }
        const user = await changeAdminPassword(payload.email || '', current, next);
        if (user && user.missing) {
            return res.status(404).json({ message: 'Admin account was not found.' });
        }
        if (user && user.invalidCurrent) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }
        return res.status(200).json({ message: 'Admin password updated.', user: publicAdmin(user) });
    } catch (error) {
        return res.status(500).json({ message: 'Could not update the admin password.' });
    }
}

function logout(req, res) {
    clearAuthCookie(res);
    res.status(200).json({ message: 'Signed out.' });
}

module.exports = {
    adminLogin,
    adminMe,
    adminUpdateProfile,
    adminUpdatePassword,
    logout
};
