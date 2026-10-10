const fs = require('fs');
const path = require('path');

function writeAdminAvatar(body) {
    const match = String(body.data || body.dataUrl || '').match(
        /^data:image\/(png|jpeg|jpg|webp);base64,([a-z0-9+/=\s]+)$/i
    );
    if (!match) return '';
    const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
    if (!buffer.length || buffer.length > 2 * 1024 * 1024) return '';
    const kind = match[1].toLowerCase();
    const ext = kind === 'jpeg' ? 'jpg' : kind;
    const dir = path.join(__dirname, '../public/uploads/avatars');
    const name = 'admin-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, name), buffer);
    return '/uploads/avatars/' + name;
}

function safeAdminAvatarUrl(value) {
    const url = String(value || '').trim();
    if (/^\/uploads\/avatars\/[a-z0-9._-]+$/i.test(url)) return url;
    if (/^https?:\/\//i.test(url)) return url.slice(0, 300);
    return '';
}

module.exports = { writeAdminAvatar, safeAdminAvatarUrl };
