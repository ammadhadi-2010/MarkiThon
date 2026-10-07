let sfShop = null;
let sfProducts = [];
let sfCategory = 'All';

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function waDigits(phone) {
    let digits = String(phone || '').replace(/\D/g, '');
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('0')) digits = '92' + digits.slice(1);
    return digits;
}

function sfToast(message) {
    const el = document.getElementById('sfToast');
    el.textContent = message;
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 2200);
}

function sfGridCols() {
    const grid = document.getElementById('sfGrid');
    if (!grid) return 1;
    const tracks = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean);
    return Math.max(1, tracks.length);
}

function paintSfBanner(cardsHtml) {
    const top = document.getElementById('sfGridTop');
    const slot = document.getElementById('sfBannerSlot');
    const grid = document.getElementById('sfGrid');
    const html = typeof storefrontBannerMarkup === 'function' ? storefrontBannerMarkup(sfShop) : '';
    if (!top || !slot || !grid) return;
    if (!html) {
        top.innerHTML = '';
        top.hidden = true;
        slot.innerHTML = '';
        slot.hidden = true;
        return;
    }
    const cols = sfGridCols();
    const cards = cardsHtml || [];
    const split = Math.min(Math.max(cols, 1), cards.length);
    top.innerHTML = cards.slice(0, split).join('');
    top.hidden = !split;
    slot.innerHTML = html;
    slot.hidden = false;
    grid.innerHTML = cards.slice(split).join('')
        || (split ? '' : '<p class="sf-empty">No products in this category yet.</p>');
}

function renderSfGrid() {
    const rows = sfProducts.filter((p) =>
        typeof matchSfProduct === 'function' ? matchSfProduct(p) : (sfCategory === 'All' || p.category === sfCategory)
    );
    const grid = document.getElementById('sfGrid');
    const cards = rows.map(storefrontCardMarkup);
    grid.innerHTML = cards.join('')
        || '<p class="sf-empty">No products in this category yet.</p>';
    paintSfBanner(cards);
}

function openWhatsAppOrder(product) {
    const phone = waDigits(sfShop && (sfShop.whatsappNumber || sfShop.phoneNumber));
    const price = Number(product.retailPrice || 0).toLocaleString();
    const text = 'Hi, I want to buy ' + product.title + ' priced at Rs. ' + price + ' from your MarkiThon store.';
    if (!phone) return sfToast('WhatsApp number is not set for this shop.');
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

function bindSfHero() {
    const root = document.getElementById('sfHero');
    if (!root || root.dataset.bound === '1') return;
    const slides = [...root.querySelectorAll('.sf-slide')];
    const dots = [...root.querySelectorAll('[data-sfslide]')];
    if (slides.length < 2) return;
    root.dataset.bound = '1';
    let index = 0;
    function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach((el, i) => el.classList.toggle('on', i === index));
        dots.forEach((el, i) => el.classList.toggle('on', i === index));
    }
    root.addEventListener('click', (event) => {
        const dir = event.target.closest('[data-sfdir]');
        const dot = event.target.closest('[data-sfslide]');
        if (dir) show(index + Number(dir.getAttribute('data-sfdir')));
        if (dot) show(Number(dot.getAttribute('data-sfslide')));
    });
    setInterval(() => show(index + 1), 6000);
}

function readSfFilter() {
    const query = new URLSearchParams(location.search).get('filter');
    if (query) return query;
    const hash = location.hash.replace('#', '');
    return hash || 'All';
}

async function loadStorefront() {
    const parts = location.pathname.split('/').filter(Boolean);
    const slug = (parts[0] === 'store' ? parts[1] : parts[0]) || 'ammadhadistor';
    const res = await fetch('/api/store/' + encodeURIComponent(slug));
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Store not found.');
    sfShop = data.shop;
    sfProducts = Array.isArray(data.products) ? data.products : [];
    sfCategory = readSfFilter();
    const cats = Array.isArray(data.navCategories)
        ? data.navCategories
        : [...new Set(sfProducts.map((p) => p.category).filter(Boolean))];
    document.title = (sfShop.shopName || 'Ammad Hadi Stor') + ' — MarkiThon';
    document.getElementById('sfRoot').innerHTML = storefrontMarkup(sfShop, cats);
    if (typeof applySfTheme === 'function') applySfTheme(sfShop);
    bindSfHero();
    if (typeof mpBindAuth === 'function') mpBindAuth();
    document.querySelectorAll('.sf-chip').forEach((btn) => {
        btn.classList.toggle('on', btn.getAttribute('data-sfcat') === sfCategory
            || (sfCategory === 'All' && btn.getAttribute('data-sfcat') === 'All'));
    });
    renderSfGrid();
    if (!window.sfBannerResizeBound) {
        window.sfBannerResizeBound = true;
        window.addEventListener('resize', () => renderSfGrid());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadStorefront().catch((err) => {
        document.getElementById('sfRoot').innerHTML = '<p class="sf-empty">' + escapeHtml(err.message) + '</p>';
    });
    document.getElementById('sfRoot').addEventListener('click', (event) => {
        const banner = event.target.closest('[data-sfbanner]');
        if (banner) {
            const link = banner.getAttribute('data-sfbanner') || 'All';
            sfCategory = link === 'home' ? 'All' : link;
            document.querySelectorAll('.sf-chip').forEach((btn) => {
                btn.classList.toggle('on', btn.getAttribute('data-sfcat') === sfCategory
                    || (sfCategory === 'All' && btn.getAttribute('data-sfcat') === 'All'));
            });
            document.getElementById('sfGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            renderSfGrid();
        }
        const chip = event.target.closest('[data-sfcat]');
        if (chip) {
            sfCategory = chip.getAttribute('data-sfcat');
            document.querySelectorAll('.sf-chip').forEach((btn) => {
                btn.classList.toggle('on', btn.getAttribute('data-sfcat') === sfCategory);
            });
            renderSfGrid();
        }
        const card = event.target.closest('[data-sfopen]');
        if (card && !event.target.closest('button, a')) {
            window.location.href = '/product/' + card.getAttribute('data-sfopen');
            return;
        }
        const wa = event.target.closest('[data-sfwa]');
        if (!wa) return;
        const product = sfProducts.find((p) => String(p.id) === String(wa.getAttribute('data-sfwa')));
        if (product) openWhatsAppOrder(product);
    });
});
