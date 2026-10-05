function saFooterInput(name, label, value) {
    return `<div><label>${label}</label><input name="${name}" autocomplete="off" value="${saText(value || '')}" placeholder="https:// or /path"></div>`;
}

function saCmsFooterForm(pack) {
    const footer = pack.cms && pack.cms.footer;
    if (!footer || !footer.social) {
        return '<section class="sa-card"><h3>Footer</h3><p class="sa-muted">Footer settings are unavailable.</p></section>';
    }
    const social = footer.social.map((item) => saFooterInput('social-' + item.id, item.name, item.href)).join('');
    const groups = (footer.groups || []).filter((group) => group.id !== 'company' && group.id !== 'support').map((group) => {
        const fields = (group.links || []).map((link) => saFooterInput('link-' + group.id + '-' + link.id, link.label, link.href)).join('');
        return `<h3>${saText(group.title)}</h3><div class="sa-foot-grid">${fields}</div>`;
    }).join('');
    const apps = footer.apps || {};
    return `<form class="sa-card" id="saCmsFooterForm" autocomplete="off">
        <h3>Footer</h3>
        <p class="sa-muted">These links, social URLs, and app downloads appear on the marketplace footer.</p>
        <h3>Social</h3>
        <div class="sa-foot-grid">${social}</div>
        ${groups}
        <h3>Download Our App</h3>
        <div class="sa-foot-grid">
            ${saFooterInput('app-google', 'Google Play URL', apps.google)}
            ${saFooterInput('app-apple', 'App Store URL', apps.apple)}
        </div>
        <button class="sa-cms-visit" type="submit">Save Footer</button>
    </form>`;
}

function saCmsFooterRead(form) {
    const sheet = form || document.getElementById('saCmsFooterForm');
    const footer = JSON.parse(JSON.stringify((saCmsPack.cms && saCmsPack.cms.footer) || {}));
    const value = (name) => (sheet && sheet.elements[name] ? sheet.elements[name].value : null);
    (footer.social || []).forEach((item) => {
        const next = value('social-' + item.id);
        if (next != null) item.href = next;
    });
    (footer.groups || []).forEach((group) => {
        (group.links || []).forEach((link) => {
            const next = value('link-' + group.id + '-' + link.id);
            if (next != null) link.href = next;
        });
    });
    footer.apps = footer.apps || {};
    const google = value('app-google');
    const apple = value('app-apple');
    if (google != null) footer.apps.google = google;
    if (apple != null) footer.apps.apple = apple;
    return footer;
}

async function saCmsSaveFooter(form) {
    try {
        const response = await fetch('/api/admin/cms/footer', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ footer: saCmsFooterRead(form) })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not save the footer.');
        if (saCmsPack && saCmsPack.cms) saCmsPack.cms.footer = data.footer;
        saCmsNote = data.message || 'Footer links updated.';
    } catch (error) {
        const fresh = typeof saCmsReload === 'function' ? await saCmsReload() : null;
        if (fresh && fresh.cms && fresh.cms.footer) {
            saCmsPack = fresh;
            saCmsNote = 'Footer links updated.';
        } else {
            saCmsNote = 'Could not save the footer.';
        }
    }
    saPaintCms();
}

document.addEventListener('submit', (event) => {
    if (event.target.id !== 'saCmsFooterForm' && event.target.id !== 'saCmsLinkForm') return;
    event.preventDefault();
    saCmsSaveFooter(event.target);
});
