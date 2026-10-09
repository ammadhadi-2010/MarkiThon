function compressOsThemeImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        if (file.size > 6 * 1024 * 1024) {
            return reject(new Error('Image is too large. Use a file under 6 MB.'));
        }
        const img = new Image();
        const blobUrl = URL.createObjectURL(file);
        img.onload = () => {
            const max = maxSize || 900;
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(blobUrl);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            reject(new Error('Could not read that image file.'));
        };
        img.src = blobUrl;
    });
}

function paintOsThemeAsset(key, url) {
    const hidden = document.getElementById('osTh_' + key);
    const img = document.getElementById('osThPrev_' + key);
    const hint = document.getElementById('osThHint_' + key);
    const clear = document.getElementById('osThClear_' + key);
    const file = document.getElementById('osThFile_' + key);
    const has = Boolean(url);
    if (hidden) hidden.value = url || '';
    if (file && !has) file.value = '';
    if (img && has) {
        img.src = url;
        img.hidden = false;
        if (hint) hint.hidden = true;
    } else if (img) {
        img.removeAttribute('src');
        img.hidden = true;
        if (hint) hint.hidden = false;
    }
    if (clear) clear.hidden = !has;
}

function clearOsThemeAsset(key) {
    paintOsThemeAsset(key, '');
    if (typeof paintOsThemePreview === 'function') paintOsThemePreview();
}

async function applyOsThemeFile(key, file) {
    if (!file) return;
    const max = key === 'logo' ? 480 : 1100;
    const dataUrl = await compressOsThemeImage(file, max);
    paintOsThemeAsset(key, dataUrl);
    paintOsThemePreview();
}

function bindOsThemeUploads(force) {
    document.querySelectorAll('[data-thfile]').forEach((input) => {
        if (input.dataset.bound && !force) return;
        input.dataset.bound = '1';
        input.addEventListener('change', () => {
            const key = input.getAttribute('data-thfile');
            applyOsThemeFile(key, input.files && input.files[0]).catch((err) => showToast(err.message));
            input.value = '';
        });
    });
}
