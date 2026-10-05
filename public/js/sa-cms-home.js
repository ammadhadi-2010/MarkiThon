let saHomeReviewAt = 0;
let saHomeEditKey = '';

const SA_HOME_ROWS = [
    ['categories', 'Explore Categories'],
    ['why', 'Why Shop With Us'],
    ['reviews', 'Customer Reviews'],
    ['newsletter', 'Newsletter / CTA'],
    ['offers', 'Special Offers / Deals'],
    ['recent', 'Recently Viewed']
];

function saCmsHomePanel(pack) {
    const home = pack.cms.home || {};
    const rows = SA_HOME_ROWS.map(([id, label]) => {
        const on = home[id] !== false ? ' checked' : '';
        return `<div class="sa-home-row"><strong>${label}</strong><button class="sa-cms-link" type="button" data-home-edit="${id}">Edit</button><label class="sa-switch"><input data-home-toggle="${id}" type="checkbox" autocomplete="off"${on}><span></span></label></div>`;
    }).join('');
    return `<section class="sa-card"><h3>Homepage Sections</h3><p class="sa-muted">Turn homepage blocks on or off. Promo banners and shopkeeper ads stay on the Sections tab.</p>${rows}</section>`;
}

function saCmsHomeLayout(pack) {
    const footer = typeof saCmsFooterForm === 'function' ? saCmsFooterForm(pack) : '';
    return `<div class="sa-cms-grid"><div>${saCmsSettings(pack)}${saCmsHomePanel(pack)}${saCmsHomePreview()}${footer}</div>${saCmsSide(pack)}</div>${saCmsHomeModal()}`;
}

function saCmsHomePreview() {
    return `<aside class="sa-card" id="saHomePreview"><h3>Preview (Sections)</h3><div id="saHomeWhy"></div><div id="saHomeReviews"></div></aside>`;
}

function saCmsHomeModal() {
    return `<div class="sa-home-modal" id="saHomeModal" hidden><form class="sa-card sa-home-dialog" id="saHomeEdit" autocomplete="off"><h3 id="saHomeEditTitle">Edit section</h3><div id="saHomeEditBody"></div><button class="sa-cms-visit" type="submit">Save Section</button><button class="sa-cms-copy" type="button" data-home-close>Close</button></form></div>`;
}

const SA_HOME_ICONS = [
    '<path d="M12 3l7 3v6c0 4.2-2.8 7.2-7 8.5C7.8 19.2 5 16.2 5 12V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>',
    '<path d="M3 7h11v8H3zM14 10h4l3 3v2h-7"/><circle cx="7.5" cy="17.5" r="1.5"/><circle cx="17.5" cy="17.5" r="1.5"/>',
    '<path d="M20 12a8 8 0 0 0-13.5-5.5L4 9"/><path d="M4 4v5h5"/><path d="M4 12a8 8 0 0 0 13.5 5.5L20 15"/><path d="M20 20v-5h-5"/>'
];

const SA_HOME_FACES = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd722bf5d?auto=format&fit=crop&w=120&q=80'
];

function saHomeMark(path) {
    return `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#7dd3fc" stroke-width="1.8" aria-hidden="true">${path}</svg>`;
}

function saCmsHomePaint(source) {
    const home = source || (saCmsPack && saCmsPack.cms && saCmsPack.cms.home) || {};
    const why = document.getElementById('saHomeWhy');
    const reviews = document.getElementById('saHomeReviews');
    if (!why || !reviews) return;
    const benefits = home.benefits || [];
    why.className = home.why === false ? 'is-off' : '';
    why.innerHTML = `<h4>${saText(home.whyTitle || 'Why Shop With Us')}</h4><div class="sa-home-benefits">${benefits.map((row, index) => `<article class="sa-home-benefit"><span class="sa-home-ico">${saHomeMark(SA_HOME_ICONS[index % 4])}</span><strong>${saText(row.title)}</strong><span>${saText(row.text)}</span></article>`).join('')}</div>`;
    const list = home.quotes || [];
    const at = list.length ? ((saHomeReviewAt % list.length) + list.length) % list.length : 0;
    const row = list[at];
    const face = SA_HOME_FACES[at % SA_HOME_FACES.length];
    const dots = list.map((_, index) => `<button type="button" class="sa-home-dot${index === at ? ' is-on' : ''}" data-home-dot="${index}" aria-label="Review ${index + 1}"></button>`).join('');
    reviews.className = home.reviews === false ? 'is-off' : '';
    reviews.innerHTML = `<div class="sa-home-rev-head"><h4>${saText(home.reviewsTitle || 'Customer Reviews')}</h4><span>View All Reviews →</span></div>${row ? `<article class="sa-home-slide"><img src="${face}" alt=""><div><strong>${saText(row.name)}</strong><p class="sa-home-rate"><b>${saText(row.stars)}</b><em>★★★★★</em></p><p>“${saText(row.text)}”</p></div><button type="button" data-home-step="1" aria-label="Next review">›</button></article>` : ''}<div class="sa-home-dots">${dots}</div>`;
}

