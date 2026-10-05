const VendorAccount = require('../models/VendorAccount');
const { hashPassword, matchPassword } = require('../utils/authCrypto');
const {
    publicVendor,
    putChallenge,
    takeChallenge,
    randomChallenge,
    ensureDefaultVendor
} = require('../utils/vendorProfile');

async function loadVendor(req) {
    await ensureDefaultVendor();
    return VendorAccount.findByPk(req.auth.sub);
}

async function saveSecurity(req, res) {
    try {
        const vendor = await loadVendor(req);
        if (!vendor) return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
        const current = String(req.body.currentPassword || '');
        const next = String(req.body.newPassword || '');
        const confirm = String(req.body.confirmPassword || '');
        if (next || confirm || current) {
            if (!(await matchPassword(current, vendor.password))) {
                return res.status(400).json({ message: 'Current password is incorrect.' });
            }
            if (next.length < 6) return res.status(400).json({ message: 'Use a new password of at least 6 characters.' });
            if (next !== confirm) return res.status(400).json({ message: 'New password and confirmation do not match.' });
            vendor.password = await hashPassword(next);
        }
        if (typeof req.body.biometricEnabled === 'boolean') {
            if (req.body.biometricEnabled && !vendor.webauthnCredId) {
                return res.status(400).json({ message: 'Register a thumb scan before enabling quick access.' });
            }
            vendor.biometricEnabled = req.body.biometricEnabled;
            if (!req.body.biometricEnabled) {
                vendor.webauthnCredId = null;
                vendor.webauthnPublicKey = null;
            }
        }
        await vendor.save();
        return res.status(200).json({ message: 'Security settings updated.', profile: publicVendor(vendor) });
    } catch (error) {
        return res.status(500).json({ message: 'Could not update security settings.' });
    }
}

async function webauthnBegin(req, res) {
    try {
        const vendor = await loadVendor(req);
        if (!vendor) return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
        const challenge = randomChallenge();
        putChallenge('reg:' + vendor.id, challenge);
        return res.status(200).json({
            challenge,
            rp: { name: 'MarkiThon', id: req.hostname === 'localhost' ? 'localhost' : req.hostname },
            user: {
                id: Buffer.from(vendor.id.replace(/-/g, '').slice(0, 32)).toString('base64url'),
                name: vendor.email,
                displayName: vendor.ownerName
            },
            pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
                residentKey: 'preferred'
            },
            timeout: 60000
        });
    } catch (error) {
        return res.status(500).json({ message: 'Could not start thumb scan registration.' });
    }
}

async function webauthnFinish(req, res) {
    try {
        const vendor = await loadVendor(req);
        if (!vendor) return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
        const expected = takeChallenge('reg:' + vendor.id);
        if (!expected) return res.status(400).json({ message: 'Thumb scan challenge expired. Try again.' });
        const credId = String(req.body.id || req.body.rawId || '').trim();
        if (credId.length < 8) return res.status(400).json({ message: 'Thumb scan credential was incomplete.' });
        vendor.webauthnCredId = credId.slice(0, 255);
        vendor.webauthnPublicKey = String(req.body.publicKey || req.body.response && req.body.response.clientDataJSON || '').slice(0, 2000);
        vendor.biometricEnabled = true;
        await vendor.save();
        return res.status(200).json({
            message: 'Thumb scan login enabled.',
            profile: publicVendor(vendor)
        });
    } catch (error) {
        return res.status(500).json({ message: 'Could not save thumb scan login.' });
    }
}

async function changePassword(req, res) {
    try {
        const vendor = await loadVendor(req);
        if (!vendor) return res.status(401).json({ message: 'Sign in as a shopkeeper to continue.' });
        const current = String(req.body.currentPassword || '');
        const next = String(req.body.newPassword || '');
        const confirm = String(req.body.confirmPassword || '');
        if (!(await matchPassword(current, vendor.password))) {
            return res.status(400).json({ message: 'Current password is incorrect.' });
        }
        if (next.length < 6) return res.status(400).json({ message: 'Use a new password of at least 6 characters.' });
        if (next !== confirm) return res.status(400).json({ message: 'New password and confirmation do not match.' });
        vendor.password = await hashPassword(next);
        await vendor.save();
        return res.status(200).json({ message: 'Password updated.', profile: publicVendor(vendor) });
    } catch (error) {
        return res.status(500).json({ message: 'Could not update the password.' });
    }
}

module.exports = { saveSecurity, changePassword, webauthnBegin, webauthnFinish };
