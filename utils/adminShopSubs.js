const CatalogTerm = require('../models/CatalogTerm');
const { listCategories } = require('./adminCategories');
const { resolveShopType } = require('./shopTypeCatalog');

function same(a, b) {
    return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

async function enrichShopTypes() {
    const shopTypes = listCategories();
    const terms = await CatalogTerm.findAll({
        where: { kind: 'subcategory' },
        order: [['name', 'ASC']]
    });
    shopTypes.forEach((group) => {
        const typeKey = resolveShopType(group.shopType);
        group.categories.forEach((cat) => {
            cat.shopSubs = terms
                .filter((row) => same(resolveShopType(row.shopType), typeKey)
                    && same(row.parentName, cat.name))
                .map((row) => ({
                    id: 'shopsub-' + row.id,
                    termId: row.id,
                    name: row.name,
                    shopId: row.shopId,
                    shopName: row.ownerName || ('Shop ' + row.shopId),
                    status: row.status || 'active',
                    source: 'shop'
                }));
        });
    });
    return shopTypes;
}

async function removeShopSub(termId) {
    const id = Number(String(termId || '').replace(/^shopsub-/, ''));
    if (!id) return { missing: true };
    const row = await CatalogTerm.findByPk(id);
    if (!row || row.kind !== 'subcategory') return { missing: true };
    const shopType = row.shopType;
    await row.destroy();
    return { ok: true, message: 'Shop subcategory deleted.', shopType };
}

async function updateShopSub(termId, body) {
    const id = Number(String(termId || '').replace(/^shopsub-/, ''));
    if (!id) return { missing: true };
    const row = await CatalogTerm.findByPk(id);
    if (!row || row.kind !== 'subcategory') return { missing: true };
    const name = String(body.name || '').trim().slice(0, 80);
    if (name.length < 2) return { error: 'Enter a valid name.' };
    const status = body.status === 'pending' ? 'pending' : 'active';
    await row.update({ name, status });
    return { ok: true, message: 'Shop subcategory updated.', shopType: row.shopType };
}

module.exports = { enrichShopTypes, removeShopSub, updateShopSub };
