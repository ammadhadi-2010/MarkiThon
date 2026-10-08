const fs = require('fs');
const path = require('path');
const { cleanHome } = require('./cmsHome');
const { cleanSeo } = require('./cmsSeo');
const { cleanFooter } = require('./cmsFooter');
const { cleanPages } = require('./cmsPages');

const file = path.join(__dirname, '../data/admin-cms.json');
const slides = [
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80'
];

function defaults() {
    return {
        online: true,
        domain: '',
        visitors: 0,
        updatedAt: '',
        banners: [
            { id: 'ban-fabrics', title: 'Premium Fabrics', text: 'For a better tomorrow', image: slides[0], link: '/#shops', shopId: '', cta: 'Shop Now', enabled: true },
            { id: 'ban-sale', title: 'Summer Sale', text: 'Selected styles on offer', image: slides[1], link: '/#trending', shopId: '', cta: 'Shop Now', enabled: true }
        ],
        featuredShopIds: [],
        featuredProductIds: [],
        featuredShopAdIds: [],
        promos: [
            { id: 'promo-1', title: 'Up To 40% OFF', text: 'On Selected Items', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?auto=format&fit=crop&w=400&q=80', link: '/#trending', shopId: '' },
            { id: 'promo-2', title: 'Home Essentials', text: 'Bedsheets • Blankets • Pillows', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=500&q=80', link: '/#categories', shopId: '' },
            { id: 'promo-3', title: 'Fresh Arrivals', text: 'New Styles • Latest Trends', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=500&q=80', link: '/#trending', shopId: '' }
        ],
        sections: { banners: true, shops: true, products: true },
        seo: { title: 'MarkiThon', description: 'Shop from verified local businesses on MarkiThon.' },
        activity: []
    };
}

function presentBanner(row) {
    return {
        ...row,
        shopId: row.shopId || '',
        cta: row.cta || 'Shop Now',
        link: row.link || ''
    };
}

function readCms() {
    try {
        const row = JSON.parse(fs.readFileSync(file, 'utf8'));
        const merged = { ...defaults(), ...row, sections: { ...defaults().sections, ...(row.sections || {}) }, seo: { ...defaults().seo, ...(row.seo || {}) } };
        merged.banners = (merged.banners || []).map(presentBanner);
        merged.promos = cleanPromos(row.promos);
        merged.home = cleanHome(row.home);
        merged.seo = cleanSeo(row.seo);
        merged.footer = cleanFooter(row.footer);
        merged.pages = cleanPages(row.pages);
        return merged;
    } catch (error) {
        const row = defaults();
        row.home = cleanHome();
        row.seo = cleanSeo(row.seo);
        row.footer = cleanFooter();
        row.pages = cleanPages();
        return row;
    }
}

function writeCms(row) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(row, null, 2));
}

function safeImage(value) {
    const url = String(value || '').trim();
    if (/^https?:\/\//i.test(url)) return url.slice(0, 300);
    if (/^\/uploads\/banners\/[a-z0-9._-]+$/i.test(url)) return url;
    return '';
}

function cleanLink(value) {
    const link = String(value || '').trim().slice(0, 160);
    if (link.startsWith('/') && !link.startsWith('//')) return link;
    if (/^https?:\/\//i.test(link)) return link;
    return '';
}

function cleanBanners(rows) {
    return (Array.isArray(rows) ? rows : []).slice(0, 6).map((row, index) => ({
        id: String(row.id || ('ban-' + (index + 1))).slice(0, 40),
        title: String(row.title || '').trim().slice(0, 80),
        text: String(row.text || '').trim().slice(0, 120),
        image: safeImage(row.image),
        link: cleanLink(row.link),
        shopId: String(row.shopId || '').trim().slice(0, 40),
        cta: String(row.cta || 'Shop Now').trim().slice(0, 24) || 'Shop Now',
        enabled: row.enabled !== false
    })).filter((row) => row.title.length >= 2);
}

function cleanPromos(rows) {
    const base = defaults().promos;
    const list = Array.isArray(rows) ? rows : base;
    return [0, 1, 2].map((index) => {
        const row = list[index] || {};
        const fallback = base[index];
        const title = String(row.title || '').trim().slice(0, 80);
        return {
            id: 'promo-' + (index + 1),
            title: title.length >= 2 ? title : fallback.title,
            text: String(row.text || '').trim().slice(0, 120),
            image: safeImage(row.image) || fallback.image,
            link: cleanLink(row.link),
            shopId: String(row.shopId || '').trim().slice(0, 40)
        };
    });
}

function cleanIds(rows) {
    return (Array.isArray(rows) ? rows : []).slice(0, 12).map((id) => String(id).slice(0, 80));
}

function updateCms(body) {
    const current = readCms();
    const next = { ...current };
    if (typeof body.online === 'boolean') next.online = body.online;
    if (body.domain != null) next.domain = String(body.domain).trim().slice(0, 80);
    if (Array.isArray(body.banners)) next.banners = cleanBanners(body.banners);
    if (Array.isArray(body.featuredShopIds)) next.featuredShopIds = cleanIds(body.featuredShopIds);
    if (Array.isArray(body.featuredProductIds)) next.featuredProductIds = cleanIds(body.featuredProductIds);
    if (Array.isArray(body.featuredShopAdIds)) next.featuredShopAdIds = cleanIds(body.featuredShopAdIds);
    if (Array.isArray(body.promos)) next.promos = cleanPromos(body.promos);
    if (body.sections) {
        next.sections = {
            banners: body.sections.banners !== false,
            shops: body.sections.shops !== false,
            products: body.sections.products !== false
        };
    }
    if (body.home && typeof body.home === 'object') {
        const prev = current.home || {};
        next.home = cleanHome({
            ...prev,
            ...body.home,
            benefits: body.home.benefits || prev.benefits,
            quotes: body.home.quotes || prev.quotes
        });
    }
    if (body.seo && typeof body.seo === 'object') next.seo = cleanSeo({ ...current.seo, ...body.seo });
    if (body.footer && typeof body.footer === 'object') next.footer = cleanFooter(body.footer);
    if (body.pages && typeof body.pages === 'object') next.pages = cleanPages({ ...(current.pages || {}), ...body.pages });
    next.updatedAt = new Date().toISOString();
    const note = String(body.note || 'Marketplace settings saved.').trim().slice(0, 120);
    next.activity = [{ text: note, at: next.updatedAt }].concat(current.activity || []).slice(0, 8);
    writeCms(next);
    return next;
}

function pickRows(rows, ids, limit) {
    const chosen = cleanIds(ids);
    if (!chosen.length) return rows.slice(0, limit);
    const set = new Set(chosen);
    return rows.filter((row) => set.has(String(row.id)));
}

/** Active shops for the homepage: curated order first, then remaining newest-first. */
function homeShopRows(rows, ids) {
    const active = (rows || []).filter((row) => row.status === 'Active');
    const chosen = cleanIds(ids);
    if (!chosen.length) return active;
    const set = new Set(chosen);
    const picked = chosen
        .map((id) => active.find((row) => String(row.id) === id))
        .filter(Boolean);
    const rest = active.filter((row) => !set.has(String(row.id)));
    return picked.concat(rest);
}

function writeBannerImage(body) {
    const match = String(body.data || '').match(/^data:image\/(png|jpeg|jpg|webp);base64,([a-z0-9+/=\s]+)$/i);
    if (!match) return '';
    const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
    if (!buffer.length || buffer.length > 2 * 1024 * 1024) return '';
    const kind = match[1].toLowerCase();
    const ext = kind === 'jpeg' ? 'jpg' : kind;
    const dir = path.join(__dirname, '../public/uploads/banners');
    const name = 'banner-' + Date.now() + '.' + ext;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buffer);
    return '/uploads/banners/' + name;
}

module.exports = { readCms, updateCms, pickRows, homeShopRows, writeBannerImage };
