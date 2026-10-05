function storeEditStickerPalette() {
    const items = [
        ['off', '50% OFF', 'os-sticker-off'],
        ['new', 'NEW', 'os-sticker-new'],
        ['hot', 'HOT SALE', 'os-sticker-hot'],
        ['cotton', '100% COTTON', 'os-sticker-cotton'],
        ['best', 'BEST QUALITY', 'os-sticker-best']
    ];
    const chips = items.map(([id, label, cls]) =>
        `<button type="button" class="os-sticker-chip ${cls}" data-ossticker="${id}">${label}</button>`
    ).join('');
    return `
        <div class="os-sticker-panel">
            <div class="os-sticker-bar">
                <div class="os-sticker-bar-head">
                    <strong>Product stickers</strong>
                    <span>Click a badge, then drag, resize, or rotate it on the photo.</span>
                </div>
                <div class="os-sticker-row">${chips}</div>
                <button type="button" class="ghost os-sticker-del" data-osstickerdel hidden>
                    Remove selected sticker
                </button>
            </div>
            <div class="os-sticker-gallery-wrap">
                <div class="os-sticker-bar-head">
                    <strong>Badge and GIF gallery</strong>
                    <span>Assets from /assets/stickers plus your uploads.</span>
                </div>
                <div id="osStickerGallery" class="os-sticker-gallery"></div>
                <button type="button" class="os-sticker-up" data-osstickerup>
                    Upload Custom Sticker / GIF
                </button>
                <input id="osStickerFile" name="osStickerFile" type="file"
                    accept="image/png,image/gif,image/svg+xml,image/webp" hidden autocomplete="off">
            </div>
        </div>`;
}

function storeEditStickerStage() {
    return `
        <div class="os-sticker-stage" id="osStickerStage">
            <img id="osEditHero" alt="Product" hidden>
            <canvas id="osStickerCanvas" width="560" height="280"></canvas>
        </div>`;
}
