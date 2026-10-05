function compressOsBrandImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        if (file.size > 6 * 1024 * 1024) {
            return reject(new Error('Image is too large. Use a file under 6 MB.'));
        }
        const img = new Image();
        const blobUrl = URL.createObjectURL(file);
        img.onload = () => {
            const max = maxSize || 720;
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

function paintOsDrop(kind, url) {
    const prefix = kind === 'logo' ? 'osLogo' : 'osCover';
    const img = document.getElementById(prefix + 'Preview');
    const hint = document.getElementById(prefix + 'Hint');
    const hidden = document.getElementById(prefix + 'Url');
    if (hidden) hidden.value = url || '';
    if (img && url) {
        img.src = url;
        img.hidden = false;
        if (hint) hint.hidden = true;
    } else if (img) {
        img.removeAttribute('src');
        img.hidden = true;
        if (hint) hint.hidden = false;
    }
}

async function applyOsDropFile(kind, file) {
    if (!file) return;
    const max = kind === 'logo' ? 512 : 1280;
    const dataUrl = await compressOsBrandImage(file, max);
    paintOsDrop(kind, dataUrl);
}

function bindOsDrop(kind) {
    const prefix = kind === 'logo' ? 'osLogo' : 'osCover';
    const drop = document.getElementById(prefix + 'Drop');
    const file = document.getElementById(prefix + 'File');
    const change = document.getElementById(prefix + 'Change');
    if (!drop || !file || drop.dataset.bound) return;
    drop.dataset.bound = '1';
    const pick = () => file.click();
    drop.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        pick();
    });
    change.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        pick();
    });
    file.addEventListener('change', () => {
        applyOsDropFile(kind, file.files && file.files[0]).catch((err) => showToast(err.message));
        file.value = '';
    });
    drop.addEventListener('dragover', (event) => {
        event.preventDefault();
        drop.classList.add('on');
    });
    drop.addEventListener('dragleave', () => drop.classList.remove('on'));
    drop.addEventListener('drop', (event) => {
        event.preventDefault();
        drop.classList.remove('on');
        const picked = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
        applyOsDropFile(kind, picked).catch((err) => showToast(err.message));
    });
}
