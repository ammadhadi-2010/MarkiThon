const PAGES = [
    ['about', 'About MarkiThon', '/about', 'MarkiThon is Pakistan\'s fabric and clothing marketplace. We connect shoppers with verified local shops without replacing each seller\'s own storefront.\n\nBrowse new arrivals, seasonal offers and best sellers from one marketplace, then complete checkout with confidence.'],
    ['mission', 'Our Mission', '/mission', 'Our mission is to help people shop from verified local businesses. Each seller keeps their own shop, and MarkiThon brings those shops together in one place.'],
    ['careers', 'Careers', '/careers', 'We look for people who care about local shops. Use Contact Us and tell us the role you want.'],
    ['terms', 'Terms & Conditions', '/terms', 'Using MarkiThon means you shop with verified sellers. Orders, prices, and delivery follow the shop you buy from.\n\nPlease read Delivery Information and Returns & Exchange before you place an order.'],
    ['privacy', 'Privacy Policy', '/privacy', 'MarkiThon keeps the account and order details needed to run the marketplace. We do not sell personal information.'],
    ['faqs', 'FAQs', '/faqs', 'Sign in and open Order Tracking to see an order.\n\n- Delivery times depend on the shop.\n- Returns follow the Returns & Exchange page.\n- Contact Support if a shop does not reply.'],
    ['delivery', 'Delivery Information', '/delivery', 'Each shop sets its own delivery window. Your order shows the shop name and the items that shop is sending.'],
    ['returns', 'Returns & Exchange', '/returns', 'Start a return with the shop that sold the item. Contact Support if that shop does not respond.']
];

function pageCatalog() {
    return PAGES.map(([id, title, path, body]) => ({ id, title, path, body }));
}

function clip(value, fallback, max) {
    if (value == null) return fallback;
    const text = String(value).replace(/\r/g, '').trim().slice(0, max);
    return text || fallback;
}

function cleanPages(row) {
    const src = row && typeof row === 'object' ? row : {};
    const pages = {};
    pageCatalog().forEach((page) => {
        const next = src[page.id] || {};
        pages[page.id] = {
            id: page.id,
            title: clip(next.title, page.title, 80),
            path: page.path,
            body: clip(next.body, page.body, 4000)
        };
    });
    return pages;
}

function pagePatch(body) {
    const id = String((body && body.id) || '').slice(0, 40);
    if (!pageCatalog().some((page) => page.id === id)) {
        const error = new Error('Choose a page from the list.');
        error.status = 400;
        throw error;
    }
    return { [id]: { title: body.title, body: body.body } };
}

module.exports = { pageCatalog, cleanPages, pagePatch };
