const fs = require('fs');
const path = require('path');

const PUBLIC = path.join(__dirname, '../public');
const ROOTS = [
    path.join(PUBLIC, 'assets'),
    path.join(PUBLIC, 'uploads')
];

function parseImageList(value) {
    try {
        const raw = typeof value === 'string' ? JSON.parse(value || '[]') : value;
        return Array.isArray(raw) ? raw.map((url) => String(url || '').trim()).filter(Boolean) : [];
    } catch (error) {
        return [];
    }
}

function localPathFromUrl(url) {
    const raw = String(url || '').split('?')[0];
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('..')) return '';
    const abs = path.normalize(path.join(PUBLIC, raw.replace(/^\//, '')));
    const ok = ROOTS.some((root) => abs === root || abs.startsWith(root + path.sep));
    return ok ? abs : '';
}

async function unlinkLocalUrl(url) {
    const abs = localPathFromUrl(url);
    if (!abs) return;
    await fs.promises.unlink(abs).catch(() => null);
}

function collectProductMedia(row) {
    const p = row && row.toJSON ? row.toJSON() : (row || {});
    return [
        p.imageUrl,
        p.storeStickerImage,
        ...parseImageList(p.storeImages)
    ].filter(Boolean);
}

async function purgeUrls(urls) {
    const unique = [...new Set((urls || []).map((url) => String(url || '').trim()).filter(Boolean))];
    await Promise.all(unique.map((url) => unlinkLocalUrl(url)));
}

module.exports = {
    parseImageList,
    localPathFromUrl,
    unlinkLocalUrl,
    collectProductMedia,
    purgeUrls
};
