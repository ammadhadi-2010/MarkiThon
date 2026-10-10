#!/usr/bin/env node
/**
 * Upsert Super Admin credentials used by /admin/login and /login.
 * Usage: npm run seed:admin
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const {
    OFFICIAL_ADMIN_EMAIL,
    upsertSuperAdmin
} = require('../utils/adminAuthStore');

const DEFAULT_PASSWORD = 'Admin@MarkiThon2026';

async function main() {
    const email = String(process.env.ADMIN_EMAIL || OFFICIAL_ADMIN_EMAIL).trim().toLowerCase();
    const password = String(process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD);
    const name = String(process.env.ADMIN_NAME || 'Super Admin').trim() || 'Super Admin';

    const result = await upsertSuperAdmin({ email, password, name, role: 'admin' });
    console.log('[seed:admin] Super Admin ready.');
    console.log('  email :', result.email);
    console.log('  name  :', result.name);
    console.log('  role  :', result.role);
    console.log('  action:', result.created ? 'created' : 'updated (role + password reset)');
    console.log('  login : /admin/login  or  /login');
}

main().catch((error) => {
    console.error('[seed:admin] Failed:', error.message || error);
    process.exit(1);
});
