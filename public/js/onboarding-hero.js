let obHeroIndex = 0;
let obHeroTimer = null;

function paintObHeroSlide(index, url) {
    const img = document.getElementById('obBan' + index + 'Stage');
    const empty = document.getElementById('obBan' + index + 'Empty');
    if (img && url) {
        img.src = url;
        img.hidden = false;
        if (empty) empty.hidden = true;
    } else if (img) {
        img.removeAttribute('src');
        img.hidden = true;
        if (empty) empty.hidden = false;
    }
}

function showObHero(index) {
    obHeroIndex = ((index % 3) + 3) % 3;
    document.querySelectorAll('[data-obslide]').forEach((slide) => {
        slide.classList.toggle('on', Number(slide.dataset.obslide) === obHeroIndex);
    });
    document.querySelectorAll('[data-obdot]').forEach((dot) => {
        dot.classList.toggle('on', Number(dot.dataset.obdot) === obHeroIndex);
    });
}

function startObHeroTimer() {
    clearInterval(obHeroTimer);
    obHeroTimer = setInterval(() => showObHero(obHeroIndex + 1), 4200);
}

function bindObHero() {
    const stage = document.getElementById('obHeroStage');
    const prev = document.getElementById('obHeroPrev');
    const next = document.getElementById('obHeroNext');
    const dots = document.getElementById('obHeroDots');
    if (!stage || stage.dataset.bound) return;
    stage.dataset.bound = '1';
    if (prev) prev.addEventListener('click', () => {
        showObHero(obHeroIndex - 1);
        startObHeroTimer();
    });
    if (next) next.addEventListener('click', () => {
        showObHero(obHeroIndex + 1);
        startObHeroTimer();
    });
    if (dots) dots.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-obdot]');
        if (!btn) return;
        showObHero(Number(btn.dataset.obdot));
        startObHeroTimer();
    });
    stage.addEventListener('mouseenter', () => clearInterval(obHeroTimer));
    stage.addEventListener('mouseleave', startObHeroTimer);
    startObHeroTimer();
}
