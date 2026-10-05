function recvLabelSheetHtml(info) {
    const sets = info.variants && info.variants.length ? info.variants : [info];
    const price = Number(info.price || 0).toLocaleString();
    let cards = '';
    sets.forEach((set) => {
        const count = Math.min(Math.max(Number(set.thaan) || 1, 1), 40);
        const sku = set.sku || info.sku || 'No SKU';
        const color = set.color || 'No color';
        const payload = encodeURIComponent(`${sku}|${color}|Rs.${price}|${info.billNo || ''}`);
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${payload}`;
        for (let i = 1; i <= count; i += 1) {
            cards += `<article class="qr-sticker">
                <img src="${qr}" alt="QR">
                <strong>${escapeHtml(info.title)}</strong>
                <span>SKU: ${escapeHtml(sku)}</span>
                <span>Color: ${escapeHtml(color)}</span>
                <span>Selling: Rs. ${price}</span>
                <span>Batch ${escapeHtml(info.billNo || '')} · ${i}/${count}</span>
            </article>`;
        }
    });
    return cards;
}

function printRecvLabels() {
    if (!lastRecvLabels) return showToast('Save a stock receipt before printing labels.');
    const cards = recvLabelSheetHtml(lastRecvLabels);
    if (typeof printHtmlFrame === 'function') {
        printHtmlFrame(
            `<div class="printable-area"><p><strong>Ammad Hadi Stor</strong> · Color batch labels</p>
            <div class="qr-sheet">${cards}</div></div>`,
            { mode: 'a4', title: 'Batch QR Stickers' }
        );
        return;
    }
    showToast('Print helper is not ready.');
}
