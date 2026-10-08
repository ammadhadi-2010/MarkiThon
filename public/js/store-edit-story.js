const OS_FEAT_ICONS = [
    ['bolt', 'Bolt'],
    ['check', 'Check'],
    ['shield', 'Shield'],
    ['star', 'Star'],
    ['box', 'Box'],
    ['tag', 'Tag']
];
const OS_CARE_ICONS = [
    ['note', 'Note'],
    ['info', 'Info'],
    ['alert', 'Alert'],
    ['heart', 'Heart']
];

function osStorySelect(id, options) {
    const choices = options.map(([value, label]) =>
        `<option value="${value}">${label}</option>`
    ).join('');
    return `<select id="${id}" name="${id}" autocomplete="off">${choices}</select>`;
}

function osStoryPairs(prefix, options, placeholder) {
    return [0, 1, 2, 3].map((index) => `
        <div class="os-story-row">
            <input id="${prefix}Label${index}" name="${prefix}Label${index}" maxlength="80" placeholder="${placeholder}" autocomplete="off">
            ${osStorySelect(prefix + 'Icon' + index, options)}
        </div>`).join('');
}

function storeEditStoryMarkup() {
    const includes = [0, 1, 2, 3].map((index) => `
        <input id="osInclude${index}" name="osInclude${index}" maxlength="120" placeholder="e.g. 1x Data Cable, 1x Warranty Card" autocomplete="off">
    `).join('');
    return `
    <section class="os-edit-sec">
        ${osEditSecHead('9', 'Description Tab', 'Shown on the public product page. Leave a list empty to use the default text.')}
        <div class="field">
            <label for="osEditHeadline">Description headline</label>
            <input id="osEditHeadline" name="osEditHeadline" maxlength="140" placeholder="e.g. Reliable charge every day" autocomplete="off">
        </div>
        <div class="field">
            <label for="osEditBody">Full body description</label>
            <textarea id="osEditBody" name="osEditBody" rows="4" maxlength="2000" autocomplete="off" placeholder="Describe the product, how it works, and who it is for."></textarea>
        </div>
        <p class="os-policy-note">Key Features / Specifications</p>
        ${osStoryPairs('osFeat', OS_FEAT_ICONS, 'e.g. Fast Charging 65W, Braided Cable')}
        <p class="os-policy-note">What&apos;s in the Box / Package Includes</p>
        <div class="os-story-lines">${includes}</div>
        <p class="os-policy-note">Product Notes / Care Instructions</p>
        ${osStoryPairs('osCare', OS_CARE_ICONS, 'e.g. Handle with care, avoid moisture')}
    </section>`;
}

function osStoryValue(id) {
    return String(document.getElementById(id)?.value || '').trim();
}

function osFillPairs(prefix, raw) {
    let rows = [];
    try { rows = JSON.parse(raw || '[]'); } catch (error) { rows = []; }
    if (!Array.isArray(rows)) rows = [];
    [0, 1, 2, 3].forEach((index) => {
        const item = rows[index] || {};
        const label = document.getElementById(prefix + 'Label' + index);
        const icon = document.getElementById(prefix + 'Icon' + index);
        if (label) label.value = item.label || item.title || '';
        if (icon && item.icon) icon.value = item.icon;
    });
}

function fillOsEditStory(row) {
    const headline = document.getElementById('osEditHeadline');
    const body = document.getElementById('osEditBody');
    if (headline) headline.value = row.storeDescHeadline || '';
    if (body) body.value = row.storeDescBody || '';
    osFillPairs('osFeat', row.storeFeatures || row.highlights);
    osFillPairs('osCare', row.storeCare || row.careInstructions);
    let lines = [];
    try {
        lines = JSON.parse(row.storeIncludes || row.packageIncludes || '[]');
    } catch (error) {
        lines = [];
    }
    if (!Array.isArray(lines)) lines = [];
    [0, 1, 2, 3].forEach((index) => {
        const input = document.getElementById('osInclude' + index);
        if (input) input.value = lines[index] || '';
    });
}

function osEditStoryPayload() {
    const features = [0, 1, 2, 3].map((index) => ({
        label: osStoryValue('osFeatLabel' + index),
        icon: osStoryValue('osFeatIcon' + index) || 'bolt'
    })).filter((item) => item.label);
    const care = [0, 1, 2, 3].map((index) => ({
        label: osStoryValue('osCareLabel' + index),
        icon: osStoryValue('osCareIcon' + index) || 'note'
    })).filter((item) => item.label);
    const includes = [0, 1, 2, 3].map((index) => osStoryValue('osInclude' + index)).filter(Boolean);
    const featuresJson = JSON.stringify(features);
    const includesJson = JSON.stringify(includes);
    const careJson = JSON.stringify(care);
    return {
        storeDescHeadline: osStoryValue('osEditHeadline').slice(0, 140),
        storeDescBody: osStoryValue('osEditBody').slice(0, 2000),
        storeFeatures: featuresJson,
        storeIncludes: includesJson,
        storeCare: careJson,
        highlights: featuresJson,
        packageIncludes: includesJson,
        careInstructions: careJson
    };
}
