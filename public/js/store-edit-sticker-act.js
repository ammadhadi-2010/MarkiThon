function osStickerHandleStyle(obj) {
    obj.set({
        sticker: true,
        cornerColor: '#60a5fa',
        cornerStrokeColor: '#1e3a8a',
        borderColor: '#93c5fd',
        transparentCorners: false,
        cornerSize: 11,
        rotatingPointOffset: 26,
        lockScalingFlip: true
    });
    return obj;
}

function addOsEditSticker(kind) {
    const canvas = typeof osStickerEnsure === 'function' ? osStickerEnsure() : null;
    if (!canvas || typeof osMakeSticker !== 'function') {
        showToast('Sticker editor is not ready.');
        return;
    }
    const sticker = osMakeSticker(kind);
    if (!sticker) return;
    osStickerHandleStyle(sticker);
    sticker.set({
        left: 24 + Math.random() * 40,
        top: 24 + Math.random() * 36
    });
    canvas.add(sticker);
    canvas.setActiveObject(sticker);
    canvas.renderAll();
    if (typeof osStickerPaintDel === 'function') osStickerPaintDel();
}

function addOsEditStickerImage(url) {
    const canvas = typeof osStickerEnsure === 'function' ? osStickerEnsure() : null;
    if (!canvas || typeof fabric === 'undefined') {
        showToast('Sticker editor is not ready.');
        return Promise.resolve();
    }
    const src = String(url || '').trim();
    if (!src) return Promise.resolve();
    const cors = /^https?:/i.test(src) ? { crossOrigin: 'anonymous' } : undefined;
    return new Promise((resolve) => {
        fabric.Image.fromURL(src, (img) => {
            if (!img || !img.width) {
                showToast('Could not load that sticker image.');
                return resolve();
            }
            const max = 110;
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            osStickerHandleStyle(img);
            img.set({
                left: 28 + Math.random() * 48,
                top: 28 + Math.random() * 36,
                scaleX: scale,
                scaleY: scale
            });
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            if (typeof osStickerPaintDel === 'function') osStickerPaintDel();
            resolve();
        }, cors);
    });
}

function removeOsEditSticker() {
    const canvas = osStickerCanvas;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) {
        showToast('Select a sticker to remove.');
        return;
    }
    canvas.remove(active);
    canvas.discardActiveObject();
    canvas.renderAll();
    if (typeof osStickerPaintDel === 'function') osStickerPaintDel();
}

function onOsEditStickerClick(event) {
    const fileBtn = event.target.closest('[data-osstickerfile]');
    if (fileBtn) {
        event.preventDefault();
        deleteOsStickerFile(fileBtn.dataset.osstickerfile).catch((err) => showToast(err.message));
        return;
    }
    if (event.target.closest('[data-osstickerdel]')) {
        event.preventDefault();
        removeOsEditSticker();
        return;
    }
    if (event.target.closest('[data-osstickerup]')) {
        event.preventDefault();
        document.getElementById('osStickerFile')?.click();
        return;
    }
    const tile = event.target.closest('[data-osstickerimg]');
    if (tile) {
        event.preventDefault();
        addOsEditStickerImage(tile.dataset.osstickerimg);
        return;
    }
    const chip = event.target.closest('[data-ossticker]');
    if (!chip) return;
    event.preventDefault();
    addOsEditSticker(chip.dataset.ossticker);
}

function onOsEditStickerKey(event) {
    if (event.key !== 'Delete' && event.key !== 'Backspace') return;
    const tag = String(event.target.tagName || '');
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target.isContentEditable) return;
    if (!osStickerCanvas || !osStickerCanvas.getActiveObject()) return;
    event.preventDefault();
    removeOsEditSticker();
}
