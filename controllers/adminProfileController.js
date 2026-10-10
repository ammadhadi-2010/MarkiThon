const { signAuth, setAuthCookie, verifyAuth, readAuthToken } = require('../utils/authToken');
const {
    publicAdmin,
    findAdminByEmail,
    updateAdminProfile,
    changeAdminPassword
} = require('../utils/adminAuthStore');
const { writeAdminAvatar } = require('../utils/adminAvatarUpload');

function adminPayload(req) {
    const payload = verifyAuth(readAuthToken(req));
    if (!payload || payload.role !== 'admin') return null;
    return payload;
}

function sendAdminSession(res, user, status) {
    const token = signAuth({ sub: user.id, role: 'admin', email: user.email }, '7d');
    setAuthCookie(res, token);
    res.status(status || 200).json({ token, user: publicAdmin(user) });
}

exports.getProfile = async (req, res) => {
    try {
        const payload = adminPayload(req);
        if (!payload) return res.status(401).json({ message: 'Sign in as an admin to continue.' });
        const user = await findAdminByEmail(payload.email || '');
        if (!user) return res.status(404).json({ message: 'Admin account was not found.' });
        return res.status(200).json({ user: publicAdmin(user) });
    } catch (error) {
        return res.status(500).json({ message: 'Could not load admin profile.' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const payload = adminPayload(req);
        if (!payload) return res.status(401).json({ message: 'Sign in as an admin to continue.' });
        const body = req.body || {};
        const user = await updateAdminProfile(payload.email || '', {
            name: body.name,
            email: body.email,
            phone: body.phone != null ? body.phone : body.phoneNumber,
            avatarUrl: body.avatarUrl || body.avatar
        });
        if (user && user.conflict) {
            return res.status(400).json({ message: 'That email is already in use.' });
        }
        if (!user) return res.status(404).json({ message: 'Admin account was not found.' });
        return sendAdminSession(res, user);
    } catch (error) {
        return res.status(500).json({ message: 'Could not update the admin profile.' });
    }
};

exports.uploadAvatar = async (req, res) => {
    try {
        const payload = adminPayload(req);
        if (!payload) return res.status(401).json({ message: 'Sign in as an admin to continue.' });
        const url = writeAdminAvatar(req.body || {});
        if (!url) {
            return res.status(400).json({ message: 'Choose a PNG, JPG, or WebP image under 2 MB.' });
        }
        const user = await updateAdminProfile(payload.email || '', { avatarUrl: url });
        if (!user) return res.status(404).json({ message: 'Admin account was not found.' });
        return sendAdminSession(res, user);
    } catch (error) {
        return res.status(500).json({ message: 'Could not upload the profile image.' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const payload = adminPayload(req);
        if (!payload) return res.status(401).json({ message: 'Sign in as an admin to continue.' });
        const current = String(req.body.currentPassword || req.body.current || '');
        const next = String(req.body.newPassword || '');
        const confirm = String(req.body.confirmPassword || req.body.confirm || '');
        if (!current) return res.status(400).json({ message: 'Enter your current password.' });
        if (next.length < 6) {
            return res.status(400).json({ message: 'Use a new password of at least 6 characters.' });
        }
        if (next !== confirm) {
            return res.status(400).json({ message: 'New password and confirmation do not match.' });
        }
        const user = await changeAdminPassword(payload.email || '', current, next);
        if (user && user.missing) return res.status(404).json({ message: 'Admin account was not found.' });
        if (user && user.invalidCurrent) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }
        return res.status(200).json({ message: 'Password updated successfully.', user: publicAdmin(user) });
    } catch (error) {
        return res.status(500).json({ message: 'Could not update the admin password.' });
    }
};
