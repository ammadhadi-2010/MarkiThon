const fs = require('fs');
const path = require('path');

const STICKER_DIR = path.join(__dirname, '../public/assets/stickers');
const OK_EXT = new Set(['.png', '.gif', '.svg', '.webp']);

function safeName(name) {
    return String(name || 'sticker')
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) || 'sticker';
}

function extFromMime(mime) {
    if (mime === 'image/png') return '.png';
    if (mime === 'image/gif') return '.gif';
    if (mime === 'image/webp') return '.webp';
    if (mime === 'image/svg+xml') return '.svg';
    return '';
}

exports.listStickers = async (req, res) => {
    try {
        await fs.promises.mkdir(STICKER_DIR, { recursive: true });
        const names = await fs.promises.readdir(STICKER_DIR);
        const stickers = names
            .filter((name) => OK_EXT.has(path.extname(name).toLowerCase()))
            .map((name) => ({
                name,
                url: '/assets/stickers/' + encodeURIComponent(name)
            }));
        res.status(200).json({ stickers });
    } catch (error) {
        res.status(500).json({ message: 'Could not load sticker gallery.', error: error.message });
    }
};

exports.uploadSticker = async (req, res) => {
    try {
        const dataUrl = String((req.body || {}).dataUrl || '');
        const match = dataUrl.match(/^data:(image\/(?:png|gif|webp|svg\+xml));base64,([A-Za-z0-9+/=]+)$/i);
        if (!match) {
            return res.status(400).json({ message: 'Upload a PNG, GIF, SVG, or WebP sticker.' });
        }
        const ext = extFromMime(match[1].toLowerCase());
        if (!ext) return res.status(400).json({ message: 'Unsupported sticker type.' });
        const buf = Buffer.from(match[2], 'base64');
        if (buf.length > 2 * 1024 * 1024) {
            return res.status(400).json({ message: 'Sticker is too large. Use a file under 2 MB.' });
        }
        await fs.promises.mkdir(STICKER_DIR, { recursive: true });
        const base = safeName(path.parse(String((req.body || {}).name || 'sticker')).name);
        const file = `${base}-${Date.now()}${ext}`;
        await fs.promises.writeFile(path.join(STICKER_DIR, file), buf);
        res.status(201).json({
            message: 'Sticker uploaded.',
            sticker: { name: file, url: '/assets/stickers/' + encodeURIComponent(file) }
        });
    } catch (error) {
        res.status(500).json({ message: 'Could not upload sticker.', error: error.message });
    }
};

exports.deleteSticker = async (req, res) => {
    try {
        const name = path.basename(decodeURIComponent(String(req.params.name || '')));
        if (!OK_EXT.has(path.extname(name).toLowerCase())) {
            return res.status(400).json({ message: 'Invalid sticker file.' });
        }
        const file = path.join(STICKER_DIR, name);
        await fs.promises.unlink(file);
        res.status(200).json({ message: 'Sticker deleted successfully', name });
    } catch (error) {
        if (error && error.code === 'ENOENT') {
            return res.status(404).json({ message: 'Sticker not found.' });
        }
        res.status(500).json({ message: 'Could not delete sticker.', error: error.message });
    }
};
