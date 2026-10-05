const fs = require('fs');
const path = require('path');
const { hashPassword, matchPassword, cleanEmail, validEmail } = require('./authCrypto');

const file = path.join(__dirname, '../data/admin-auth.json');

async function seedAdmins() {
    const password = await hashPassword('MarkiThon@Admin1');
    return {
        users: [{
            id: 'admin-1',
            role: 'admin',
            name: 'Super Admin',
            email: 'admin@markithon.com',
            password
        }]
    };
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
    return { id: user.id, role: 'admin', name: user.name, email: user.email };
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

async function updateAdminProfile(email, patch) {
    const store = await readAdmins();
    const cleaned = cleanEmail(email);
    const user = store.users.find((row) => row.email === cleaned) || store.users[0];
    if (!user) return null;
    const name = String(patch.name || '').trim().slice(0, 80);
    const nextEmail = cleanEmail(patch.email);
    if (name.length >= 2) user.name = name;
    if (nextEmail && validEmail(nextEmail)) {
        const clash = store.users.find((row) => row.email === nextEmail && row.id !== user.id);
        if (clash) return { conflict: true };
        user.email = nextEmail;
    }
    await writeAdmins(store);
    return user;
}

module.exports = {
    publicAdmin,
    findAdminByEmail,
    verifyAdmin,
    readAdmins,
    resolveAdminBypass,
    updateAdminPassword,
    updateAdminProfile
};
