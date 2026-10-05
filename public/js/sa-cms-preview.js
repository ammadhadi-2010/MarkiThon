let saCmsPreviewIndex = 0;

function saCmsPreviewShell() {
    return `<aside class="sa-card sa-cms-live">
        <h3>Banner Preview (Home Page)</h3>
        <div class="sa-cms-hero" id="saCmsHero">
            <button class="sa-cms-arrow prev" type="button" data-cms-prev aria-label="Previous banner">‹</button>
            <div class="sa-cms-hero-copy">
                <p class="sa-cms-brand"><span>M</span> MarkiThon</p>
                <strong id="saCmsHeroTitle">Banner title</strong>
                <span id="saCmsHeroText"></span>
                <em class="sa-cms-hero-cta" id="saCmsHeroCta">Shop Now →</em>
                <small id="saCmsHeroLink"></small>
            </div>
            <button class="sa-cms-arrow next" type="button" data-cms-next aria-label="Next banner">›</button>
        </div>
    </aside>`;
}

function saCmsPreviewCards() {
    return [...document.querySelectorAll('#saCmsBannerList .sa-cms-edit')];
}

function saCmsPreviewImage(card) {
    const local = card.dataset.liveImage || '';
    if (/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(local)) return local;
    const field = card.querySelector('[data-banner="image"]');
    return saCmsUrl(field ? field.value : '');
}

function saCmsPaintLive() {
    const hero = document.getElementById('saCmsHero');
    const cards = saCmsPreviewCards();
    if (!hero) return;
    cards.forEach((card) => card.classList.remove('is-live'));
    if (!cards.length) return;
    saCmsPreviewIndex = ((saCmsPreviewIndex % cards.length) + cards.length) % cards.length;
    const card = cards[saCmsPreviewIndex];
    card.classList.add('is-live');
    const image = saCmsPreviewImage(card);
    hero.style.backgroundImage = image ? 'url("' + image.replace(/["\\]/g, '') + '")' : '';
    const title = card.querySelector('[data-banner="title"]');
    const text = card.querySelector('[data-banner="text"]');
    const shop = card.querySelector('[data-banner="shop"]');
    const link = card.querySelector('[data-banner="link"]');
    document.getElementById('saCmsHeroTitle').textContent = (title && title.value.trim()) || 'Banner title';
    document.getElementById('saCmsHeroText').textContent = text ? text.value : '';
    document.getElementById('saCmsHeroLink').textContent = saCmsBannerHref({
        shopId: shop ? shop.value : '',
        link: link ? link.value : ''
    });
}

function saCmsPreviewFile(file, card) {
    if (!file || !/^image\/(png|jpeg|webp)$/.test(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => {
        card.dataset.liveImage = String(reader.result || '');
        saCmsPaintLive();
    };
    reader.readAsDataURL(file);
}

function saCmsPreviewFrom(event) {
    const field = event.target.closest('[data-banner]');
    if (!field || !document.getElementById('saCmsHero')) return;
    const card = field.closest('.sa-cms-edit');
    const index = saCmsPreviewCards().indexOf(card);
    if (index >= 0) saCmsPreviewIndex = index;
    if (field.dataset.banner === 'image') delete card.dataset.liveImage;
    if (field.dataset.banner === 'file' && field.files && field.files[0]) saCmsPreviewFile(field.files[0], card);
    else saCmsPaintLive();
}

document.addEventListener('input', saCmsPreviewFrom);
document.addEventListener('change', saCmsPreviewFrom);
document.addEventListener('click', (event) => {
    if (!document.getElementById('saCmsHero')) return;
    const step = event.target.closest('[data-cms-next]') ? 1 : (event.target.closest('[data-cms-prev]') ? -1 : 0);
    if (!step || !saCmsPreviewCards().length) return;
    saCmsPreviewIndex += step;
    saCmsPaintLive();
});
