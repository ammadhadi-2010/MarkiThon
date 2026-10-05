function osStickerText(label, opts) {
    return new fabric.Text(label, Object.assign({
        originX: 'center',
        originY: 'center',
        fill: '#fff',
        fontFamily: 'Segoe UI, sans-serif',
        fontWeight: '800',
        textAlign: 'center'
    }, opts));
}

function osStickerGroup(parts, extra) {
    const group = new fabric.Group(parts, Object.assign({
        left: 36,
        top: 36,
        sticker: true,
        cornerColor: '#60a5fa',
        cornerStrokeColor: '#1e3a8a',
        borderColor: '#93c5fd',
        transparentCorners: false,
        cornerSize: 11,
        rotatingPointOffset: 26
    }, extra || {}));
    return group;
}

function osMakeSticker(kind) {
    if (typeof fabric === 'undefined') return null;
    if (kind === 'off') {
        return osStickerGroup([
            new fabric.Ellipse({ rx: 62, ry: 36, fill: '#dc2626', originX: 'center', originY: 'center' }),
            osStickerText('50% OFF', { fontSize: 18 })
        ]);
    }
    if (kind === 'new') {
        return osStickerGroup([
            new fabric.Rect({
                width: 88, height: 36, rx: 8, ry: 8,
                fill: '#16a34a', originX: 'center', originY: 'center'
            }),
            osStickerText('NEW', { fontSize: 18 })
        ]);
    }
    if (kind === 'hot') {
        return osStickerGroup([
            new fabric.Rect({
                width: 128, height: 34, rx: 17, ry: 17,
                fill: '#ea580c', originX: 'center', originY: 'center'
            }),
            osStickerText('HOT SALE', { fontSize: 15 })
        ]);
    }
    if (kind === 'cotton') {
        return osStickerGroup([
            new fabric.Circle({ radius: 48, fill: '#1d4ed8', originX: 'center', originY: 'center' }),
            new fabric.Circle({
                radius: 42, fill: 'transparent', stroke: '#93c5fd', strokeWidth: 2,
                originX: 'center', originY: 'center'
            }),
            osStickerText('100%\nCOTTON', { fontSize: 13, lineHeight: 1.05 })
        ]);
    }
    return osStickerGroup([
        new fabric.Rect({
            width: 132, height: 36, rx: 10, ry: 10,
            fill: '#ca8a04', originX: 'center', originY: 'center'
        }),
        osStickerText('BEST QUALITY', { fontSize: 13, fill: '#1c1917' })
    ]);
}
