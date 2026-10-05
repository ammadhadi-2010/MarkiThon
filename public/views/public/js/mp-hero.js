function mpHeroSlide(slide, index) {
    const title = slide.title || slide.alt || 'MarkiThon';
    const image = String(slide.image || '').replace(/["'()\\]/g, '');
    return `<article class="mp-slide${index === 0 ? ' on' : ''}" style="background-image:url('${image}')" aria-label="${title}" data-title="${title}" data-text="${slide.text || ''}" data-cta="${slide.cta || 'Shop Now'}" data-href="${slide.href || '/#shops'}"></article>`;
}

function mpHeroMarkup() {
    const first = MP_SLIDES[0] || {};
    const slides = MP_SLIDES.map(mpHeroSlide).join('');
    const dots = MP_SLIDES.map((_, i) =>
        `<button type="button" class="mp-dot${i === 0 ? ' on' : ''}" data-mpslide="${i}" aria-label="Slide ${i + 1}"></button>`
    ).join('');
    return `
    <section class="mp-hero" id="hero" data-index="0">
        <div class="mp-slider" id="mpSlider">${slides}</div>
        <div class="mp-hero-fade"></div>
        <div class="mp-hero-copy">
            <p class="mp-slide-brand"><span class="mp-mark">M</span><strong>MarkiThon</strong></p>
            <h1 id="mpHeroTitle">${first.title || 'Discover Products From Local Shops'}</h1>
            <p class="mp-lead" id="mpHeroLead">${first.text || ''}</p>
            <a class="mp-shop-now" id="mpHeroCta" href="${first.href || '/#shops'}">${first.cta || 'Shop Now'}</a>
            <form class="mp-search" autocomplete="off">
                <input id="mpHeroSearch" name="mpHeroSearch" placeholder="Search for products, shops, or categories..." autocomplete="off">
                <button type="submit" aria-label="Search">🔍</button>
            </form>
        </div>
        <p class="mp-hero-script">♡ Support<br>Local Shops ♡</p>
        <button type="button" class="mp-hero-arrow prev" id="mpHeroPrev" aria-label="Previous slide">‹</button>
        <button type="button" class="mp-hero-arrow next" id="mpHeroNext" aria-label="Next slide">›</button>
        <div class="mp-dots">${dots}</div>
    </section>`;
}

function mpHeroSync(hero) {
    const slides = [...hero.querySelectorAll('.mp-slide')];
    if (!slides.length) return;
    let index = Number(hero.dataset.index || 0);
    index = ((index % slides.length) + slides.length) % slides.length;
    hero.dataset.index = String(index);
    slides.forEach((el, i) => el.classList.toggle('on', i === index));
    hero.querySelectorAll('[data-mpslide]').forEach((el, i) => el.classList.toggle('on', i === index));
    const slide = slides[index];
    const title = hero.querySelector('#mpHeroTitle');
    const lead = hero.querySelector('#mpHeroLead');
    const cta = hero.querySelector('#mpHeroCta');
    if (title && slide.dataset.title) title.textContent = slide.dataset.title;
    if (lead) lead.textContent = slide.dataset.text || '';
    if (cta) {
        cta.textContent = slide.dataset.cta || 'Shop Now';
        cta.setAttribute('href', slide.dataset.href || '/#shops');
    }
}

function mpBindSlider(root) {
    const hero = root.querySelector('#hero');
    if (!hero || hero.dataset.bound) return;
    hero.dataset.bound = '1';
    hero.addEventListener('click', (event) => {
        const dot = event.target.closest('[data-mpslide]');
        if (dot) hero.dataset.index = dot.dataset.mpslide;
        else if (event.target.closest('#mpHeroPrev')) hero.dataset.index = String(Number(hero.dataset.index || 0) - 1);
        else if (event.target.closest('#mpHeroNext')) hero.dataset.index = String(Number(hero.dataset.index || 0) + 1);
        else return;
        mpHeroSync(hero);
    });
    setInterval(() => {
        if (!document.body.contains(hero)) return;
        hero.dataset.index = String(Number(hero.dataset.index || 0) + 1);
        mpHeroSync(hero);
    }, 6000);
}
