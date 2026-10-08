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

function sfDedupeProducts(list) {
    return Array.from(new Map(
        (Array.isArray(list) ? list : []).map((item) => {
            const title = String((item && (item.title || item.name)) || '').trim().toLowerCase();
            const sku = String((item && item.sku) || '').trim().toLowerCase();
            const id = item && (item.id || item.product_id || item.productId);
            const key = title || (sku ? 'sku:' + sku : String(id || Math.random()));
            return [key, item];
        })
    ).values());
}

function sfToast(message) {
    const el = document.getElementById('sfToast');
    el.textContent = message;
    el.classList.add('on');
    setTimeout(() => el.classList.remove('on'), 2200);
}

function paintSfBanner() {
    const slot = document.getElementById('sfBannerSlot');
    if (!slot) return;
    const html = typeof storefrontBannerMarkup === 'function' ? storefrontBannerMarkup(sfShop) : '';
    if (!html) {
        slot.innerHTML = '';
        slot.hidden = true;
        return;
    }
    slot.innerHTML = html;
    slot.hidden = false;
}

function renderSfGrid() {
    const filtered = sfProducts.filter((p) =>
        typeof matchSfProduct === 'function' ? matchSfProduct(p) : (sfCategory === 'All' || p.category === sfCategory)
    );
    const rows = sfDedupeProducts(filtered);
    const grid = document.getElementById('sfGrid');
    paintSfBanner();
    grid.innerHTML = rows.map(storefrontCardMarkup).join('')
        || '<p class="sf-empty">No products in this category yet.</p>';
}

function openWhatsAppOrder(product) {
    const phone = waDigits(sfShop && (sfShop.whatsappNumber || sfShop.phoneNumber));
    const parts = typeof sfCardPriceParts === 'function'
        ? sfCardPriceParts(product)
        : { finalPrice: Number(product.retailPrice || 0) };
    const price = Number(parts.finalPrice || 0).toLocaleString();
    const text = 'Hi, I want to buy ' + product.title + ' priced at Rs. ' + price + ' from your MarkiThon store.';
    if (!phone) return sfToast('WhatsApp number is not set for this shop.');
    window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
}

function sfWireShopBadgeAuth() {
    const badge = document.getElementById('sfShopBadge');
    if (!badge || badge.dataset.authBound === '1') return;
    badge.dataset.authBound = '1';
    const toggle = (event) => {
        if (event.target.closest('a.sf-social-ico, #mpAuthMenu, .mp-auth-menu a, .mp-auth-menu button')) return;
        event.preventDefault();
        event.stopPropagation();
        const loggedIn = typeof mpBuyer !== 'undefined' && mpBuyer;
        const vendor = (typeof mpIsVendorLoggedIn === 'function' && mpIsVendorLoggedIn())
            || (typeof mpHasVendorSession === 'function' && mpHasVendorSession());
        if (!loggedIn && !vendor) {
            if (typeof mpOpenAuth === 'function') mpOpenAuth('login');
            return;
        }
        if (typeof mpToggleProfileMenu === 'function') mpToggleProfileMenu();
        const menu = document.getElementById('mpAuthMenu');
        badge.setAttribute('aria-expanded', menu && !menu.hidden && menu.classList.contains('is-open') ? 'true' : 'false');
    };
    badge.addEventListener('click', toggle);
    badge.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') toggle(event);
    });
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
    sfProducts = sfDedupeProducts(data.products);
    sfCategory = readSfFilter();
    const cats = Array.isArray(data.navCategories)
        ? data.navCategories
        : [...new Set(sfProducts.map((p) => p.category).filter(Boolean))];
    document.title = (sfShop.shopName || 'Ammad Hadi Stor') + ' — MarkiThon';
    document.getElementById('sfRoot').innerHTML = storefrontMarkup(sfShop, cats);
    if (typeof applySfTheme === 'function') applySfTheme(sfShop);
    bindSfHero();
    if (typeof mpBindAuth === 'function') {
        Promise.resolve(mpBindAuth()).then(() => {
            if (typeof sfWireShopBadgeAuth === 'function') sfWireShopBadgeAuth();
        });
    }
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
