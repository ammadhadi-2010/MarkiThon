function loadQrImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not load QR image.'));
        img.src = src;
    });
}

function drawRoundedRect(ctx, x, y, w, h, radius) {
    const r = Math.min(radius, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawCircle(ctx, cx, cy, radius) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
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

function drawQrModeBadge(ctx, kind, canvasW) {
    const wholesale = kind === 'wholesale';
    const letter = wholesale ? 'H' : 'R';
    const bg = wholesale ? '#059669' : '#ea580c';
    const w = 36;
    const h = 28;
    const x = canvasW - 16 - 12 - w;
    const y = 28;
    drawRoundedRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 15px Inter, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, x + w / 2, y + h / 2 + 0.5);
}

function drawCenterLogo(ctx, logo, areaX, areaY, areaSize) {
    const box = Math.round(areaSize * 0.18);
    const rim = Math.max(8, Math.round(box * 0.22));
    const cx = areaX + areaSize / 2;
    const cy = areaY + areaSize / 2;
    const outer = box / 2 + rim;
    drawCircle(ctx, cx, cy, outer);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.save();
    drawCircle(ctx, cx, cy, box / 2);
    ctx.clip();
    ctx.drawImage(logo, cx - box / 2, cy - box / 2, box, box);
    ctx.restore();
}

async function paintBrandedQr(size, mode) {
    const canvas = obQrCanvas(mode);
    if (!canvas || typeof storeQrSrc !== 'function') return;
    const dim = size || 280;
    const kind = String(mode || '').toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';
    const quiet = Math.max(16, Math.round(dim * 0.08));
    const qrDim = dim - quiet * 2;
    canvas.width = dim;
    canvas.height = dim;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dim, dim);
    const qr = await loadQrImage(storeQrSrc(qrDim, kind === 'wholesale' ? 'wholesale' : ''));
    ctx.drawImage(qr, quiet, quiet, qrDim, qrDim);
    const logoUrl = document.getElementById('obLogoUrl') && document.getElementById('obLogoUrl').value;
    if (!logoUrl) return;
    const logo = await loadQrImage(logoUrl);
    drawCenterLogo(ctx, logo, quiet, quiet, qrDim);
}

async function buildBrandedQrCard(mode) {
    const kind = String(mode || '').toLowerCase() === 'wholesale' ? 'wholesale' : 'retail';
    const shop = typeof obShopDisplayName === 'function' ? obShopDisplayName() : 'Ammad Hadi Stor';
    const qrSize = 640;
    const quiet = 36;
    const pad = 40;
    const headerH = 78;
    const framePad = 16;
    const canvas = document.createElement('canvas');
    canvas.width = qrSize + quiet * 2 + pad * 2;
    canvas.height = qrSize + quiet * 2 + pad * 2 + headerH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#161f36';
    drawRoundedRect(ctx, framePad, framePad, canvas.width - framePad * 2, canvas.height - framePad * 2, 24);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.font = '800 34px Inter, Segoe UI, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const maxW = canvas.width - pad * 2 - 56;
    let title = shop;
    while (ctx.measureText(title).width > maxW && title.length > 4) title = title.slice(0, -2) + '…';
    ctx.fillText(title, canvas.width / 2, framePad + headerH / 2);
    drawQrModeBadge(ctx, kind, canvas.width);
    const qx = pad;
    const qy = framePad + headerH + 8;
    const whiteSize = qrSize + quiet * 2;
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, qx - 4, qy - 4, whiteSize + 8, whiteSize + 8, 18);
    ctx.fill();
    const qr = await loadQrImage(storeQrSrc(qrSize, kind === 'wholesale' ? 'wholesale' : ''));
    ctx.drawImage(qr, qx + quiet, qy + quiet, qrSize, qrSize);
    const logoUrl = document.getElementById('obLogoUrl') && document.getElementById('obLogoUrl').value;
    if (logoUrl) {
        const logo = await loadQrImage(logoUrl);
        drawCenterLogo(ctx, logo, qx + quiet, qy + quiet, qrSize);
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
