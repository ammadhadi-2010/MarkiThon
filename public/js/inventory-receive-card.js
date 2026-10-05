function paintRecvCard(product) {
    const card = document.getElementById('recvPickCard');
    if (!card || !product) {
        if (card) card.hidden = true;
        return;
    }
    card.hidden = false;
    const img = document.getElementById('recvThumb');
    img.src = product.imageUrl || '';
    img.style.opacity = product.imageUrl ? '1' : '0.25';
    document.getElementById('recvPickTitle').textContent = product.title || 'Product';
    const spec = (typeof posItemSpecLabel === 'function' ? posItemSpecLabel(product) : '')
        || (typeof bedsheetSpecLabel === 'function' ? bedsheetSpecLabel(product) : '');
    const hardware = typeof isMobileProduct === 'function' && isMobileProduct(product);
    document.getElementById('recvPickFabric').textContent = hardware
        ? [product.compatibility, product.warrantyType, product.brand].filter(Boolean).join(' · ')
        : (spec
            || [product.fabricType, product.brand].filter(Boolean).join(' · ')
            || 'No fabric details');
    const pack = (productsCache || []).filter((p) =>
        String(p.title || '').trim().toLowerCase() === String(product.title || '').trim().toLowerCase()
    );
    const colors = pack.map((p) => p.color).filter(Boolean);
    const tag = document.getElementById('recvColorTag');
    tag.textContent = colors.length
        ? `On-file colors: ${colors.join(', ')}`
        : 'Add colors in the batch table below';
    tag.hidden = false;
}

function paintRecvRule() {
    const meta = document.getElementById('recvMeta');
    if (!meta) return;
    if (typeof isRecvBedsheet === 'function' && isRecvBedsheet()) {
        meta.hidden = true;
        meta.textContent = '';
        return;
    }
    if (typeof isRecvBlanket === 'function' && isRecvBlanket()) {
        meta.hidden = true;
        meta.textContent = '';
        return;
    }
    if (typeof isRecvMobile === 'function' && isRecvMobile()) {
        meta.hidden = true;
        meta.textContent = '';
        return;
    }
    const buy = document.getElementById('recvBuyUnit')?.value || 'Meter';
    const sell = document.getElementById('recvSellUnit')?.value || (recvProduct && recvProduct.sellUnit) || 'Gaz';
    meta.hidden = false;
    if (/gaz/i.test(buy) && /gaz/i.test(sell)) {
        meta.textContent = 'Conversion rule: 1 Gaz = 1 Gaz (no meter conversion)';
        return;
    }
    const factor = typeof metersPerSellUnit === 'function'
        ? metersPerSellUnit(recvProduct || { sellUnit: sell })
        : 0.9144;
    meta.textContent = `Conversion rule: 1 ${sell} = ${factor} Meter`;
}
