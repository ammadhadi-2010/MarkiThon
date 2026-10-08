function liveStoreUrl(mode) {
    const field = document.getElementById('obShopName');
    const slug = typeof shopSlugFromName === 'function'
        ? shopSlugFromName(field && field.value)
        : 'ammadhadistor';
    const base = 'https://markithon.com/' + slug;
    const kind = String(mode || '').toLowerCase();
    if (kind === 'wholesale') return base + '?mode=wholesale';
    return base;
}

function storeQrSrc(size, mode) {
    const data = encodeURIComponent(liveStoreUrl(mode));
    return '/api/settings/store-qr?size=' + (size || 220) + '&data=' + data;
}

function paintObStoreQr() {
    const img = document.getElementById('obStoreQr');
    if (img) img.src = storeQrSrc(220);
    if (typeof paintBrandedQr === 'function') paintBrandedQr(280).catch(() => {});
}

function downloadBlobFile(blob, filename) {
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1500);
}

async function downloadStoreQr(mode) {
    if (typeof storeAssetsUnlocked === 'function' && !storeAssetsUnlocked()) {
        throw new Error('Waiting for admin approval.');
    }
    if (typeof downloadBrandedQr === 'function') {
        await downloadBrandedQr(mode);
        return;
    }
    const kind = String(mode || '').toLowerCase() === 'wholesale' ? 'wholesale' : '';
    const res = await fetch(storeQrSrc(512, kind));
    if (!res.ok) throw new Error('Could not download QR code.');
    const blob = await res.blob();
    const tag = kind === 'wholesale' ? 'Wholesale' : 'Retail';
    downloadBlobFile(blob, 'Ammad-Hadi-Stor-' + tag + '-QR.png');
    showToast(tag + ' QR code downloaded.');
}

function storeShareText() {
    const name = (document.getElementById('obShopName') && document.getElementById('obShopName').value)
        || 'Ammad Hadi Stor';
    const url = liveStoreUrl();
    return 'Shop ' + name + ' online. Browse products and place orders here:\n' + url;
}

async function shareStoreLink() {
    if (typeof storeAssetsUnlocked === 'function' && !storeAssetsUnlocked()) {
        showToast('Waiting for admin approval.');
        return;
    }
    const url = liveStoreUrl();
    const text = storeShareText();
    if (navigator.share) {
        try {
            await navigator.share({ title: 'Ammad Hadi Stor', text, url });
            return;
        } catch (error) {
            if (error && error.name === 'AbortError') return;
        }
    }
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

function vcfEscape(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n')
        .replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function shopVcardPayload() {
    const shop = vcfEscape(document.getElementById('obShopName')?.value || 'Ammad Hadi Stor');
    const owner = vcfEscape(document.getElementById('obOwnerName')?.value || 'Ammad Hadi');
    const phone = String(document.getElementById('obOrderWhatsapp')?.value
        || document.getElementById('obPhoneNumber')?.value || '').replace(/\D/g, '');
    const address = vcfEscape(document.getElementById('obShopAddress')?.value || '');
    const url = liveStoreUrl();
    const parts = owner.split(' ');
    const last = parts.length > 1 ? parts.slice(-1)[0] : '';
    const first = parts.length > 1 ? parts.slice(0, -1).join(' ') : owner;
    return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        'FN:' + shop,
        'N:' + last + ';' + first + ';;;',
        'ORG:' + shop,
        phone ? 'TEL;TYPE=CELL,VOICE:' + phone : '',
        address ? 'ADR;TYPE=WORK:;;' + address + ';;;;' : '',
        'URL:' + url,
        'END:VCARD'
    ].filter(Boolean).join('\r\n');
}

function downloadShopVcard() {
    if (typeof storeAssetsUnlocked === 'function' && !storeAssetsUnlocked()) {
        showToast('Waiting for admin approval.');
        return;
    }
    const blob = new Blob([shopVcardPayload()], { type: 'text/vcard;charset=utf-8' });
    downloadBlobFile(blob, 'Ammad-Hadi-Stor.vcf');
    showToast('Digital business card downloaded.');
}

function bindObStoreShare() {
    const root = document.getElementById('obForm7') || document;
    if (!root.dataset.qrShareBound) {
        root.dataset.qrShareBound = '1';
        root.addEventListener('click', (event) => {
            const btn = event.target.closest('[data-qr-download]');
            if (!btn) return;
            downloadStoreQr(btn.getAttribute('data-qr-download'))
                .catch((err) => showToast(err.message));
        });
    }
    const share = document.getElementById('obShareStore');
    const vcf = document.getElementById('obDownloadVcf');
    if (share && !share.dataset.bound) {
        share.dataset.bound = '1';
        share.addEventListener('click', () => {
            shareStoreLink().catch(() => showToast('Could not share store link.'));
        });
    }
    if (vcf && !vcf.dataset.bound) {
        vcf.dataset.bound = '1';
        vcf.addEventListener('click', downloadShopVcard);
    }
}
