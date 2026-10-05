function mpBannerHref(row, shops) {
    const shop = (shops || []).find((item) => String(item.id) === String(row.shopId || ''));
    if (shop && typeof shop.path === 'string' && shop.path.startsWith('/')) return shop.path;
    const link = String(row.link || '');
    if (link.startsWith('/') || /^https?:\/\//i.test(link)) return link;
    return '/#shops';
}

function mpSafeImage(image) {
    const url = String(image || '').trim();
    if (/^https?:\/\//i.test(url)) return url.replace(/["\\]/g, '');
    if (/^\/uploads\/[a-z0-9./_-]+$/i.test(url)) return url;
    return '';
}

function mpFillSlides(banners, shops) {
    const hero = document.getElementById('hero');
    const slider = document.getElementById('mpSlider');
    const dots = hero && hero.querySelector('.mp-dots');
    if (!hero || !slider || !banners.length) return;
    slider.textContent = '';
    banners.forEach((row, index) => {
        const article = document.createElement('article');
        const image = mpSafeImage(row.image);
        article.className = 'mp-slide' + (index === 0 ? ' on' : '');
        if (image) article.style.backgroundImage = 'url("' + image + '")';
        article.dataset.title = row.title || 'MarkiThon';
        article.dataset.text = row.text || '';
        article.dataset.cta = row.cta || 'Shop Now';
        article.dataset.href = mpBannerHref(row, shops);
        article.setAttribute('aria-label', article.dataset.title);
        slider.appendChild(article);
    });
    if (dots) {
        dots.textContent = '';
        banners.forEach((_, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'mp-dot' + (index === 0 ? ' on' : '');
            button.dataset.mpslide = String(index);
            button.setAttribute('aria-label', 'Slide ' + (index + 1));
            dots.appendChild(button);
        });
    }
    hero.dataset.index = '0';
    if (typeof mpHeroSync === 'function') mpHeroSync(hero);
}

function mpApplyCms(payload) {
    const cms = payload.cms || {};
    const sections = cms.sections || {};
    if (typeof mpApplySeo === 'function') mpApplySeo(cms.seo || {});
    else if (cms.seo && cms.seo.title) document.title = cms.seo.title;
    if (sections.shops === false) {
        const shops = document.getElementById('shops');
        if (shops) shops.hidden = true;
    }
    if (sections.products === false) {
        const products = document.getElementById('trending');
        if (products) products.hidden = true;
    }
    if (typeof mpPaintCmsPromos === 'function' && Array.isArray(cms.promos) && cms.promos.length) {
        mpPaintCmsPromos(cms.promos.slice(0, 3).map((row, index) => {
            const fallback = (typeof MP_DEFAULT_PROMOS !== 'undefined' && MP_DEFAULT_PROMOS[index])
                ? MP_DEFAULT_PROMOS[index].image
                : '';
            return {
                title: row.title,
                text: row.text,
                href: mpBannerHref(row, payload.shops),
                image: mpSafeImage(row.image) || fallback
            };
        }));
    }
    if (typeof mpRememberFeaturedAds === 'function') mpRememberFeaturedAds(cms.featuredShopAdIds || []);
    if (typeof mpRememberFeaturedProducts === 'function') {
        mpRememberFeaturedProducts(cms.featuredProductIds || []);
    }
    if (typeof mpPaintFeaturedShops === 'function') {
        mpPaintFeaturedShops(payload.featuredShops || payload.shops || []);
    }
    if (typeof mpApplyHome === 'function') mpApplyHome(cms);
    const banners = (cms.banners || []).filter((row) => row.enabled);
    if (sections.banners !== false && banners.length) mpFillSlides(banners, payload.shops);
    if (cms.online === false && !document.getElementById('mpCmsOff')) {
        const bar = document.createElement('p');
        bar.id = 'mpCmsOff';
        bar.textContent = 'This marketplace website is offline.';
        bar.style.cssText = 'margin:0;padding:12px 16px;background:#161f36;color:#f8fafc;text-align:center;';
        document.body.prepend(bar);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/admin/cms').then((response) => response.json()).then(mpApplyCms).catch(() => {});
});
