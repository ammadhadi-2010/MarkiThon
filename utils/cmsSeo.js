function seoDefaults() {
    return {
        title: 'MarkiThon',
        description: 'Shop from verified local businesses on MarkiThon.',
        keywords: 'MarkiThon, local shops, marketplace, Ammad Hadi Stor',
        canonical: '',
        index: true,
        follow: true,
        siteName: 'MarkiThon',
        ogTitle: '',
        ogDescription: '',
        ogImage: ''
    };
}

function clip(value, fallback, max) {
    const text = String(value == null ? '' : value).trim().slice(0, max);
    return text || fallback;
}

function cleanSeo(row) {
    const base = seoDefaults();
    const src = row && typeof row === 'object' ? row : base;
    const image = String(src.ogImage || '').trim();
    const safeImage = /^https?:\/\//i.test(image) || /^\/uploads\/banners\/[a-z0-9._-]+$/i.test(image) ? image.slice(0, 300) : '';
    const canonical = String(src.canonical || '').trim();
    const safeCanon = /^https?:\/\//i.test(canonical) ? canonical.slice(0, 180) : '';
    return {
        title: clip(src.title, base.title, 70),
        description: clip(src.description, base.description, 180),
        keywords: clip(src.keywords, base.keywords, 180),
        canonical: safeCanon,
        index: src.index !== false,
        follow: src.follow !== false,
        siteName: clip(src.siteName, base.siteName, 40),
        ogTitle: String(src.ogTitle || '').trim().slice(0, 70),
        ogDescription: String(src.ogDescription || '').trim().slice(0, 180),
        ogImage: safeImage
    };
}

module.exports = { seoDefaults, cleanSeo };
