const SOCIAL = [
    ['facebook', 'Facebook', 'f', '/about'],
    ['instagram', 'Instagram', 'ig', '/about'],
    ['youtube', 'YouTube', 'yt', '/about'],
    ['tiktok', 'TikTok', 'tk', '/about']
];

const GROUPS = [
    ['company', 'Company', [
        ['about', 'About MarkiThon', '/about'],
        ['mission', 'Our Mission', '/mission'],
        ['careers', 'Careers', '/careers'],
        ['contact', 'Contact Us', '/contact'],
        ['become', 'Become a Shopkeeper', '/settings'],
        ['terms', 'Terms & Conditions', '/terms']
    ]],
    ['support', 'Help & Support', [
        ['faqs', 'FAQs', '/faqs'],
        ['delivery', 'Delivery Information', '/delivery'],
        ['returns', 'Returns & Exchange', '/returns'],
        ['tracking', 'Order Tracking', '/profile/orders'],
        ['support', 'Contact Support', '/contact']
    ]],
    ['shopkeepers', 'For Shopkeepers', [
        ['open', 'Store Settings', '/settings'],
        ['login', 'Login', '/vendor/login'],
        ['register', 'Dashboard', '/dashboard'],
        ['pricing', 'Pricing', '/about']
    ]]
];

function footerDefaults() {
    return {
        tagline: 'Local shops. Global vibes.',
        copyright: '© 2026 MarkiThon. All rights reserved.',
        vibe: 'Local Shops. Global Vibes.',
        social: SOCIAL.map(([id, name, mark, href]) => ({ id, name, mark, href })),
        groups: GROUPS.map(([id, title, links]) => ({
            id,
            title,
            links: links.map(([key, label, href]) => ({ id: key, label, href }))
        })),
        apps: { title: 'Download Our App', note: 'Coming Soon', google: '', apple: '' }
    };
}

function cleanHref(value, fallback) {
    const link = String(value || '').trim().slice(0, 180);
    if (link.startsWith('/') && !link.startsWith('//')) return link;
    if (/^https?:\/\//i.test(link)) return link;
    return fallback;
}

function cleanFooter(row) {
    const base = footerDefaults();
    const src = row && typeof row === 'object' ? row : {};
    const social = new Map((src.social || []).map((item) => [item.id, item]));
    const groups = new Map((src.groups || []).map((item) => [item.id, item]));
    base.social = base.social.map((item) => {
        const next = social.get(item.id);
        return { ...item, href: cleanHref(next && next.href, item.href) };
    });
    base.groups = base.groups.map((group) => {
        const incoming = groups.get(group.id);
        const links = new Map(((incoming && incoming.links) || []).map((item) => [item.id, item]));
        return {
            ...group,
            links: group.links.map((link) => {
                const next = links.get(link.id);
                return { ...link, href: cleanHref(next && next.href, link.href) };
            })
        };
    });
    const apps = src.apps || {};
    base.apps.google = cleanHref(apps.google, '');
    base.apps.apple = cleanHref(apps.apple, '');
    return base;
}

module.exports = { footerDefaults, cleanFooter };
