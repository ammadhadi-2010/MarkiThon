function isBedsheetProduct(product) {
    if (!product) return false;
    if (String(product.category || '').toLowerCase() === 'bedsheet') return true;
    return Boolean(product.bedsheetSize || product.bedsheetDimensions || product.bedsheetSetType);
}

function copyBedsheetFields(src) {
    if (!src) return {};
    return {
        category: src.category || '',
        bedsheetSize: src.bedsheetSize || '',
        bedsheetSetType: src.bedsheetSetType || '',
        bedsheetDimensions: src.bedsheetDimensions || '',
        pillowCoverSize: src.pillowCoverSize || '',
        pillowCoverCount: src.pillowCoverCount,
        bedsheetWeight: src.bedsheetWeight,
        bedsheetWeightUnit: src.bedsheetWeightUnit || ''
    };
}

function sheetShortName(size) {
    const text = String(size || '').trim();
    const cut = text.indexOf(' (');
    return cut > 0 ? text.slice(0, cut) : text;
}

function sheetCompactDim(value) {
    return String(value || '').replace(/\s*[x×]\s*/gi, 'x').replace(/\s+/g, ' ').trim();
}

function sheetPillowLabel(product) {
    const n = Number(product.pillowCoverCount);
    if ([0, 1, 2, 4].includes(n)) {
        if (n <= 0) return 'Sheet Only';
        return n === 1 ? '1 Pillow' : `${n} Pillows`;
    }
    const set = String(product.bedsheetSetType || '');
    if (/4/.test(set)) return '4 Pillows';
    if (/2/.test(set)) return '2 Pillows';
    if (/1 Pillow/i.test(set)) return '1 Pillow';
    return set ? set : 'Sheet Only';
}

function sheetWeightLabel(product) {
    const n = Number(product.bedsheetWeight);
    if (!(n > 0)) return '';
    return `${n}${/kg/i.test(String(product.bedsheetWeightUnit || 'gm')) ? 'kg' : 'gm'}`;
}

function bedsheetSpecLabel(product) {
    if (!isBedsheetProduct(product)) return '';
    const short = sheetShortName(product.bedsheetSize);
    const dim = sheetCompactDim(product.bedsheetDimensions);
    const head = [short, dim].filter(Boolean).join(' - ');
    return [head, sheetPillowLabel(product), sheetWeightLabel(product)].filter(Boolean).join(' | ');
}

function posSearchBlob(product) {
    return [
        product.title, product.sku, product.barcode, product.brand, product.color,
        product.category, product.fabricType, product.bedsheetSize, product.bedsheetSetType,
        product.bedsheetDimensions, product.pillowCoverSize, product.pillowCoverCount,
        product.bedsheetWeight, product.bedsheetWeightUnit, bedsheetSpecLabel(product),
        product.blanketPly, product.blanketSize, product.blanketWeight, product.blanketMaterial,
        typeof blanketSpecLabel === 'function' ? blanketSpecLabel(product) : ''
    ];
}

function posHitStock(product) {
    const qty = Number(product.stockMeters || 0);
    if (typeof isMobileProduct === 'function' && isMobileProduct(product)) {
        const unit = typeof posHardwareUnit === 'function' ? posHardwareUnit(product) : 'Pcs';
        return `${qty} ${unit}`;
    }
    if (typeof isBlanketProduct === 'function' && isBlanketProduct(product)) {
        return `${qty} ${product.stockUnit || 'Piece'}`;
    }
    if (isBedsheetProduct(product)) return `${qty} ${product.stockUnit || 'Pieces'}`;
    return `${qty}m`;
}

function posIsBlankColor(product) {
    const color = String(product && product.color || '').trim().toLowerCase();
    return !color || color === 'no color' || color === 'default' || color === '-';
}

function posSameFamily(left, right) {
    if (String(left.title || '').trim().toLowerCase() !== String(right.title || '').trim().toLowerCase()) {
        return false;
    }
    const brand = String(left.brand || '').trim().toLowerCase();
    const other = String(right.brand || '').trim().toLowerCase();
    return !brand || !other || brand === other;
}

/** In-stock rows for POS/wholesale search; drops 0-stock and blank parents when variants exist. */
function posSellableRows(rows) {
    const list = (typeof shopInventory === 'function' ? shopInventory(rows) : (rows || []))
        .filter((row) => Number(row && row.stockMeters) > 0);
    const seenId = new Set();
    const seenSku = new Set();
    const out = [];
    list.forEach((row) => {
        const id = String(row.id || '');
        if (!id || seenId.has(id)) return;
        if (posIsBlankColor(row)) {
            const hasVariant = list.some((item) =>
                String(item.id) !== id && posSameFamily(row, item) && !posIsBlankColor(item));
            if (hasVariant) return;
        }
        const sku = String(row.sku || '').trim().toLowerCase();
        if (sku && seenSku.has(sku)) return;
        seenId.add(id);
        if (sku) seenSku.add(sku);
        out.push(row);
    });
    return out;
}

function posHitButtonHtml(product, attr) {
    const spec = (typeof posItemSpecLabel === 'function' ? posItemSpecLabel(product) : '')
        || bedsheetSpecLabel(product);
    const brand = product.brand ? escapeHtml(product.brand) : 'No brand';
    const extra = spec
        ? escapeHtml(spec)
        : (product.color ? escapeHtml(product.color) : 'No color');
    return `<button type="button" ${attr}="${product.id}">${escapeHtml(product.title)} · ${brand} · ${extra} · ${escapeHtml(product.sku || 'No SKU')} · ${escapeHtml(posHitStock(product))}</button>`;
}

function posSpecBadgeHtml(line) {
    const spec = typeof posItemSpecLabel === 'function' ? posItemSpecLabel(line) : bedsheetSpecLabel(line);
    if (!spec) return '';
    return `<span class="sku-badge">${escapeHtml(spec)}</span>`;
}

function posInvoiceLine(line) {
    return {
        title: line.title,
        quantityMeters: line.qty,
        quantitySold: line.qty,
        sellUnit: line.sellUnit,
        rate: line.rate,
        total: line.qty * line.rate,
        ...copyBedsheetFields(line),
        ...(typeof copyBlanketFields === 'function' ? copyBlanketFields(line) : {})
    };
}
