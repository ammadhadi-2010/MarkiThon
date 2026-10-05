let osStickerCanvas = null;
let osStickerBgUrl = '';

function osStickerReady() {
    return typeof fabric !== 'undefined' && fabric.Canvas;
}

function osStickerStageSize() {
    const wrap = document.getElementById('osStickerStage');
    const width = Math.max(220, (wrap && wrap.clientWidth) || 320);
    const height = window.matchMedia('(max-width: 767px)').matches ? 200 : 280;
    return { width, height };
}

function osStickerEnsure() {
    const el = document.getElementById('osStickerCanvas');
    if (!el || !osStickerReady()) return null;
    if (osStickerCanvas) return osStickerCanvas;
    const size = osStickerStageSize();
    osStickerCanvas = new fabric.Canvas('osStickerCanvas', {
        preserveObjectStacking: true,
        selection: true,
        backgroundColor: '#0b1120'
    });
    osStickerCanvas.setWidth(size.width);
    osStickerCanvas.setHeight(size.height);
    osStickerCanvas.on('selection:created', osStickerPaintDel);
    osStickerCanvas.on('selection:updated', osStickerPaintDel);
    osStickerCanvas.on('selection:cleared', osStickerPaintDel);
    return osStickerCanvas;
}

function osStickerPaintDel() {
    const btn = document.querySelector('[data-osstickerdel]');
    if (!btn) return;
    const active = osStickerCanvas && osStickerCanvas.getActiveObject();
    btn.hidden = !active;
}

function osStickerSetBackground(url) {
    const canvas = osStickerEnsure();
    if (!canvas) return Promise.resolve();
    const src = String(url || '').trim();
    osStickerBgUrl = src;
    if (!src) {
        canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        fabric.Image.fromURL(src, (img) => {
            if (!img || !img.width || !canvas) return resolve();
            const scale = Math.max(canvas.getWidth() / (img.width || 1), canvas.getHeight() / (img.height || 1));
            canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                originX: 'center',
                originY: 'center',
                left: canvas.getWidth() / 2,
                top: canvas.getHeight() / 2,
                scaleX: scale,
                scaleY: scale
            });
            resolve();
        }, /^https?:/i.test(src) ? { crossOrigin: 'anonymous' } : undefined);
    });
}

function osStickerClearObjects() {
    const canvas = osStickerEnsure();
    if (!canvas) return;
    canvas.getObjects().slice().forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.renderAll();
    osStickerPaintDel();
}

async function fillOsEditStickers(row) {
    const canvas = osStickerEnsure();
    if (canvas) {
        const size = osStickerStageSize();
        canvas.setWidth(size.width);
        canvas.setHeight(size.height);
    }
    const urls = typeof osEditImageList === 'function' ? osEditImageList(row || {}) : [];
    await osStickerSetBackground(urls[0] || '');
    osStickerClearObjects();
    if (osStickerCanvas) osStickerCanvas.calcOffset();
    if (typeof loadOsStickerGallery === 'function') {
        loadOsStickerGallery().catch(() => {});
    }
    const raw = row && row.storeStickerJson;
    if (!raw || !osStickerCanvas) return;
    try {
        const list = JSON.parse(raw);
        if (!Array.isArray(list) || !list.length) return;
        fabric.util.enlivenObjects(list, (objs) => {
            objs.forEach((obj) => {
                obj.set({ sticker: true });
                osStickerCanvas.add(obj);
            });
            osStickerCanvas.renderAll();
            osStickerPaintDel();
            osStickerCanvas.calcOffset();
        });
    } catch (error) {
        osStickerClearObjects();
    }
}
