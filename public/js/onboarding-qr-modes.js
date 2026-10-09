function obBusinessMode() {
    const raw = String(typeof obBusinessType !== 'undefined' ? obBusinessType : 'Both').trim();
    if (raw === 'Retail' || raw === 'Wholesale' || raw === 'Both') return raw;
    return 'Both';
}

function obQrModeList() {
    const kind = obBusinessMode();
    if (kind === 'Retail') {
        return [{ mode: 'retail', label: 'Retail Store QR Code', file: 'Retail', query: '' }];
    }
    if (kind === 'Wholesale') {
        return [{ mode: 'wholesale', label: 'Wholesale Store QR Code', file: 'Wholesale', query: 'wholesale' }];
    }
    return [
        { mode: 'retail', label: 'Retail Store QR Code', file: 'Retail', query: '' },
        { mode: 'wholesale', label: 'Wholesale Store QR Code', file: 'Wholesale', query: 'wholesale' }
    ];
}

function obEscQr(value) {
    return String(value || '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function paintObQrCards() {
    const slot = document.getElementById('obQrCards');
    if (!slot) return;
    const unlocked = typeof storeAssetsUnlocked === 'function' ? storeAssetsUnlocked() : false;
    const shopName = typeof obShopDisplayName === 'function'
        ? obShopDisplayName()
        : 'Ammad Hadi Stor';
    const title = document.getElementById('obQrShopTitle');
    if (title) title.textContent = shopName;
    slot.className = 'ob-qr-cards' + (obQrModeList().length > 1 ? ' dual' : '');
    slot.innerHTML = obQrModeList().map((row) => `
        <div class="ob-qr-card${unlocked ? '' : ' ob-qr-lock'}" data-qrmode="${row.mode}">
            <span class="ob-qr-badge ${row.mode === 'wholesale' ? 'is-h' : 'is-r'}" aria-hidden="true">
                ${row.mode === 'wholesale' ? 'H' : 'R'}
            </span>
            <p class="ob-qr-shop">${obEscQr(shopName)}</p>
            <div class="ob-qr-wrap">
                <canvas class="ob-store-qr" data-qr-canvas="${row.mode}" width="280" height="280"
                    aria-label="${row.label}"></canvas>
                <div class="ob-qr-lock-note"${unlocked ? ' hidden' : ''}>Locked until admin approval</div>
            </div>
            <button type="button" class="primary" data-qr-download="${row.mode}" ${unlocked ? '' : 'disabled'}>
                Download ${row.file} QR
            </button>
        </div>`).join('');
    obQrModeList().forEach((row) => {
        if (typeof paintBrandedQr === 'function') {
            paintBrandedQr(280, row.query || row.mode).catch(() => {});
        }
    });
}
