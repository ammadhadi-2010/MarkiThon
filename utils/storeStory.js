const FEATURE_ICONS = new Set([
    'bolt', 'check', 'shield', 'star', 'box', 'tag',
    'cotton', 'wind', 'sun', 'wash'
]);
const CARE_ICONS = new Set([
    'note', 'info', 'alert', 'heart',
    'machine', 'bottle', 'bleach', 'dry'
]);

function parseList(raw) {
    try {
        const value = typeof raw === 'string' ? JSON.parse(raw || '[]') : raw;
        return Array.isArray(value) ? value : [];
    } catch (error) {
        return [];
    }
}

function packFeatures(raw) {
    return JSON.stringify(parseList(raw).map((item) => ({
        label: String((item && (item.label || item.title)) || '').trim().slice(0, 80),
        icon: FEATURE_ICONS.has(item && item.icon) ? item.icon : 'bolt'
    })).filter((item) => item.label).slice(0, 4));
}

function packLines(raw) {
    return JSON.stringify(parseList(raw)
        .map((item) => String(item || '').trim().slice(0, 120))
        .filter(Boolean)
        .slice(0, 4));
}

function packCare(raw) {
    return JSON.stringify(parseList(raw).map((item) => ({
        label: String((item && (item.label || item.title)) || '').trim().slice(0, 80),
        icon: CARE_ICONS.has(item && item.icon) ? item.icon : 'note'
    })).filter((item) => item.label).slice(0, 4));
}

function applyStoryFields(body, data) {
    if (body.storeDescHeadline !== undefined) {
        data.storeDescHeadline = String(body.storeDescHeadline || '').trim().slice(0, 140);
    }
    if (body.storeDescBody !== undefined) {
        data.storeDescBody = String(body.storeDescBody || '').trim().slice(0, 2000);
    }
    const features = body.storeFeatures !== undefined ? body.storeFeatures : body.highlights;
    const includes = body.storeIncludes !== undefined ? body.storeIncludes : body.packageIncludes;
    const care = body.storeCare !== undefined ? body.storeCare : body.careInstructions;
    if (features !== undefined) data.storeFeatures = packFeatures(features);
    if (includes !== undefined) data.storeIncludes = packLines(includes);
    if (care !== undefined) data.storeCare = packCare(care);
}

function publicStory(row) {
    const features = parseList(row && row.storeFeatures);
    const includes = parseList(row && row.storeIncludes);
    const care = parseList(row && row.storeCare);
    return {
        descHeadline: (row && row.storeDescHeadline) || '',
        descBody: (row && row.storeDescBody) || '',
        features,
        includes,
        care,
        packageIncludes: includes,
        careInstructions: care
    };
}

module.exports = { applyStoryFields, publicStory };
