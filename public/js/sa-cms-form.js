function saCmsReadBanners() {
    return [...document.querySelectorAll('#saCmsBannerList .sa-cms-edit')].map((card, index) => ({
        id: 'ban-' + (index + 1),
        title: card.querySelector('[data-banner="title"]').value,
        text: card.querySelector('[data-banner="text"]').value,
        image: card.querySelector('[data-banner="image"]').value,
        link: card.querySelector('[data-banner="link"]').value,
        shopId: card.querySelector('[data-banner="shop"]').value,
        cta: card.querySelector('[data-banner="cta"]').value,
        enabled: card.querySelector('input[type="checkbox"]').checked
    }));
}

function saCmsReadPromos() {
    return [...document.querySelectorAll('#saCmsPromoList .sa-cms-edit')].map((card) => ({
        title: card.querySelector('[data-promo="title"]').value,
        text: card.querySelector('[data-promo="text"]').value,
        image: card.querySelector('[data-promo="image"]').value,
        link: card.querySelector('[data-promo="link"]').value,
        shopId: card.querySelector('[data-promo="shop"]').value
    }));
}

function saCmsPromoThumb(input) {
    const img = input.closest('.sa-cms-edit').querySelector('.sa-cms-promo-thumb');
    if (!img) return;
    const url = saCmsUrl(input.value);
    img.hidden = !url;
    if (url) img.src = url;
}

async function saCmsReload() {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
            const again = await fetch('/api/admin/cms');
            if (again.ok) return again.json();
        } catch (error) {
            /* The dev server may restart after a settings file write. */
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return null;
}

async function saCmsSave(body) {
    try {
        const response = await fetch('/api/admin/cms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not save marketplace settings.');
        saCmsPack = data;
        saCmsNote = data.message || 'Marketplace settings saved.';
    } catch (error) {
        const fresh = await saCmsReload();
        saCmsPack = fresh || saCmsPack;
        saCmsNote = fresh ? 'Marketplace settings reloaded.' : 'Could not save marketplace settings.';
    }
    saPaintCms();
}

document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-cms-tab]');
    if (tab && document.getElementById('saCms')) {
        saCmsTab = tab.dataset.cmsTab;
        saCmsNote = '';
        saPaintCms();
        return;
    }
    if (event.target.closest('#saCmsAddBanner')) {
        saCmsPack.cms.banners = (saCmsPack.cms.banners || []).concat([{
            id: 'ban-' + Date.now(), title: 'New Banner', text: '', image: '', link: '/#shops', shopId: '', cta: 'Shop Now', enabled: true
        }]);
        saPaintCms();
    }
    const drop = event.target.closest('[data-cms-drop]');
    if (drop) {
        saCmsPack.cms.banners = (saCmsPack.cms.banners || []).filter((row) => row.id !== drop.dataset.cmsDrop);
        saPaintCms();
    }
    if (event.target.closest('#saCmsSaveBanners')) {
        saCmsSave({ banners: saCmsReadBanners(), note: 'Homepage banners updated.' });
    }
    const picks = event.target.closest('[data-cms-save-picks]');
    if (picks) {
        const ids = [...document.querySelectorAll('[data-cms-pick]:checked')].map((box) => box.dataset.cmsPick);
        const key = picks.dataset.cmsSavePicks === 'shops' ? 'featuredShopIds' : 'featuredProductIds';
        saCmsSave({ [key]: ids, note: picks.dataset.cmsSavePicks === 'shops' ? 'Featured shops updated.' : 'Featured products updated.' });
    }
    if (event.target.closest('#saCmsSaveSections')) {
        const sections = {};
        document.querySelectorAll('[data-cms-section]').forEach((box) => { sections[box.dataset.cmsSection] = box.checked; });
        const body = { sections, note: 'Homepage sections updated.' };
        const promos = saCmsReadPromos();
        if (promos.length) body.promos = promos;
        if (document.getElementById('saCmsAdManager')) {
            body.featuredShopAdIds = [...document.querySelectorAll('[data-cms-ad]:checked')].map((box) => box.dataset.cmsAd);
            body.note = 'Homepage sections and shopkeeper ads updated.';
        }
        saCmsSave(body);
    }
    if (event.target.closest('#saCmsCopy')) {
        const host = (saCmsPack.cms.domain || location.host).replace(/^https?:\/\//, '');
        const link = (host === location.host ? location.origin : 'https://' + host) + '/';
        navigator.clipboard.writeText(link).then(() => {
            saCmsNote = 'Website link copied.';
            saPaintCms();
        }).catch(() => {
            saCmsNote = link;
            saPaintCms();
        });
    }
});

async function saCmsUpload(file, input) {
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type) || file.size > 2 * 1024 * 1024) {
        saCmsNote = 'Choose a PNG, JPG, or WebP image under 2 MB.';
        const note = document.getElementById('saCmsNote');
        if (note) note.textContent = saCmsNote;
        return;
    }
    const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('read'));
        reader.readAsDataURL(file);
    });
    const response = await fetch('/api/admin/cms/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
    });
    const payload = await response.json();
    if (!response.ok || !payload.url) {
        saCmsNote = payload.message || 'Could not store the banner image.';
    } else {
        input.value = payload.url;
        const promo = input.matches('[data-promo="image"]');
        saCmsNote = promo ? 'Image uploaded. Save sections to publish it.' : 'Image uploaded. Save banners to publish it.';
        if (promo) saCmsPromoThumb(input);
    }
    const note = document.getElementById('saCmsNote');
    if (note) note.textContent = saCmsNote;
}

document.addEventListener('change', (event) => {
    if (event.target.id === 'saCmsOnline') {
        saCmsSave({ online: event.target.checked, note: event.target.checked ? 'Website set online.' : 'Website set offline.' });
    }
    if (event.target.matches('[data-banner="file"], [data-promo="file"]')) {
        const image = event.target.closest('.sa-cms-edit').querySelector('[data-banner="image"], [data-promo="image"]');
        saCmsUpload(event.target.files && event.target.files[0], image).catch(() => {
            saCmsNote = 'Could not store the banner image.';
            const note = document.getElementById('saCmsNote');
            if (note) note.textContent = saCmsNote;
        });
    }
});

document.addEventListener('input', (event) => {
    const search = event.target.id === 'saCmsPickSearch' ? ['saCmsPickList', 'saCmsPickEmpty']
        : (event.target.id === 'saCmsAdSearch' ? ['saCmsAdList', 'saCmsAdEmpty'] : null);
    if (search) {
        const query = event.target.value.trim().toLowerCase();
        const rows = [...document.querySelectorAll('#' + search[0] + ' .sa-cms-pick')];
        rows.forEach((row) => row.classList.toggle('is-hidden', Boolean(query) && !(row.dataset.find || '').includes(query)));
        const empty = document.getElementById(search[1]);
        if (empty) empty.hidden = rows.some((row) => !row.classList.contains('is-hidden'));
    }
    if (event.target.matches('[data-promo="image"]')) saCmsPromoThumb(event.target);
});

document.addEventListener('submit', (event) => {
    if (event.target.id === 'saCmsSettingsForm') {
        event.preventDefault();
        saCmsSave({
            online: document.getElementById('saCmsSetOnline').checked,
            domain: document.getElementById('saCmsDomain').value,
            note: 'Marketplace settings updated.'
        });
    }
});
