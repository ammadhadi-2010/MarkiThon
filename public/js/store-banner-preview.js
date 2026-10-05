function osBannerEsc(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function osBannerRead() {
    return {
        enabled: Boolean(document.getElementById('osBannerOn')?.checked),
        imageUrl: String(document.getElementById('osBannerImage')?.value || ''),
        sub: String(document.getElementById('osBannerSub')?.value || '').trim(),
        headline: String(document.getElementById('osBannerHead')?.value || '').trim(),
        description: String(document.getElementById('osBannerDesc')?.value || '').trim(),
        ctaText: String(document.getElementById('osBannerCta')?.value || '').trim(),
        ctaLink: String(document.getElementById('osBannerLink')?.value || 'sale')
    };
}

function paintOsBannerPreview() {
    const el = document.getElementById('osBannerPreview');
    if (!el) return;
    const b = osBannerRead();
    const sub = b.sub || 'LIMITED TIME OFFER';
    const head = b.headline || 'Save Up to 30%';
    const desc = b.description || 'On Selected Bedding & Towels';
    const cta = b.ctaText || 'Shop Sale';
    const img = b.imageUrl
        ? `style="background-image:linear-gradient(90deg,rgba(11,17,32,.88),rgba(22,31,54,.42)),url('${b.imageUrl.replace(/'/g, '%27')}')"`
        : '';
    el.classList.toggle('is-off', !b.enabled);
    el.innerHTML = `
        <div class="os-banner-hero"${img}>
            <span class="os-banner-kicker">${osBannerEsc(sub)}</span>
            <strong>${osBannerEsc(head)}</strong>
            <p>${osBannerEsc(desc)}</p>
            <span class="os-banner-btn">${osBannerEsc(cta)}</span>
        </div>`;
}

function fillOsBanner(data) {
    const row = data || {};
    const on = document.getElementById('osBannerOn');
    const img = document.getElementById('osBannerImage');
    const sub = document.getElementById('osBannerSub');
    const head = document.getElementById('osBannerHead');
    const desc = document.getElementById('osBannerDesc');
    const cta = document.getElementById('osBannerCta');
    const link = document.getElementById('osBannerLink');
    if (on) on.checked = Boolean(row.enabled);
    if (img) img.value = String(row.imageUrl || '');
    if (sub) sub.value = String(row.sub || 'LIMITED TIME OFFER');
    if (head) head.value = String(row.headline || 'Save Up to 30%');
    if (desc) desc.value = String(row.description || 'On Selected Bedding & Towels');
    if (cta) cta.value = String(row.ctaText || 'Shop Sale');
    if (link && row.ctaLink) link.value = row.ctaLink;
    paintOsBannerPreview();
}
