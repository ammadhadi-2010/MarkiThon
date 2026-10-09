const fs = require('fs');
const path = require('path');
const { SHOP_CATALOG } = require('./shopTypeCatalog');

const treeFile = path.join(__dirname, '../data/admin-category-tree.json');

const SHOP_TYPE_ICONS = {
    'Clothing & Fashion': '👗',
    'Electronics & Mobile': '📱',
    'Grocery & Food': '🛒',
    'Beauty & Personal Care': '💄',
    'Home & Living': '🏠',
    'Furniture': '🛋️',
    'Sports & Fitness': '🏋️',
    'Books & Stationery': '📚',
    'Automotive': '🚗',
    'Kids & Toys': '🧸',
    'Jewellery & Accessories': '💎',
    'Hardware & Tools': '🔧',
    'Pharmacy & Health': '💊',
    'General / Multi-Category': '🏪'
};

function readJson(target, fallback) {
    try {
        const data = JSON.parse(fs.readFileSync(target, 'utf8'));
        return data == null ? fallback : data;
    } catch (error) {
        return fallback;
    }
}

function writeJson(target, data) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, JSON.stringify(data, null, 2));
}

function clean(value) {
    return String(value || '').trim().slice(0, 80);
}

function slugify(name) {
    return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

function makeId(parts) {
    return parts.map(slugify).join('__');
}

function emptyTree() {
    const tree = {};
    Object.keys(SHOP_CATALOG).forEach((shopType) => {
        tree[shopType] = {};
        SHOP_CATALOG[shopType].categories.forEach((name) => {
            tree[shopType][name] = { locked: true, subs: [], icon: '📁' };
        });
    });
    return tree;
}

function cleanIcon(value) {
    const icon = String(value || '').trim().slice(0, 8);
    return icon || '📁';
}

function loadTree() {
    const saved = readJson(treeFile, null);
    const tree = emptyTree();
    if (!saved || typeof saved !== 'object') {
        writeJson(treeFile, tree);
        return tree;
    }
    Object.keys(SHOP_CATALOG).forEach((shopType) => {
        const row = saved[shopType];
        if (!row || typeof row !== 'object') return;
        Object.keys(row).forEach((name) => {
            const entry = row[name] || {};
            const subs = Array.isArray(entry.subs) ? entry.subs.map(clean).filter(Boolean) : [];
            const locked = tree[shopType][name] ? true : Boolean(entry.locked);
            tree[shopType][name] = {
                locked,
                subs: [...new Set(subs)],
                icon: cleanIcon(entry.icon || (tree[shopType][name] && tree[shopType][name].icon))
            };
        });
    });
    return tree;
}

function saveTree(tree) {
    writeJson(treeFile, tree);
}

function listCategories() {
    const tree = loadTree();
    return Object.keys(SHOP_CATALOG).map((shopType) => {
        const cats = Object.keys(tree[shopType] || {}).sort((a, b) => a.localeCompare(b));
        return {
            shopType,
            icon: SHOP_TYPE_ICONS[shopType] || '🏪',
            count: cats.length,
            categories: cats.map((name) => {
                const entry = tree[shopType][name];
                return {
                    id: makeId([shopType, name]),
                    name,
                    icon: cleanIcon(entry.icon),
                    locked: Boolean(entry.locked),
                    subcategories: (entry.subs || []).map((sub) => ({
                        id: makeId([shopType, name, sub]),
                        name: sub,
                        parent: name
                    }))
                };
            })
        };
    });
}

function findTarget(tree, id) {
    const parts = String(id || '').split('__').filter(Boolean);
    if (parts.length < 2) return null;
    for (const shopType of Object.keys(tree)) {
        for (const name of Object.keys(tree[shopType])) {
            if (makeId([shopType, name]) === id) {
                return { kind: 'category', shopType, name, entry: tree[shopType][name] };
            }
            for (const sub of tree[shopType][name].subs || []) {
                if (makeId([shopType, name, sub]) === id) {
                    return { kind: 'sub', shopType, name, sub, entry: tree[shopType][name] };
                }
            }
        }
    }
    return null;
}

function addCategory(body) {
    const shopType = clean(body.shopType);
    const name = clean(body.name);
    const icon = cleanIcon(body.icon);
    if (!SHOP_CATALOG[shopType]) return { error: 'Choose a valid shop type.' };
    if (name.length < 2) return { error: 'Enter a category name.' };
    const tree = loadTree();
    if (tree[shopType][name]) return { error: 'That category already exists.' };
    tree[shopType][name] = { locked: false, subs: [], icon };
    saveTree(tree);
    return { ok: true, message: 'Category added.' };
}

function addSubcategory(body) {
    const shopType = clean(body.shopType);
    const parent = clean(body.parent);
    const name = clean(body.name);
    if (!SHOP_CATALOG[shopType]) return { error: 'Choose a valid shop type.' };
    if (!parent) return { error: 'Choose a main category.' };
    if (name.length < 2) return { error: 'Enter a subcategory name.' };
    const tree = loadTree();
    if (!tree[shopType][parent]) return { error: 'Main category not found.' };
    const subs = tree[shopType][parent].subs || [];
    if (subs.some((item) => item.toLowerCase() === name.toLowerCase())) {
        return { error: 'That subcategory already exists.' };
    }
    tree[shopType][parent].subs = subs.concat(name);
    saveTree(tree);
    return { ok: true, message: 'Subcategory added.' };
}

function updateCategory(id, body) {
    const tree = loadTree();
    const target = findTarget(tree, id);
    if (!target) return { missing: true };
    const next = clean(body.name);
    if (next.length < 2) return { error: 'Enter a valid name.' };
    if (target.kind === 'category') {
        if (target.entry.locked) return { error: 'Standard categories cannot be renamed.' };
        if (tree[target.shopType][next] && next !== target.name) {
            return { error: 'That category already exists.' };
        }
        tree[target.shopType][next] = target.entry;
        if (next !== target.name) delete tree[target.shopType][target.name];
    } else {
        const subs = target.entry.subs || [];
        if (subs.some((item) => item.toLowerCase() === next.toLowerCase() && item !== target.sub)) {
            return { error: 'That subcategory already exists.' };
        }
        target.entry.subs = subs.map((item) => (item === target.sub ? next : item));
    }
    saveTree(tree);
    return { ok: true, message: 'Updated.' };
}

function removeCategory(id) {
    const tree = loadTree();
    const target = findTarget(tree, id);
    if (!target) return { missing: true };
    if (target.kind === 'category') {
        delete tree[target.shopType][target.name];
    } else {
        target.entry.subs = (target.entry.subs || []).filter((item) => item !== target.sub);
    }
    saveTree(tree);
    return { ok: true, message: 'Deleted.' };
}

module.exports = {
    SHOP_TYPE_ICONS,
    listCategories,
    addCategory,
    addSubcategory,
    updateCategory,
    removeCategory
};
