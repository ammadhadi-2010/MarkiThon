const MP_SHEET_BODY = 'A reliable everyday product designed for quality, durability, and easy use. Check the specifications and package list below for full details.';
const MP_DEFAULT_FEATURES = [
    { label: 'Durable build', icon: 'shield' },
    { label: 'Ready to use', icon: 'bolt' },
    { label: 'Quality checked', icon: 'check' },
    { label: 'Everyday value', icon: 'star' }
];
const MP_DEFAULT_INCLUDES = [
    '1 x Main product',
    '1 x User guide',
    '1 x Warranty card'
];
const MP_DEFAULT_CARE = [
    { label: 'Handle with care', icon: 'note' },
    { label: 'Avoid moisture', icon: 'alert' },
    { label: 'Store in a dry place', icon: 'info' },
    { label: 'Follow package notes', icon: 'heart' }
];

function mpSvg(body) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${body}</svg>`;
}

const MP_ICON = {
    bolt: mpSvg('<path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z"/>'),
    check: mpSvg('<circle cx="12" cy="12" r="8"/><path d="M8.5 12.5l2.2 2.2 4.8-5"/>'),
    shield: mpSvg('<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/>'),
    star: mpSvg('<path d="M12 3.5l2.1 5.2H20l-4.4 3.3 1.7 5.4L12 15.8 6.7 17.4 8.4 12 4 8.7h5.9z"/>'),
    box: mpSvg('<path d="M3 8l9-5 9 5v9l-9 5-9-5V8z"/><path d="M3 8l9 5 9-5M12 13v9"/>'),
    tag: mpSvg('<path d="M3 12l9-9h7v7l-9 9-7-7z"/><circle cx="16.5" cy="7.5" r="1.2"/>'),
    note: mpSvg('<path d="M6 3h9l4 4v14H6V3z"/><path d="M15 3v4h4M8 11h8M8 15h6"/>'),
    info: mpSvg('<circle cx="12" cy="12" r="8"/><path d="M12 10v6M12 7h.01"/>'),
    alert: mpSvg('<path d="M12 4l9 16H3L12 4z"/><path d="M12 10v4M12 17h.01"/>'),
    heart: mpSvg('<path d="M12 20s-7-4.3-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.7 12 20 12 20z"/>'),
    cotton: mpSvg('<path d="M12 3c2 3 2 5 0 7-2-2-2-4 0-7z"/><path d="M7 9c-3 1-4 4-2 6 3 1 5-1 7-3"/><path d="M17 9c3 1 4 4 2 6-3 1-5-1-7-3"/><path d="M12 14v7"/>'),
    wind: mpSvg('<path d="M4 8h10a3 3 0 1 0-3-3"/><path d="M4 12h14a3 3 0 1 1-3 3"/><path d="M4 16h8"/>'),
    sun: mpSvg('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6"/>'),
    wash: mpSvg('<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>'),
    machine: mpSvg('<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="3.4"/><path d="M8 6.5h.01M11 6.5h5"/>'),
    bottle: mpSvg('<path d="M10 3h4v2.5l2 2V21H8V7.5l2-2V3z"/><path d="M9 12h6"/>'),
    bleach: mpSvg('<circle cx="12" cy="12" r="8"/><path d="M7.2 16.8L16.8 7.2"/>'),
    dry: mpSvg('<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="3.4"/><path d="M12 11.2V13l1.4 1"/>')
};

function mpIcon(name) {
    return MP_ICON[name] || MP_ICON.bolt;
}

function mpStory(row) {
    const savedBody = String(row.descBody || row.desc || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const features = (row.features && row.features.length)
        ? row.features
        : (row.highlights && row.highlights.length ? row.highlights : MP_DEFAULT_FEATURES);
    const includes = (row.includes && row.includes.length)
        ? row.includes
        : (row.packageIncludes && row.packageIncludes.length ? row.packageIncludes : MP_DEFAULT_INCLUDES);
    const care = (row.care && row.care.length)
        ? row.care
        : (row.careInstructions && row.careInstructions.length ? row.careInstructions : MP_DEFAULT_CARE);
    return {
        headline: row.descHeadline || 'Product details',
        body: savedBody || MP_SHEET_BODY,
        features,
        includes,
        care
    };
}

function mpDescPanel(row) {
    const story = mpStory(row);
    const images = Array.isArray(row.images) ? row.images : [];
    const photo = images[1] || images[0] || row.imageUrl || '';
    const shot = photo ? `<img src="${mpEscape(photo)}" alt="${mpEscape(row.title || 'Product')}">` : '';
    const features = story.features.map((item) => {
        const label = item.label || item.title || String(item);
        const icon = item.icon || 'bolt';
        return `<li><span class="mp-feat-ico">${mpIcon(icon)}</span>${mpEscape(label)}</li>`;
    }).join('');
    const includes = story.includes.map((item) =>
        `<li><span aria-hidden="true">✓</span>${mpEscape(typeof item === 'string' ? item : (item.label || item.title || ''))}</li>`
    ).join('');
    const care = story.care.map((item) => {
        const label = item.label || item.title || String(item);
        const icon = item.icon || 'note';
        return `<li>${mpIcon(icon)}${mpEscape(label)}</li>`;
    }).join('');
    return `
        <article class="mp-panel">
            <h3>${mpEscape(story.headline)}</h3>
            <p>${mpEscape(story.body)}</p>
            <ul class="mp-feats">${features}</ul>
        </article>
        <article class="mp-panel">
            <h3>What&apos;s in the Box</h3>
            <ul class="mp-checks mp-includes">${includes}</ul>
            <h3>Product Notes</h3>
            <ul class="mp-care">${care}</ul>
        </article>
        <article class="mp-life">${shot}<p><span>Quality</span><span>Ready</span><span>Reliable</span></p></article>`;
}
