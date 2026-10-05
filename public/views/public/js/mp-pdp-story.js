const MP_SHEET_BODY = 'Our Premium Cotton Bed Sheet Set is designed for ultimate comfort and style. Made from high-quality cotton fabric, it offers a soft touch, breathability and long-lasting durability. Perfect for everyday use, this set adds a fresh and elegant look to your bedroom.';
const MP_DEFAULT_FEATURES = [
    { label: '100% Pure Cotton', icon: 'cotton' },
    { label: 'Breathable Fabric', icon: 'wind' },
    { label: 'Fade Resistant', icon: 'sun' },
    { label: 'Easy to Wash', icon: 'wash' }
];
const MP_DEFAULT_INCLUDES = [
    '1 x Bed Sheet',
    '2 x Pillow Covers (Single)',
    '2 x Pillow Covers (Double/Queen/King)'
];
const MP_DEFAULT_CARE = [
    { label: 'Machine wash cold', icon: 'machine' },
    { label: 'Use mild detergent', icon: 'bottle' },
    { label: 'Do not bleach', icon: 'bleach' },
    { label: 'Tumble dry low', icon: 'dry' }
];

function mpSvg(body) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${body}</svg>`;
}

const MP_ICON = {
    cotton: mpSvg('<path d="M12 3c2 3 2 5 0 7-2-2-2-4 0-7z"/><path d="M7 9c-3 1-4 4-2 6 3 1 5-1 7-3"/><path d="M17 9c3 1 4 4 2 6-3 1-5-1-7-3"/><path d="M12 14v7"/>'),
    wind: mpSvg('<path d="M4 8h10a3 3 0 1 0-3-3"/><path d="M4 12h14a3 3 0 1 1-3 3"/><path d="M4 16h8"/>'),
    sun: mpSvg('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6"/>'),
    wash: mpSvg('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
    shield: mpSvg('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/>'),
    star: mpSvg('<path d="M12 3.5l2.1 5.2H20l-4.4 3.3 1.7 5.4L12 15.8 6.7 17.4 8.4 12 4 8.7h5.9z"/>'),
    machine: mpSvg('<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="3.4"/><path d="M8 6.5h.01M11 6.5h5"/>'),
    bottle: mpSvg('<path d="M10 3h4v2.5l2 2V21H8V7.5l2-2V3z"/><path d="M9 12h6"/>'),
    bleach: mpSvg('<circle cx="12" cy="12" r="8"/><path d="M7.2 16.8L16.8 7.2"/>'),
    dry: mpSvg('<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="3.4"/><path d="M12 11.2V13l1.4 1"/>')
};

function mpIcon(name) {
    return MP_ICON[name] || MP_ICON.cotton;
}

function mpStory(row) {
    const savedBody = String(row.descBody || row.desc || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return {
        headline: row.descHeadline || 'Bring Comfort and Elegance to Your Bedroom',
        body: savedBody || MP_SHEET_BODY,
        features: row.features && row.features.length ? row.features : MP_DEFAULT_FEATURES,
        includes: row.includes && row.includes.length ? row.includes : MP_DEFAULT_INCLUDES,
        care: row.care && row.care.length ? row.care : MP_DEFAULT_CARE
    };
}

function mpDescPanel(row) {
    const story = mpStory(row);
    const images = Array.isArray(row.images) ? row.images : [];
    const photo = images[1] || images[0] || row.imageUrl || '';
    const shot = photo ? `<img src="${mpEscape(photo)}" alt="${mpEscape(row.title || 'Product lifestyle')}">` : '';
    const features = story.features.map((item) =>
        `<li><span class="mp-feat-ico">${mpIcon(item.icon)}</span>${mpEscape(item.label)}</li>`
    ).join('');
    const includes = story.includes.map((item) =>
        `<li><span aria-hidden="true">✓</span>${mpEscape(item)}</li>`
    ).join('');
    const care = story.care.map((item) =>
        `<li>${mpIcon(item.icon)}${mpEscape(item.label)}</li>`
    ).join('');
    return `
        <article class="mp-panel">
            <h3>${mpEscape(story.headline)}</h3>
            <p>${mpEscape(story.body)}</p>
            <ul class="mp-feats">${features}</ul>
        </article>
        <article class="mp-panel">
            <h3>Set Includes</h3>
            <ul class="mp-checks mp-includes">${includes}</ul>
            <h3>Care Instructions</h3>
            <ul class="mp-care">${care}</ul>
        </article>
        <article class="mp-life">${shot}<p><span>Soft</span><span>Stylish</span><span>Comfortable</span></p></article>`;
}
