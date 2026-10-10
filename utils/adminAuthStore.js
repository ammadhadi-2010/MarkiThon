const fs = require('fs');
const path = require('path');
const { hashPassword, matchPassword, cleanEmail, validEmail } = require('./authCrypto');
const { safeAdminAvatarUrl } = require('./adminAvatarUpload');

const file = path.join(__dirname, '../data/admin-auth.json');

const OFFICIAL_ADMIN_EMAIL = 'markithon.official@gmail.com';

async function seedAdmins() {
    const password = await hashPassword('Admin@MarkiThon2026');
    return {
        users: [{
            id: 'admin-1',
            role: 'admin',
            name: 'Super Admin',
            email: OFFICIAL_ADMIN_EMAIL,
            password
        }, {
            id: 'admin-legacy',
            role: 'admin',
            name: 'Super Admin',
            email: 'admin@markithon.com',
            password
        }]
    };
}

async function ensureOfficialAdmin() {
    const store = await readAdmins();
    const user = store.users.find((row) => row.email === OFFICIAL_ADMIN_EMAIL);
    if (user) return store;
    const bootstrap = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.ADMIN_PASSWORD || '').trim()
        || 'Admin@MarkiThon2026';
    store.users.unshift({
        id: 'admin-official',
        role: 'admin',
        name: 'Super Admin',
        email: OFFICIAL_ADMIN_EMAIL,
        password: await hashPassword(bootstrap)
    });
    await writeAdmins(store);
    return store;
}

async function readAdmins() {
    try {
        const row = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (row && Array.isArray(row.users) && row.users.length) return row;
    } catch (error) {
        /* Seed on first use. */
    }
    const seeded = await seedAdmins();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(seeded, null, 2));
    return seeded;
}

function publicAdmin(user) {
    return {
        id: user.id,
        role: 'admin',
        name: user.name || 'Super Admin',
        email: user.email || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || ''
    };
}

async function findAdminByEmail(email) {
    const store = await readAdmins();
    return store.users.find((row) => row.email === cleanEmail(email)) || null;
}

async function verifyAdmin(email, password) {
    if (!validEmail(email)) return null;
    const user = await findAdminByEmail(email);
    if (!user) return null;
    const ok = await matchPassword(password, user.password);
    return ok ? user : null;
}

async function writeAdmins(store) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(store, null, 2));
}

/** Temporary: resolve admin without password match. */
async function resolveAdminBypass(email) {
    const match = await findAdminByEmail(email);
    if (match) return match;
    const store = await readAdmins();
    return store.users[0] || null;
}

async function updateAdminPassword(email, nextPassword) {
    const store = await readAdmins();
    const cleaned = cleanEmail(email);
    const user = store.users.find((row) => row.email === cleaned) || store.users[0];
    if (!user) return null;
    user.password = await hashPassword(nextPassword);
    await writeAdmins(store);
    return user;
}

async function changeAdminPassword(email, currentPassword, nextPassword) {
    const store = await readAdmins();
    const cleaned = cleanEmail(email);
    const user = store.users.find((row) => row.email === cleaned);
    if (!user) return { missing: true };
    const ok = await matchPassword(String(currentPassword || ''), user.password);
    if (!ok) return { invalidCurrent: true };
    user.password = await hashPassword(nextPassword);
    await writeAdmins(store);
    return user;
}

async function updateAdminProfile(email, patch) {
    const store = await readAdmins();
    const cleaned = cleanEmail(email);
    const user = store.users.find((row) => row.email === cleaned) || store.users[0];
    if (!user) return null;
    const name = String(patch.name || '').trim().slice(0, 80);
    const nextEmail = cleanEmail(patch.email);
    const phone = String(patch.phone || '').trim().slice(0, 24);
    if (name.length >= 2) user.name = name;
    if (patch.phone !== undefined) user.phone = phone;
    if (patch.avatarUrl !== undefined || patch.avatar !== undefined) {
        user.avatarUrl = safeAdminAvatarUrl(patch.avatarUrl || patch.avatar);
    }
    if (nextEmail && validEmail(nextEmail)) {
        const clash = store.users.find((row) => row.email === nextEmail && row.id !== user.id);
        if (clash) return { conflict: true };
        user.email = nextEmail;
    }
    await writeAdmins(store);
    return user;
}

/** Create or update Super Admin (used by scripts/createAdmin.js). */
async function upsertSuperAdmin(opts) {
    const email = cleanEmail((opts && opts.email) || OFFICIAL_ADMIN_EMAIL);
    const name = String((opts && opts.name) || 'Super Admin').trim().slice(0, 80) || 'Super Admin';
    const password = String((opts && opts.password) || 'Admin@MarkiThon2026');
    const role = String((opts && opts.role) || 'admin');
    if (!validEmail(email)) throw new Error('A valid admin email is required.');
    if (password.length < 6) throw new Error('Admin password must be at least 6 characters.');

    const store = await readAdmins();
    let user = store.users.find((row) => row.email === email);
    const created = !user;
    if (!user) {
        user = {
            id: 'admin-' + Date.now().toString(36),
            role: 'admin',
            name,
            email,
            password: ''
        };
        store.users.unshift(user);
    }
    user.role = role === 'admin' ? 'admin' : 'admin';
    user.name = name;
    user.email = email;
    user.password = await hashPassword(password);
    await writeAdmins(store);
    return { ...publicAdmin(user), created };
}

module.exports = {
    publicAdmin,
    findAdminByEmail,
    verifyAdmin,
    readAdmins,
    ensureOfficialAdmin,
    resolveAdminBypass,
    updateAdminPassword,
    changeAdminPassword,
    updateAdminProfile,
    upsertSuperAdmin,
    OFFICIAL_ADMIN_EMAIL
};
