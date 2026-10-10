const fs = require('fs');
const path = require('path');
const { SHOP_CATALOG, resolveShopType } = require('./shopTypeCatalog');
const { SHOP_TYPE_ICONS } = require('./adminCategoryIcons');

const treeFile = path.join(__dirname, '../data/admin-category-tree.json');

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

function cleanIcon(value) {
    const icon = String(value || '').trim().slice(0, 8);
    return icon || '📁';
}

function packEntry(entry, fallbackLocked) {
    const row = entry || {};
    const subs = Array.isArray(row.subs) ? row.subs.map(clean).filter(Boolean) : [];
    const customized = Boolean(row.isCustomized);
    return {
        locked: customized ? false : (row.locked !== undefined ? Boolean(row.locked) : Boolean(fallbackLocked)),
        isCustomized: customized,
        subs: [...new Set(subs)],
        icon: cleanIcon(row.icon)
    };
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

function isTreeEmpty(saved) {
    if (!saved || typeof saved !== 'object') return true;
    return !Object.keys(saved).some((shopType) => {
        const row = saved[shopType];
        return row && typeof row === 'object' && Object.keys(row).length > 0;
    });
}

/** Load saved tree only. Seed defaults once when the file is completely empty. */
function loadTree() {
    const saved = readJson(treeFile, null);
    if (isTreeEmpty(saved)) {
        const seeded = emptyTree();
        writeJson(treeFile, seeded);
        return seeded;
    }
    const tree = {};
    Object.keys(saved).forEach((shopType) => {
        const row = saved[shopType];
        if (!row || typeof row !== 'object') return;
        tree[shopType] = {};
        Object.keys(row).forEach((name) => {
            const standard = SHOP_CATALOG[shopType]
                && SHOP_CATALOG[shopType].categories.includes(name);
            tree[shopType][name] = packEntry(row[name], Boolean(standard));
        });
    });
    Object.keys(SHOP_CATALOG).forEach((shopType) => {
        if (!tree[shopType]) tree[shopType] = {};
    });
    return tree;
}

function saveTree(tree) {
    writeJson(treeFile, tree);
}

function listCategories() {
    const tree = loadTree();
    const types = Object.keys(SHOP_CATALOG).concat(
        Object.keys(tree).filter((key) => !SHOP_CATALOG[key])
    );
    return [...new Set(types)].map((shopType) => {
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
                    isCustomized: Boolean(entry.isCustomized),
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
    const key = String(id || '');
    if (!key) return null;
    for (const shopType of Object.keys(tree)) {
        for (const name of Object.keys(tree[shopType] || {})) {
            if (makeId([shopType, name]) === key) {
                return { kind: 'category', shopType, name, entry: tree[shopType][name] };
            }
            for (const sub of tree[shopType][name].subs || []) {
                if (makeId([shopType, name, sub]) === key) {
                    return { kind: 'sub', shopType, name, sub, entry: tree[shopType][name] };
                }
            }
        }
    }
    return null;
}

function addCategory(body) {
    const shopType = clean(body.shopType);
    const name = clean(body.name || body.categoryName);
    const icon = cleanIcon(body.icon);
    const raw = Array.isArray(body.subCategories) ? body.subCategories
        : (Array.isArray(body.subs) ? body.subs : []);
    const subs = [...new Set(raw.map(clean).filter((v) => v.length >= 2))];
    if (!SHOP_CATALOG[shopType] && !loadTree()[shopType]) {
        return { error: 'Choose a valid shop type.' };
    }
    if (name.length < 2) return { error: 'Enter a category name.' };
    const tree = loadTree();
    if (!tree[shopType]) tree[shopType] = {};
    if (tree[shopType][name]) return { error: 'That category already exists.' };
    tree[shopType][name] = { locked: false, isCustomized: true, subs, icon };
    saveTree(tree);
    return {
        ok: true,
        message: subs.length ? 'Category and subcategories added.' : 'Category added.',
        shopType
    };
}

function addSubcategory(body) {
    const name = clean(body.name || body.subcategoryName);
    if (name.length < 2) return { error: 'Enter a subcategory name.' };
    const tree = loadTree();
    let shopType = clean(body.shopType);
    let parent = clean(body.parent || body.categoryName);
    const categoryId = clean(body.categoryId || body.parentId);
    if (categoryId) {
        const target = findTarget(tree, categoryId);
        if (target && target.kind === 'category') {
            shopType = target.shopType;
            parent = target.name;
        }
    }
    if (!tree[shopType]) return { error: 'Choose a valid shop type.' };
    if (!parent) return { error: 'Choose a main category.' };
    if (!tree[shopType][parent]) return { error: 'Main category not found.' };
    const subs = tree[shopType][parent].subs || [];
    if (subs.some((item) => item.toLowerCase() === name.toLowerCase())) {
        return { error: 'That subcategory already exists.' };
    }
    tree[shopType][parent].subs = subs.concat(name);
    tree[shopType][parent].isCustomized = true;
    saveTree(tree);
    return { ok: true, message: 'Subcategory added.', shopType };
}

function updateCategory(id, body) {
    const tree = loadTree();
    const target = findTarget(tree, id);
    if (!target) return { missing: true };
    const next = clean(body.name);
    if (next.length < 2) return { error: 'Enter a valid name.' };
    if (target.kind === 'category') {
        if (tree[target.shopType][next] && next !== target.name) {
            return { error: 'That category already exists.' };
        }
        const entry = packEntry(target.entry, false);
        entry.isCustomized = true;
        entry.locked = false;
        if (body.icon !== undefined) entry.icon = cleanIcon(body.icon);
        tree[target.shopType][next] = entry;
        if (next !== target.name) delete tree[target.shopType][target.name];
    } else {
        const subs = target.entry.subs || [];
        if (subs.some((item) => item.toLowerCase() === next.toLowerCase() && item !== target.sub)) {
            return { error: 'That subcategory already exists.' };
        }
        target.entry.subs = subs.map((item) => (item === target.sub ? next : item));
        target.entry.isCustomized = true;
        target.entry.locked = false;
    }
    saveTree(tree);
    return { ok: true, message: 'Category name updated.', shopType: target.shopType };
}

function removeCategory(id) {
    const tree = loadTree();
    const target = findTarget(tree, id);
    if (!target) return { missing: true };
    if (target.kind === 'category') {
        delete tree[target.shopType][target.name];
    } else {
        target.entry.subs = (target.entry.subs || []).filter((item) => item !== target.sub);
        target.entry.isCustomized = true;
    }
    saveTree(tree);
    const kind = target.kind === 'sub' ? 'Subcategory' : 'Category';
    return { ok: true, message: kind + ' deleted.', shopType: target.shopType };
}

function mainNamesForType(shopType) {
    const key = resolveShopType(shopType);
    const group = listCategories().find((row) => row.shopType === key);
    if (group && group.categories.length) return group.categories.map((row) => row.name);
    return (SHOP_CATALOG[key] || SHOP_CATALOG['General / Multi-Category']).categories.slice();
}
module.exports = {
    SHOP_TYPE_ICONS, listCategories, mainNamesForType,
    addCategory, addSubcategory, updateCategory, removeCategory
};
