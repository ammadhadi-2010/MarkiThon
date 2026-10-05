function formatObWhatsapp(value) {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('92') && digits.length > 10) digits = '0' + digits.slice(2);
    digits = digits.slice(0, 11);
    if (digits.length <= 4) return digits;
    return digits.slice(0, 4) + '-' + digits.slice(4);
}

function compressObImage(file, maxSize) {
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

function paintObDrop(prefix, url, fallback) {
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
        if (hint) {
            hint.hidden = false;
            if (fallback) hint.textContent = fallback;
        }
    }
    if (prefix.indexOf('obBan') === 0 && typeof paintObHeroSlide === 'function') {
        paintObHeroSlide(Number(prefix.replace('obBan', '')), url || '');
    }
}

function paintObMedia(logoUrl, banners) {
    const slides = Array.isArray(banners) ? banners : [banners];
    paintObDrop('obLogo', logoUrl || '', 'M');
    [0, 1, 2].forEach((i) => paintObDrop('obBan' + i, slides[i] || '', String(i + 1)));
}

function bindObDrop(prefix, maxSize) {
    const card = document.getElementById(prefix + 'Card');
    const file = document.getElementById(prefix + 'File');
    const change = document.getElementById(prefix + 'Change');
    if (!card || !file || card.dataset.bound) return;
    card.dataset.bound = '1';
    const apply = (picked) => {
        compressObImage(picked, maxSize).then((dataUrl) => {
            paintObDrop(prefix, dataUrl);
            if (prefix.indexOf('obBan') === 0 && typeof showObHero === 'function') {
                showObHero(Number(prefix.replace('obBan', '')));
                if (typeof startObHeroTimer === 'function') startObHeroTimer();
            }
        }).catch((err) => showToast(err.message));
    };
    if (change) {
        change.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            file.click();
        });
    }
    card.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        file.click();
    });
    file.addEventListener('change', () => {
        apply(file.files && file.files[0]);
        file.value = '';
    });
    card.addEventListener('dragover', (event) => {
        event.preventDefault();
        card.classList.add('on');
    });
    card.addEventListener('dragleave', () => card.classList.remove('on'));
    card.addEventListener('drop', (event) => {
        event.preventDefault();
        card.classList.remove('on');
        apply(event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]);
    });
}

function bindObMedia() {
    bindObDrop('obLogo', 512);
    [0, 1, 2].forEach((i) => bindObDrop('obBan' + i, 1280));
    if (typeof bindObHero === 'function') bindObHero();
    const wa = document.getElementById('obOrderWhatsapp');
    if (wa && !wa.dataset.bound) {
        wa.dataset.bound = '1';
        wa.addEventListener('input', () => {
            wa.value = formatObWhatsapp(wa.value);
        });
    }
}
