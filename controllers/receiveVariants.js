const Product = require('../models/Product');
const { toNum } = require('../utils/profit');
const { logStock } = require('../utils/stockHistory');
const { receiveQtyToMeters } = require('../utils/units');
const { isBedsheetCategory } = require('../utils/bedsheetCatalog');
const { isBlanketCategory } = require('../utils/blanketCatalog');

function parseRecvVariants(body) {
    const list = Array.isArray(body.variants) ? body.variants : [];
    const rows = list.map((v) => {
        const color = String(v.color || '').trim();
        const thaan = toNum(v.thaan);
        const per = toNum(v.perThaan);
        const qty = toNum(v.qty) > 0 ? toNum(v.qty) : thaan * per;
        return {
            color,
            thaan,
            per,
            qty,
            weight: toNum(v.weight),
            weightUnit: /kg/i.test(String(v.weightUnit || '')) ? 'kg' : 'gm',
            size: String(v.size || '').trim(),
            ply: String(v.ply || '').trim(),
            dimensions: String(v.dimensions || '').trim()
        };
    }).filter((v) => v.color && v.qty > 0);
    if (rows.length) return rows;
    const qty = toNum(body.quantity);
    if (qty <= 0) return [];
    return [{
        color: String(body.color || 'Default').trim() || 'Default',
        thaan: toNum(body.thaanCount),
        per: toNum(body.metersPerThaan),
        qty
    }];
}

function colorSku(baseSku, color) {
    const slug = String(color).replace(/[^A-Za-z0-9]+/g, '').slice(0, 8).toUpperCase() || 'CLR';
    return `${baseSku || 'AH'}-${slug}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

async function findOrCreateColorProduct(base, color, t) {
    const existing = await Product.findOne({
        where: { title: base.title, color, ShopId: base.ShopId || 1 },
        transaction: t
    });
    if (existing) return existing;
    return Product.create({
        title: base.title,
        brand: base.brand,
        category: base.category,
        subCategory: base.subCategory,
        fabricType: base.fabricType,
        color,
        sku: colorSku(base.sku, color),
        imageUrl: base.imageUrl,
        purchasePrice: base.purchasePrice,
        wholesalePrice: base.wholesalePrice,
        retailPrice: base.retailPrice,
        minSellingRate: base.minSellingRate,
        stockUnit: base.stockUnit,
        sellUnit: base.sellUnit,
        metersPerSellUnit: base.metersPerSellUnit,
        bedsheetSize: base.bedsheetSize,
        bedsheetSetType: base.bedsheetSetType,
        bedsheetDimensions: base.bedsheetDimensions,
        pillowCoverSize: base.pillowCoverSize,
        pillowCoverCount: base.pillowCoverCount,
        bedsheetWeight: base.bedsheetWeight,
        bedsheetWeightUnit: base.bedsheetWeightUnit,
        blanketPly: base.blanketPly,
        blanketSize: base.blanketSize,
        blanketWeight: base.blanketWeight,
        blanketMaterial: base.blanketMaterial,
        stockMeters: 0,
        minWholesaleQty: base.minWholesaleQty || 1,
        supplierId: base.supplierId,
        ShopId: base.ShopId || 1
    }, { transaction: t });
}

function applyRecvBedsheetVariant(child, base, variant, unit, sellUnit) {
    if (!isBedsheetCategory(base.category) && !base.bedsheetSize) return;
    if (variant.size) child.bedsheetSize = variant.size;
    else if (base.bedsheetSize) child.bedsheetSize = base.bedsheetSize;
    if (variant.dimensions) child.bedsheetDimensions = variant.dimensions;
    else if (base.bedsheetDimensions) child.bedsheetDimensions = base.bedsheetDimensions;
    if (variant.weight > 0) {
        child.bedsheetWeight = variant.weight;
        child.bedsheetWeightUnit = variant.weightUnit || 'gm';
    }
    child.metersPerSellUnit = 1;
    child.stockUnit = unit;
    if (sellUnit) child.sellUnit = sellUnit;
}

function applyRecvBlanketVariant(child, base, variant, unit, sellUnit) {
    if (!isBlanketCategory(base.category) && !base.blanketPly) return;
    if (variant.ply) child.blanketPly = variant.ply;
    else if (base.blanketPly) child.blanketPly = base.blanketPly;
    if (variant.size) child.blanketSize = variant.size;
    else if (base.blanketSize) child.blanketSize = base.blanketSize;
    if (variant.weight > 0) child.blanketWeight = variant.weight;
    else if (base.blanketWeight) child.blanketWeight = base.blanketWeight;
    if (base.blanketMaterial) child.blanketMaterial = base.blanketMaterial;
    child.metersPerSellUnit = 1;
    child.stockUnit = unit;
    if (sellUnit) child.sellUnit = sellUnit;
}

async function receiveColorRow(opts) {
    const { base, variant, unit, sellUnit, rate, wholesale, retail, supplierId, billNo, receivedAt, ShopId, t } = opts;
    const child = await findOrCreateColorProduct(base, variant.color, t);
    applyRecvBedsheetVariant(child, base, variant, unit, sellUnit);
    applyRecvBlanketVariant(child, base, variant, unit, sellUnit);
    const meters = receiveQtyToMeters(variant.qty, unit, child);
    const next = toNum(child.stockMeters) + meters;
    child.stockUnit = unit;
    if (sellUnit) child.sellUnit = sellUnit;
    if (/gaz/i.test(String(unit)) && /gaz/i.test(String(child.sellUnit || 'Gaz'))) {
        child.metersPerSellUnit = 1;
    }
    child.stockMeters = next;
    child.purchasePrice = rate;
    if (wholesale !== undefined && wholesale !== '') child.wholesalePrice = toNum(wholesale);
    if (retail !== undefined && retail !== '') child.retailPrice = toNum(retail);
    if (opts.minRate !== undefined) child.minSellingRate = toNum(opts.minRate);
    child.supplierId = supplierId;
    await child.save({ transaction: t });
    await logStock({
        productId: child.id,
        type: 'Purchase',
        quantity: meters,
        balance: next,
        ref: billNo,
        date: receivedAt,
        ShopId: ShopId || 1
    }, t);
    return {
        product: child,
        meters,
        qty: variant.qty,
        color: variant.color,
        thaan: variant.thaan,
        per: variant.per,
        weight: variant.weight,
        weightUnit: variant.weightUnit,
        size: variant.size,
        dimensions: variant.dimensions,
        sku: child.sku
    };
}

module.exports = { parseRecvVariants, receiveColorRow };
