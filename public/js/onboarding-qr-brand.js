function loadQrImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not load QR image.'));
        img.src = src;
    });
}

function drawRoundedRect(ctx, x, y, size, radius) {
    const r = Math.min(radius, size / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + size, y, x + size, y + size, r);
    ctx.arcTo(x + size, y + size, x, y + size, r);
    ctx.arcTo(x, y + size, x, y, r);
    ctx.arcTo(x, y, x + size, y, r);
    ctx.closePath();
}

function obQrCanvas(mode) {
    const key = String(mode || 'retail').toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';
    return document.querySelector('[data-qr-canvas="' + key + '"]')
        || document.getElementById('obBrandQr');
}

async function paintBrandedQr(size, mode) {
    const canvas = obQrCanvas(mode);
    if (!canvas || typeof storeQrSrc !== 'function') return;
    const dim = size || 280;
    const kind = String(mode || '').toLowerCase() === 'wholesale' ? 'wholesale' : '';
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dim, dim);
    const qr = await loadQrImage(storeQrSrc(dim, kind));
    ctx.drawImage(qr, 0, 0, dim, dim);
    const logoUrl = document.getElementById('obLogoUrl') && document.getElementById('obLogoUrl').value;
    if (!logoUrl) return;
    const logo = await loadQrImage(logoUrl);
    const box = Math.round(dim * 0.22);
    const pad = Math.round(dim * 0.03);
    const x = Math.round((dim - box) / 2);
    const y = x;
    drawRoundedRect(ctx, x - pad, y - pad, box + pad * 2, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.save();
    drawRoundedRect(ctx, x, y, box, 10);
    ctx.clip();
    ctx.drawImage(logo, x, y, box, box);
    ctx.restore();
}

async function downloadBrandedQr(mode) {
    if (typeof storeAssetsUnlocked === 'function' && !storeAssetsUnlocked()) {
        throw new Error('Waiting for admin approval.');
    }
    const kind = String(mode || '').toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';
    await paintBrandedQr(720, kind);
    const canvas = obQrCanvas(kind);
    if (!canvas) throw new Error('QR canvas is not ready.');
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Could not export QR code.');
    const tag = kind === 'wholesale' ? 'Wholesale' : 'Retail';
    downloadBlobFile(blob, 'Ammad-Hadi-Stor-' + tag + '-QR.png');
    await paintBrandedQr(280, kind);
    showToast(tag + ' QR code downloaded.');
}
