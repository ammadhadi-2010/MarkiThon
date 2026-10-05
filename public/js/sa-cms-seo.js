function saSeoField(id, label, value, max, area) {
    const control = area
        ? `<textarea id="${id}" autocomplete="off" maxlength="${max}">${saText(value || '')}</textarea>`
        : `<input id="${id}" autocomplete="off" maxlength="${max}" value="${saText(value || '')}">`;
    return `<label>${label}</label>${control}<small class="sa-seo-count" data-seo-count="${id}"></small>`;
}

function saSeoSwitch(id, label, on) {
    return `<label class="sa-switch-row">${label}<span class="sa-switch"><input id="${id}" type="checkbox" autocomplete="off"${on ? ' checked' : ''}><span></span></span></label>`;
}

function saCmsSeoForm(pack) {
    const seo = pack.cms.seo || {};
    return `<form class="sa-card" id="saCmsSeoForm" autocomplete="off">
        <h3>Search</h3>
        <p class="sa-muted">These tags are published on the marketplace homepage.</p>
        ${saSeoField('saCmsSeoTitle', 'Meta title', seo.title, 70)}
        ${saSeoField('saCmsSeoText', 'Meta description', seo.description, 180, true)}
        ${saSeoField('saCmsSeoKeys', 'Keywords', seo.keywords, 180)}
        ${saSeoField('saCmsSeoCanon', 'Canonical URL', seo.canonical, 180)}
        ${saSeoSwitch('saCmsSeoIndex', 'Allow indexing', seo.index !== false)}
        ${saSeoSwitch('saCmsSeoFollow', 'Allow link following', seo.follow !== false)}
        <h3>Social</h3>
        ${saSeoField('saCmsSeoSite', 'Site name', seo.siteName, 40)}
        ${saSeoField('saCmsSeoOgTitle', 'Share title', seo.ogTitle, 70)}
        ${saSeoField('saCmsSeoOgText', 'Share description', seo.ogDescription, 180, true)}
        ${saSeoField('saCmsSeoOgImage', 'Share image URL', seo.ogImage, 300)}
        <button class="sa-cms-visit" type="submit">Save SEO</button>
    </form>`;
}

function saCmsSeoLayout(pack) {
    return `<div class="sa-cms-grid"><div>${saCmsSeoForm(pack)}</div><aside class="sa-card" id="saSeoSide"><h3>Search Preview</h3><div id="saSeoGoogle"></div><h3>Social Preview</h3><div id="saSeoSocial"></div><h3>SEO Checklist</h3><ul id="saSeoScore" class="sa-seo-score"></ul></aside></div>`;
}

function saCmsSeoRead() {
    const value = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const on = (id) => { const el = document.getElementById(id); return !el || el.checked; };
    return {
        title: value('saCmsSeoTitle'),
        description: value('saCmsSeoText'),
        keywords: value('saCmsSeoKeys'),
        canonical: value('saCmsSeoCanon'),
        index: on('saCmsSeoIndex'),
        follow: on('saCmsSeoFollow'),
        siteName: value('saCmsSeoSite'),
        ogTitle: value('saCmsSeoOgTitle'),
        ogDescription: value('saCmsSeoOgText'),
        ogImage: value('saCmsSeoOgImage')
    };
}

function saSeoHost(canonical) {
    if (/^https?:\/\//i.test(canonical)) {
        try { return new URL(canonical).host; } catch (error) { return location.host; }
    }
    return location.host;
}

function saSeoMark(ok, label) {
    return `<li class="${ok ? 'is-ok' : ''}">${ok ? 'Ready' : 'Needs work'} · ${label}</li>`;
}

function saCmsSeoPaint(source) {
    const google = document.getElementById('saSeoGoogle');
    const social = document.getElementById('saSeoSocial');
    const score = document.getElementById('saSeoScore');
    if (!google || !social || !score) return;
    const seo = source || saCmsSeoRead();
    const title = seo.title || 'MarkiThon';
    const text = seo.description || '';
    const shareTitle = seo.ogTitle || title;
    const shareText = seo.ogDescription || text;
    const image = typeof saCmsUrl === 'function' ? saCmsUrl(seo.ogImage) : '';
    document.querySelectorAll('[data-seo-count]').forEach((node) => {
        const field = document.getElementById(node.dataset.seoCount);
        const size = field ? field.value.length : 0;
        const limit = field && field.maxLength > 0 ? field.maxLength : 0;
        node.textContent = limit ? size + ' / ' + limit : '';
    });
    google.innerHTML = `<small>${saText(saSeoHost(seo.canonical))}</small><strong>${saText(title)}</strong><p>${saText(text)}</p>`;
    social.innerHTML = `<div class="sa-seo-photo"${image ? ` style="background-image:url('${image.replace(/'/g, '')}')"` : ''}></div><strong>${saText(shareTitle)}</strong><p>${saText(shareText)}</p><small>${saText(seo.siteName || 'MarkiThon')}</small>`;
    const titleOk = title.length >= 30 && title.length <= 60;
    const textOk = text.length >= 70 && text.length <= 160;
    score.innerHTML = [
        saSeoMark(titleOk, 'Title length'),
        saSeoMark(textOk, 'Description length'),
        saSeoMark(String(seo.keywords || '').trim().length > 3, 'Keywords'),
        saSeoMark(!seo.canonical || /^https?:\/\//i.test(seo.canonical), 'Canonical URL'),
        saSeoMark(Boolean(image), 'Share image'),
        saSeoMark(seo.index !== false, 'Indexing allowed')
    ].join('');
}

document.addEventListener('input', (event) => {
    if (event.target.closest('#saCmsSeoForm')) saCmsSeoPaint(saCmsSeoRead());
});

document.addEventListener('change', (event) => {
    if (event.target.closest('#saCmsSeoForm')) saCmsSeoPaint(saCmsSeoRead());
});

document.addEventListener('submit', (event) => {
    if (event.target.id !== 'saCmsSeoForm') return;
    event.preventDefault();
    saCmsSave({ seo: saCmsSeoRead(), note: 'SEO settings updated.' });
});
