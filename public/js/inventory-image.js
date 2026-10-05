function compressInvImage(file) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve('');
        if (file.size > 6 * 1024 * 1024) {
            return reject(new Error('Image is too large. Use a file under 6 MB.'));
        }
        const img = new Image();
        const blobUrl = URL.createObjectURL(file);
        img.onload = () => {
            const max = 720;
            const scale = Math.min(1, max / Math.max(img.width, img.height));
            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(img.width * scale));
            canvas.height = Math.max(1, Math.round(img.height * scale));
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(blobUrl);
            resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        img.onerror = () => {
            URL.revokeObjectURL(blobUrl);
            reject(new Error('Could not read that image file.'));
        };
        img.src = blobUrl;
    });
}

function bindInvImageCompress() {
    const file = document.getElementById('invImageFile');
    if (!file || file.dataset.bound) return;
    file.dataset.bound = '1';
    file.addEventListener('change', (e) => {
        const picked = e.target.files && e.target.files[0];
        if (!picked) return;
        compressInvImage(picked).then((dataUrl) => {
            document.getElementById('invImageUrl').value = dataUrl;
            previewImage();
        }).catch((error) => showToast(error.message));
    });
}
