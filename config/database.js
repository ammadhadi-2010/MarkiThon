const path = require('path');
const { Sequelize } = require('sequelize');

// Load repo-root .env explicitly so a different process.cwd() cannot skip it.
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function envText(key) {
    const raw = process.env[key];
    if (raw == null) return null;
    return String(raw).trim();
}

function firstEnv(...keys) {
    for (const key of keys) {
        const value = envText(key);
        if (value != null && value !== '') return value;
    }
    return null;
}

function readDbConfig() {
    const databaseUrl = firstEnv('DATABASE_URL');
    if (databaseUrl) return { databaseUrl, fromUrl: true };

    const host = firstEnv('DB_HOST', 'PGHOST');
    const port = Number(firstEnv('DB_PORT', 'PGPORT') || 5432) || 5432;
    const database = firstEnv('DB_NAME', 'PGDATABASE');
    const username = firstEnv('DB_USER', 'PGUSER');
    // Prefer DB_PASSWORD; accept PGPASSWORD. No hardcoded password fallback.
    const passwordKey = envText('DB_PASSWORD') != null ? 'DB_PASSWORD'
        : (envText('PGPASSWORD') != null ? 'PGPASSWORD' : null);
    const password = passwordKey ? envText(passwordKey) : null;
    const ssl = firstEnv('DB_SSL') === '1';

    const missing = [];
    if (!host) missing.push('DB_HOST');
    if (!database) missing.push('DB_NAME');
    if (!username) missing.push('DB_USER');
    if (!passwordKey) missing.push('DB_PASSWORD (or PGPASSWORD)');
    if (missing.length) {
        throw new Error('Missing database env: ' + missing.join(', '));
    }

    return { host, port, database, username, password, passwordKey, ssl, fromUrl: false };
}

const db = readDbConfig();

console.log('[db] Connecting with', db.fromUrl
    ? { source: 'DATABASE_URL', dialect: 'postgres' }
    : {
        source: '.env',
        host: db.host,
        port: db.port,
        database: db.database,
        user: db.username,
        passwordEnv: db.passwordKey,
        passwordSet: db.password !== null && db.password !== '',
        ssl: db.ssl
    });

const pool = { max: 10, min: 0, acquire: 30000, idle: 10000 };
const sslOpts = db.ssl || firstEnv('DB_SSL') === '1'
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : {};

const sequelize = db.fromUrl
    ? new Sequelize(db.databaseUrl, {
        dialect: 'postgres',
        logging: false,
        dialectOptions: sslOpts,
        pool
    })
    : new Sequelize(db.database, db.username, db.password, {
        host: db.host,
        port: db.port,
        dialect: 'postgres',
        logging: false,
        dialectOptions: sslOpts,
        pool
    });

module.exports = sequelize;
