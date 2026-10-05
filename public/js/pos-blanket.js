function isBlanketProduct(product) {
    if (!product) return false;
    const cat = String(product.category || '').toLowerCase();
    if (cat.includes('blanket') || cat.includes('kambal')) return true;
    return Boolean(product.blanketPly || product.blanketSize || product.blanketWeight);
}

function copyBlanketFields(src) {
    if (!src) return {};
    return {
        category: src.category || '',
        blanketPly: src.blanketPly || '',
        blanketSize: src.blanketSize || '',
        blanketWeight: src.blanketWeight,
        blanketMaterial: src.blanketMaterial || src.fabricType || '',
        fabricType: src.fabricType || src.blanketMaterial || ''
    };
}

function blanketSpecLabel(product) {
    if (!isBlanketProduct(product)) return '';
    const ply = product.blanketPly || 'Double Ply';
    const size = product.blanketSize || 'King Size';
    const n = Number(product.blanketWeight);
    const kg = n > 0 ? `${n} kg` : '';
    const mat = String(product.blanketMaterial || product.fabricType || '');
    const short = /mink/i.test(mat) ? 'Mink' : mat;
    return [`${ply} - ${size}`, kg, short].filter(Boolean).join(' | ');
}

function posItemSpecLabel(product) {
    if (typeof blanketSpecLabel === 'function') {
        const blanket = blanketSpecLabel(product);
        if (blanket) return blanket;
    }
    if (typeof bedsheetSpecLabel === 'function') return bedsheetSpecLabel(product);
    return '';
}
