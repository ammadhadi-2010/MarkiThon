let mpPromoLocked = false;

const MP_DEFAULT_PROMOS = [
    {
        title: 'Up To 40% OFF',
        text: 'On Selected Items',
        href: '/#trending',
        image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&w=400&q=80',
        theme: 'red'
    },
    {
        title: 'Home Essentials',
        text: 'Bedsheets • Blankets • Pillows',
        href: '/#categories',
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=500&q=80',
        theme: 'glass'
    },
    {
        title: 'Fresh Arrivals',
        text: 'New Styles • Latest Trends',
        href: '/#trending',
        image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=500&q=80',
        theme: 'blue'
    }
];

function mpPromoTitle(row) {
    if (row.percent) return 'Up to ' + row.percent + '% OFF';
    return row.headline || 'Shop Offer';
}

function mpMergedPromos(campaigns) {
    const themes = ['red', 'glass', 'blue'];
    const live = (campaigns || []).slice(0, 3).map((row, i) => ({
        title: mpPromoTitle(row),
        text: row.shopName || 'Verified Shop',
        href: row.href,
        image: row.imageUrl || MP_DEFAULT_PROMOS[i].image,
        theme: themes[i]
    }));
    return live.concat(MP_DEFAULT_PROMOS.slice(live.length)).slice(0, 3);
}

function mpPromoCard(row) {
    const fallback = MP_DEFAULT_PROMOS[0].image;
    const image = row.image || fallback;
    return `<a class="mp-promo ${row.theme}" href="${mpEscape(row.href)}">
            <div>
                <h3>${mpEscape(row.title)}</h3>
                <p>${mpEscape(row.text)}</p>
                <span>Shop Now</span>
            </div>
            <img src="${mpEscape(image)}" alt="" loading="lazy"
                onerror="this.onerror=null;this.src='${fallback}'">
        </a>`;
}

function mpPromoCardsMarkup(campaigns) {
    return mpMergedPromos(campaigns).map(mpPromoCard).join('');
}

function mpPaintCmsPromos(rows) {
    mpPromoLocked = true;
    if (typeof mpJoinCmsPromos === 'function') mpJoinCmsPromos(rows || []);
}

function mpPromoMarkup() {
    const cards = `<div class="mp-promo-set">${mpPromoCardsMarkup([])}</div>`;
    return `<section class="mp-block" id="mpPromos"><div class="mp-promo-view"><div class="mp-promos">${cards}</div></div></section>`;
}

function mpSyncPromoLoop(slot) {
    const track = slot.querySelector('.mp-promos');
    if (!track) return;
    const narrow = window.matchMedia('(max-width: 760px)').matches;
    let sets = [...track.querySelectorAll('.mp-promo-set')];
    const count = sets[0] ? sets[0].querySelectorAll('.mp-promo').length : 0;
    const loop = narrow || count > 3;
    if (loop && sets.length === 1) track.appendChild(sets[0].cloneNode(true));
    if (!loop) sets.slice(1).forEach((node) => node.remove());
    sets = [...track.querySelectorAll('.mp-promo-set')];
    const looping = loop && sets.length > 1;
    track.classList.toggle('is-loop', looping && narrow);
    track.classList.toggle('is-run', looping && !narrow);
    const view = slot.querySelector('.mp-promo-view');
    if (view) view.classList.toggle('is-run', looping && !narrow);
}

function mpBindPromoLoop(root) {
    if (root.dataset.promoLoop) return;
    root.dataset.promoLoop = '1';
    const query = window.matchMedia('(max-width: 760px)');
    const sync = () => {
        const slot = root.querySelector('#mpPromos');
        if (slot) mpSyncPromoLoop(slot);
    };
    if (query.addEventListener) query.addEventListener('change', sync);
    else query.addListener(sync);
}

async function mpLoadPromos(root) {
    const slot = root.querySelector('#mpPromos');
    if (!slot) return;
    mpBindPromoLoop(root);
    let campaigns = [];
    try {
        const res = await fetch('/api/store/campaigns');
        const data = await res.json();
        campaigns = Array.isArray(data.campaigns) ? data.campaigns : [];
    } catch (error) {
        campaigns = [];
    }
    if (typeof mpRememberCampaigns === 'function') mpRememberCampaigns(campaigns);
    if (mpPromoLocked) return;
    const track = slot.querySelector('.mp-promos');
    track.innerHTML = `<div class="mp-promo-set">${mpPromoCardsMarkup(campaigns)}</div>`;
    mpSyncPromoLoop(slot);
}
