const fs = require('fs');
const path = require('path');
const PlatformCategoryStore = require('../models/PlatformCategoryStore');
const { SHOP_CATALOG } = require('./shopTypeCatalog');

const treeFile = path.join(__dirname, '../data/admin-category-tree.json');
let cache = null;

function readJson(target, fallback) {
    try {
        const data = JSON.parse(fs.readFileSync(target, 'utf8'));
        return data == null ? fallback : data;
    } catch (error) {
        return fallback;
    }
}

function writeJsonBackup(data) {
    try {
        fs.mkdirSync(path.dirname(treeFile), { recursive: true });
        fs.writeFileSync(treeFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.warn('[categories] Backup write skipped:', error.message);
    }
}

function isTreeEmpty(saved) {
    if (!saved || typeof saved !== 'object') return true;
    return !Object.keys(saved).some((shopType) => {
        const row = saved[shopType];
        return row && typeof row === 'object' && Object.keys(row).length > 0;
    });
}

function emptyTree() {
    const tree = {};
    Object.keys(SHOP_CATALOG).forEach((shopType) => {
        tree[shopType] = {};
        SHOP_CATALOG[shopType].categories.forEach((name) => {
            tree[shopType][name] = { locked: true, isCustomized: false, subs: [], icon: '📁' };
        });
    });
    return tree;
}

function normalizeTree(saved) {
    const tree = {};
    Object.keys(saved || {}).forEach((shopType) => {
        const row = saved[shopType];
        if (!row || typeof row !== 'object') return;
        tree[shopType] = {};
        Object.keys(row).forEach((name) => {
            const entry = row[name] || {};
            const standard = SHOP_CATALOG[shopType]
                && SHOP_CATALOG[shopType].categories.includes(name);
            const customized = Boolean(entry.isCustomized);
            tree[shopType][name] = {
                locked: customized ? false
                    : (entry.locked !== undefined ? Boolean(entry.locked) : Boolean(standard)),
                isCustomized: customized,
                subs: [...new Set((Array.isArray(entry.subs) ? entry.subs : [])
                    .map((s) => String(s || '').trim()).filter(Boolean))],
                icon: String(entry.icon || '📁').trim().slice(0, 8) || '📁'
            };
        });
    });
    Object.keys(SHOP_CATALOG).forEach((shopType) => {
        if (!tree[shopType]) tree[shopType] = {};
    });
    return tree;
}

function cloneTree(tree) {
    return JSON.parse(JSON.stringify(tree || {}));
}

/** Boot once: seed defaults only when the DB collection is empty. Never overwrite existing rows. */
async function initCategoryStore() {
    const count = await PlatformCategoryStore.count();
    if (count === 0) {
        const fromFile = readJson(treeFile, null);
        const seeded = isTreeEmpty(fromFile) ? emptyTree() : normalizeTree(fromFile);
        await PlatformCategoryStore.create({ tree: seeded });
        cache = cloneTree(seeded);
        writeJsonBackup(seeded);
        console.log('[categories] Seeded platform category tree (DB was empty).');
        return cache;
    }
    const row = await PlatformCategoryStore.findOne({ order: [['id', 'ASC']] });
    cache = normalizeTree(row && row.tree);
    return cache;
}

function loadTree() {
    if (!cache) {
        const fromFile = readJson(treeFile, null);
        cache = isTreeEmpty(fromFile) ? emptyTree() : normalizeTree(fromFile);
    }
    return cloneTree(cache);
}

async function saveTree(tree) {
    const next = normalizeTree(tree);
    cache = cloneTree(next);
    writeJsonBackup(next);
    const row = await PlatformCategoryStore.findOne({ order: [['id', 'ASC']] });
    if (row) await row.update({ tree: next });
    else await PlatformCategoryStore.create({ tree: next });
    return cache;
}

module.exports = {
    initCategoryStore,
    loadTree,
    saveTree,
    emptyTree,
    isTreeEmpty
};
