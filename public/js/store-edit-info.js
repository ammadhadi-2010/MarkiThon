function osEditDash(value) {
    const text = String(value == null ? '' : value).trim();
    return text || '—';
}

function osEditImageList(row) {
    const urls = Array.isArray(row.images) ? row.images.slice() : [];
    const main = String(row.imageUrl || '').trim();
    if (main && !urls.includes(main)) urls.unshift(main);
    return urls.filter(Boolean);
}

function paintOsEditThumbs(urls) {
    const box = document.getElementById('osEditThumbs');
    const hero = document.getElementById('osEditHero');
    if (!box || !hero) return;
    const shown = urls.slice(0, 8);
    const extra = Math.max(0, urls.length - shown.length);
    hero.src = shown[0] || '';
    hero.style.opacity = shown[0] ? '1' : '0.25';
    box.innerHTML = shown.map((url, index) =>
        `<button type="button" class="os-thumb${index === 0 ? ' on' : ''}" data-osimg="${escapeHtml(url)}">
            <img src="${escapeHtml(url)}" alt="" onerror="this.style.opacity=0.2">
        </button>`
    ).join('') + (extra ? `<span class="os-thumb-more">+${extra}</span>` : '');
}

function fillOsEditInfo(row) {
    const urls = osEditImageList(row);
    paintOsEditThumbs(urls);
    document.getElementById('osEditName').value = osEditDash(row.title);
    document.getElementById('osEditCat').value = osEditDash(row.category);
    document.getElementById('osEditSub').value = osEditDash(row.subCategory);
    document.getElementById('osEditSku').value = osEditDash(row.sku);
    document.getElementById('osEditStock').value = osEditDash(
        Number(row.stockMeters || 0).toLocaleString()
    );
    document.getElementById('osEditUnit').value = osEditDash(row.stockUnit);
}

function onOsEditThumbClick(event) {
    const btn = event.target.closest('[data-osimg]');
    if (!btn) return;
    const hero = document.getElementById('osEditHero');
    if (hero) {
        hero.src = btn.dataset.osimg;
        hero.style.opacity = '1';
    }
    document.querySelectorAll('#osEditThumbs .os-thumb').forEach((el) => {
        el.classList.toggle('on', el === btn);
    });
    if (typeof osStickerSetBackground === 'function') {
        osStickerSetBackground(btn.dataset.osimg);
    }
}