function saHomeField(name, label, value) {
    return `<label>${label}</label><input data-home-field="${name}" autocomplete="off" value="${saText(value || '')}">`;
}

function saHomeEditBody(key) {
    const home = saCmsPack.cms.home;
    if (key === 'why') {
        return saHomeField('whyTitle', 'Heading', home.whyTitle) + home.benefits.map((row, index) => `<label>Benefit ${index + 1} title</label><input data-home-benefit="${index}" data-part="title" autocomplete="off" value="${saText(row.title)}"><label>Benefit ${index + 1} text</label><input data-home-benefit="${index}" data-part="text" autocomplete="off" value="${saText(row.text)}">`).join('');
    }
    if (key === 'reviews') {
        return saHomeField('reviewsTitle', 'Heading', home.reviewsTitle) + home.quotes.map((row, index) => `<label>Review ${index + 1} name</label><input data-home-quote="${index}" data-part="name" autocomplete="off" value="${saText(row.name)}"><label>Stars</label><input data-home-quote="${index}" data-part="stars" autocomplete="off" value="${saText(row.stars)}"><label>Review ${index + 1} text</label><textarea data-home-quote="${index}" data-part="text" autocomplete="off">${saText(row.text)}</textarea>`).join('');
    }
    if (key === 'newsletter') {
        return saHomeField('newsTitle', 'Heading', home.newsTitle) + `<label>Text</label><textarea data-home-field="newsText" autocomplete="off">${saText(home.newsText || '')}</textarea>`;
    }
    const names = { categories: 'categoriesLabel', offers: 'offersLabel', recent: 'recentLabel' };
    return saHomeField(names[key], 'Heading', home[names[key]]);
}

function saHomeReadForm() {
    const home = JSON.parse(JSON.stringify(saCmsPack.cms.home));
    document.querySelectorAll('#saHomeEdit [data-home-field]').forEach((el) => { home[el.dataset.homeField] = el.value; });
    document.querySelectorAll('#saHomeEdit [data-home-benefit]').forEach((el) => { home.benefits[el.dataset.homeBenefit][el.dataset.part] = el.value; });
    document.querySelectorAll('#saHomeEdit [data-home-quote]').forEach((el) => { home.quotes[el.dataset.homeQuote][el.dataset.part] = el.value; });
    return home;
}

function saHomeOpen(key) {
    const label = (SA_HOME_ROWS.find((row) => row[0] === key) || [])[1] || 'Section';
    saHomeEditKey = key;
    document.getElementById('saHomeEditTitle').textContent = 'Edit ' + label;
    document.getElementById('saHomeEditBody').innerHTML = saHomeEditBody(key);
    document.getElementById('saHomeModal').hidden = false;
}

document.addEventListener('click', (event) => {
    const edit = event.target.closest('[data-home-edit]');
    if (edit && document.getElementById('saCms')) {
        saHomeOpen(edit.dataset.homeEdit);
        return;
    }
    if (event.target.closest('[data-home-close]')) {
        const modal = document.getElementById('saHomeModal');
        if (modal) modal.hidden = true;
    }
    const step = event.target.closest('[data-home-step]');
    const dot = event.target.closest('[data-home-dot]');
    if ((step || dot) && document.getElementById('saHomeReviews')) {
        saHomeReviewAt = dot ? Number(dot.dataset.homeDot) : saHomeReviewAt + (Number(step.dataset.homeStep) || 0);
        saCmsHomePaint();
    }
});

document.addEventListener('change', (event) => {
    if (!event.target.matches('[data-home-toggle]') || !saCmsPack) return;
    const key = event.target.dataset.homeToggle;
    saCmsPack.cms.home[key] = event.target.checked;
    saCmsHomePaint();
    saCmsSave({ home: { [key]: event.target.checked }, note: 'Homepage section updated.' });
});

document.addEventListener('input', (event) => {
    if (!event.target.closest('#saHomeEdit') || !saCmsPack) return;
    saCmsHomePaint(saHomeReadForm());
});

document.addEventListener('submit', (event) => {
    if (event.target.id !== 'saHomeEdit') return;
    event.preventDefault();
    saCmsSave({ home: saHomeReadForm(), note: 'Homepage section copy updated.' });
});
