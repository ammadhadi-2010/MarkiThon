function compressOsBannerImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        if (file.size > 6 * 1024 * 1024) {
            return reject(new Error('Image is too large. Use a file under 6 MB.'));
        }
        const img = new Image();
        const blobUrl = URL.createObjectURL(file);
        img.onload = () => {
            const max = 1280;
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

async function fillOsBannerCats(selected) {
    const sel = document.getElementById('osBannerLink');
    if (!sel) return;
    const keep = new Set(['home', 'sale', 'featured', 'new']);
    [...sel.querySelectorAll('option')].forEach((opt) => {
        if (!keep.has(opt.value)) opt.remove();
    });
    try {
        const rows = (typeof osProducts !== 'undefined' && osProducts.length)
            ? osProducts
            : await api.get('/api/store/catalog');
        const cats = [...new Set((rows || []).map((p) => p.category).filter(Boolean))].sort();
        cats.forEach((name) => {
            const opt = document.createElement('option');
            opt.value = 'cat:' + name;
            opt.textContent = 'Category: ' + name;
            sel.appendChild(opt);
        });
    } catch (error) {
        /* catalog optional */
    }
    if (selected) sel.value = selected;
}

function bindOsBannerUpload() {
    const file = document.getElementById('osBannerFile');
    if (!file || file.dataset.bound) return;
    file.dataset.bound = '1';
    file.addEventListener('change', () => {
        const picked = file.files && file.files[0];
        if (!picked) return;
        compressOsBannerImage(picked).then((dataUrl) => {
            document.getElementById('osBannerImage').value = dataUrl;
            paintOsBannerPreview();
        }).catch((error) => showToast(error.message));
    });
}
