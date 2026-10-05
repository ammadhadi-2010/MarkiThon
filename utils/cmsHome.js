const KEYS = ['categories', 'why', 'reviews', 'newsletter', 'offers', 'recent'];

function homeDefaults() {
    return {
        categories: true,
        why: true,
        reviews: true,
        newsletter: true,
        offers: true,
        recent: true,
        categoriesLabel: 'Explore Categories',
        whyTitle: 'Why Shop With MarkiThon?',
        reviewsTitle: 'What Our Customers Say',
        newsTitle: 'Stay Updated',
        newsText: 'Get the latest products, offers and shop updates directly to your inbox.',
        offersLabel: 'Special Offers',
        recentLabel: 'Recently Viewed',
        benefits: [
            { title: 'Verified Shops', text: 'Trusted and approved local businesses' },
            { title: 'Wide Selection', text: 'Fashion, home, beauty, electronics and more' },
            { title: 'Direct Shopping', text: 'Deal directly with shop owners' },
            { title: 'Reliable Ordering', text: 'Track your orders and shop with confidence' }
        ],
        quotes: [
            { name: 'Ayesha Khan', text: 'Amazing experience! The quality is great and delivery was on time. Highly recommended.', stars: '4.9' },
            { name: 'Usman Raza', text: 'Finally a platform that supports local shops. Love the variety and prices.', stars: '5.0' },
            { name: 'Fatima S.', text: 'The best online shopping experience I\'ve had in Pakistan. Keep it up!', stars: '4.8' },
            { name: 'Ali Ahmed', text: 'Easy to use, great products and excellent customer support.', stars: '4.7' }
        ]
    };
}

function clip(value, fallback, max) {
    const text = String(value == null ? '' : value).trim().slice(0, max);
    return text || fallback;
}

function cleanHome(row) {
    const base = homeDefaults();
    const src = row && typeof row === 'object' ? row : base;
    const next = {};
    KEYS.forEach((key) => { next[key] = src[key] !== false; });
    next.categoriesLabel = clip(src.categoriesLabel, base.categoriesLabel, 60);
    next.whyTitle = clip(src.whyTitle, base.whyTitle, 80);
    next.reviewsTitle = clip(src.reviewsTitle, base.reviewsTitle, 80);
    next.newsTitle = clip(src.newsTitle, base.newsTitle, 60);
    next.newsText = clip(src.newsText, base.newsText, 160);
    next.offersLabel = clip(src.offersLabel, base.offersLabel, 60);
    next.recentLabel = clip(src.recentLabel, base.recentLabel, 60);
    next.benefits = [0, 1, 2, 3].map((index) => {
        const item = (src.benefits || [])[index] || base.benefits[index];
        return {
            title: clip(item.title, base.benefits[index].title, 40),
            text: clip(item.text, base.benefits[index].text, 90)
        };
    });
    next.quotes = [0, 1, 2, 3].map((index) => {
        const item = (src.quotes || [])[index] || base.quotes[index];
        return {
            name: clip(item.name, base.quotes[index].name, 40),
            text: clip(item.text, base.quotes[index].text, 180),
            stars: clip(item.stars, base.quotes[index].stars, 4)
        };
    });
    return next;
}

module.exports = { homeDefaults, cleanHome };
