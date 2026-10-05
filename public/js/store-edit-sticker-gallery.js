function paintOsStickerGallery(items) {
    const box = document.getElementById('osStickerGallery');
    if (!box) return;
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
        box.innerHTML = '<p class="os-sticker-empty">No folder stickers yet. Upload a PNG or GIF.</p>';
        return;
    }
    box.innerHTML = list.map((item) =>
        `<span class="os-sticker-tile-wrap">
            <button type="button" class="os-sticker-tile" data-osstickerimg="${escapeHtml(item.url)}" title="${escapeHtml(item.name)}">
                <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}" onerror="this.style.opacity=0.2">
            </button>
            <button type="button" class="os-sticker-x" data-osstickerfile="${escapeHtml(item.name)}" aria-label="Delete sticker">×</button>
        </span>`
    ).join('');
}

async function loadOsStickerGallery() {
    const box = document.getElementById('osStickerGallery');
    if (!box) return;
    try {
        const data = await api.get('/api/online-store/stickers');
        paintOsStickerGallery(data.stickers || []);
    } catch (error) {
        box.innerHTML = '<p class="os-sticker-empty">Could not load the sticker gallery.</p>';
    }
}

function osReadStickerFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('Choose a sticker file.'));
        if (file.size > 2 * 1024 * 1024) {
            return reject(new Error('Sticker is too large. Use a file under 2 MB.'));
        }
        const ok = /image\/(png|gif|webp|svg\+xml)/i.test(file.type);
        if (!ok) return reject(new Error('Use a PNG, GIF, SVG, or WebP file.'));
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Could not read that sticker file.'));
        reader.readAsDataURL(file);
    });
}

async function onOsStickerFileChange(event) {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    const dataUrl = await osReadStickerFile(file);
    if (typeof addOsEditStickerImage === 'function') {
        await addOsEditStickerImage(dataUrl);
    }
    try {
        await api.post('/api/online-store/stickers', { name: file.name, dataUrl });
        await loadOsStickerGallery();
    } catch (error) {
        showToast(error.message || 'Sticker added to the photo, but folder save failed.');
    }
}

async function deleteOsStickerFile(name) {
    const ok = await openConfirmDelete({
        title: 'Delete Sticker',
        detail: name,
        yesLabel: 'Delete Sticker'
    });
    if (!ok) return;
    await api.del('/api/online-store/stickers/' + encodeURIComponent(name));
    await loadOsStickerGallery();
    showToast('Sticker deleted successfully');
}
