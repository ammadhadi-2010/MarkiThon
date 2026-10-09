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

function obShopFileTag() {
    const name = typeof obShopDisplayName === 'function' ? obShopDisplayName() : 'Ammad-Hadi-Stor';
    return String(name).replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'MarkiThon-Shop';
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

async function buildBrandedQrCard(mode) {
    const kind = String(mode || '').toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';
    const shop = typeof obShopDisplayName === 'function' ? obShopDisplayName() : 'Ammad Hadi Stor';
    const label = kind === 'wholesale' ? 'Wholesale Store QR Code' : 'Retail Store QR Code';
    const qrSize = 640;
    const pad = 36;
    const headerH = 110;
    const canvas = document.createElement('canvas');
    canvas.width = qrSize + pad * 2;
    canvas.height = qrSize + pad * 2 + headerH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#161f36';
    drawRoundedRect(ctx, 16, 16, canvas.width - 32, canvas.height - 32, 24);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 34px Inter, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxW = canvas.width - pad * 2;
    let title = shop;
    while (ctx.measureText(title).width > maxW && title.length > 4) title = title.slice(0, -2) + '…';
    ctx.fillText(title, canvas.width / 2, 48);
    ctx.fillStyle = '#93c5fd';
    ctx.font = '700 16px Inter, Segoe UI, sans-serif';
    ctx.fillText(label, canvas.width / 2, 84);
    const qr = await loadQrImage(storeQrSrc(qrSize, kind === 'wholesale' ? 'wholesale' : ''));
    const qx = pad;
    const qy = headerH + pad - 10;
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, qx - 8, qy - 8, qrSize + 16, qrSize + 16, 18);
    ctx.fill();
    ctx.drawImage(qr, qx, qy, qrSize, qrSize);
    const logoUrl = document.getElementById('obLogoUrl') && document.getElementById('obLogoUrl').value;
    if (logoUrl) {
        const logo = await loadQrImage(logoUrl);
        const box = Math.round(qrSize * 0.2);
        const x = qx + Math.round((qrSize - box) / 2);
        const y = qy + Math.round((qrSize - box) / 2);
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(ctx, x - 8, y - 8, box + 16, box + 16, 12);
        ctx.fill();
        ctx.save();
        drawRoundedRect(ctx, x, y, box, 10);
        ctx.clip();
        ctx.drawImage(logo, x, y, box, box);
        ctx.restore();
    }
    return canvas;
}

async function downloadBrandedQr(mode) {
    if (typeof storeAssetsUnlocked === 'function' && !storeAssetsUnlocked()) {
        throw new Error('Waiting for admin approval.');
    }
    const kind = String(mode || '').toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';
    const card = await buildBrandedQrCard(kind);
    const blob = await new Promise((resolve) => card.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Could not export QR code.');
    const tag = kind === 'wholesale' ? 'Wholesale' : 'Retail';
    downloadBlobFile(blob, obShopFileTag() + '-' + tag + '-QR.png');
    await paintBrandedQr(280, kind);
    showToast(tag + ' QR code downloaded.');
}
