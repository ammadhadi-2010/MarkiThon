function mpRoute() {
    const parts = location.pathname.split('/').filter(Boolean);
    if (!parts.length) return { page: 'home' };
    if (parts[0] === 'contact' || parts[0] === 'blog') return { page: parts[0] };
    if (typeof mpIsLegal === 'function' && mpIsLegal(parts[0])) return { page: parts[0] };
    if (parts[0] === 'product' && parts[1]) return { page: 'product', id: parts[1] };
    if (parts[0] === 'profile' && parts[1] === 'orders') return { page: 'orders', id: parts[2] || '' };
    return { page: 'home' };
}

function mpHomeMarkup() {
    return mpHeroMarkup()
        + mpCategoriesMarkup()
        + mpTrendingMarkup()
        + mpPromoMarkup()
        + mpShopsMarkup()
        + mpHomeExtraMarkup();
}

function mpBindSearch(root) {
    const input = root.querySelector('#mpHeroSearch');
    root.querySelectorAll('[data-mpq]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (input) input.value = btn.getAttribute('data-mpq');
            input && input.focus();
        });
    });
    const searchBtn = root.querySelector('#mpSearchBtn');
    if (searchBtn && input) {
        searchBtn.addEventListener('click', () => {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
    const form = root.querySelector('.mp-search');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            window.location.href = '/#categories';
        });
    }
    const news = root.querySelector('.mp-news');
    if (news) {
        news.addEventListener('submit', (event) => {
            event.preventDefault();
            news.querySelector('button').textContent = 'Subscribed';
        });
    }
}

function mpRegisterServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
    mpRegisterServiceWorker();
    const route = mpRoute();
    const root = document.getElementById('mpRoot');
    let body = '';
    if (route.page === 'product') body = mpPdpSkeletonMarkup();
    else if (route.page === 'orders') body = '<section class="mp-block mp-page" id="mpOrdersPage"></section>';
    else if (route.page === 'home') body = mpHomeMarkup();
    else if (typeof mpIsLegal === 'function' && mpIsLegal(route.page)) body = mpLegalMarkup();
    else body = mpPagesMarkup(route.page);
    const chrome = route.page === 'product' && typeof mpPdpChromeMarkup === 'function'
        ? mpPdpChromeMarkup()
        : mpNavMarkup(route.page);
    root.innerHTML = chrome + body + mpFooterMarkup();
    if (typeof mpLoadFooter === 'function') mpLoadFooter();
    mpBindSearch(root);
    mpPaintCartBadge(root);
    if (typeof mpBindCartDrawer === 'function') mpBindCartDrawer(root);
    mpBindHearts(root);
    if (typeof mpBindAuth === 'function') mpBindAuth();
    const menuBtn = root.querySelector('#mpMenuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => root.querySelector('.mp-links').classList.toggle('open'));
    }
    if (route.page === 'home') mpBindCardLinks(root);
    if (route.page === 'home' && typeof mpBindSlider === 'function') mpBindSlider(root);
    if (route.page === 'home' && typeof mpLoadTrending === 'function') mpLoadTrending(root);
    if (route.page === 'home' && typeof mpBindQuotes === 'function') mpBindQuotes(root);
    if (route.page === 'home' && typeof mpLoadPromos === 'function') mpLoadPromos(root);
    if (route.page === 'contact') mpBindContact(root);
    if (typeof mpIsLegal === 'function' && mpIsLegal(route.page)) mpLoadLegal(route.page);
    if (route.page === 'product') mpOpenProduct(root, route.id);
    if (route.page === 'orders' && typeof mpMountOrders === 'function') mpMountOrders(route.id);
});

function mpBindCardLinks(root) {
    root.addEventListener('click', (event) => {
        if (event.target.closest('button, a, input, textarea')) return;
        const card = event.target.closest('[data-mpopen]');
        if (!card) return;
        window.location.href = '/product/' + card.getAttribute('data-mpopen');
    });
}
