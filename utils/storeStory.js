const FEATURE_ICONS = new Set(['cotton', 'wind', 'sun', 'wash', 'shield', 'star']);
const CARE_ICONS = new Set(['machine', 'bottle', 'bleach', 'dry']);

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
        label: String((item && item.label) || '').trim().slice(0, 80),
        icon: FEATURE_ICONS.has(item && item.icon) ? item.icon : 'cotton'
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
        label: String((item && item.label) || '').trim().slice(0, 80),
        icon: CARE_ICONS.has(item && item.icon) ? item.icon : 'machine'
    })).filter((item) => item.label).slice(0, 4));
}

function applyStoryFields(body, data) {
    if (body.storeDescHeadline !== undefined) {
        data.storeDescHeadline = String(body.storeDescHeadline || '').trim().slice(0, 140);
    }
    if (body.storeDescBody !== undefined) {
        data.storeDescBody = String(body.storeDescBody || '').trim().slice(0, 2000);
    }
    if (body.storeFeatures !== undefined) data.storeFeatures = packFeatures(body.storeFeatures);
    if (body.storeIncludes !== undefined) data.storeIncludes = packLines(body.storeIncludes);
    if (body.storeCare !== undefined) data.storeCare = packCare(body.storeCare);
}

function publicStory(row) {
    return {
        descHeadline: (row && row.storeDescHeadline) || '',
        descBody: (row && row.storeDescBody) || '',
        features: parseList(row && row.storeFeatures),
        includes: parseList(row && row.storeIncludes),
        care: parseList(row && row.storeCare)
    };
}

module.exports = { applyStoryFields, publicStory };
