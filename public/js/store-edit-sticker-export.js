function osStickerObjectJson() {
    if (!osStickerCanvas) return '[]';
    const list = osStickerCanvas.getObjects().filter((obj) => obj.sticker);
    return JSON.stringify(list.map((obj) => obj.toJSON(['sticker'])));
}

function osStickerHasBadges() {
    return Boolean(osStickerCanvas && osStickerCanvas.getObjects().some((obj) => obj.sticker));
}

function osCompressDataUrl(dataUrl, max) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.84));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

async function osEditStickerPayload() {
    const canvas = typeof osStickerEnsure === 'function' ? osStickerEnsure() : null;
    if (!canvas) return { storeStickerImage: '', storeStickerJson: '[]' };
    canvas.discardActiveObject();
    canvas.renderAll();
    if (!osStickerHasBadges()) {
        return { storeStickerImage: '', storeStickerJson: '[]' };
    }
    let dataUrl = '';
    try {
        dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.9, multiplier: 2 });
        dataUrl = await osCompressDataUrl(dataUrl, 900);
    } catch (error) {
        showToast('Could not export sticker image. Try a local product photo.');
        throw error;
    }
    return {
        storeStickerImage: dataUrl,
        storeStickerJson: osStickerObjectJson()
    };
}
