function mpFooterHref(value, fallback) {
    const link = String(value || '').trim();
    if (link.startsWith('/') && !link.startsWith('//')) return link;
    if (/^https?:\/\//i.test(link)) return link;
    return fallback || '';
}

function mpStoreNode(href, label) {
    const safe = mpFooterHref(href, '');
    if (!safe) {
        const span = document.createElement('span');
        span.textContent = label;
        return span;
    }
    const link = document.createElement('a');
    link.href = safe;
    link.textContent = label;
    if (/^https?:\/\//i.test(safe)) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
    }
    return link;
}

function mpPaintFooter(footer) {
    const foot = document.querySelector('.mp-foot');
    if (!foot || !footer) return;
    (footer.social || []).forEach((item) => {
        const node = foot.querySelector('[data-foot-social="' + item.id + '"]');
        if (node) node.setAttribute('href', mpFooterHref(item.href, node.getAttribute('href')));
    });
    (footer.groups || []).forEach((group) => {
        (group.links || []).forEach((item) => {
            const node = foot.querySelector('[data-foot-link="' + group.id + '-' + item.id + '"]');
            if (node) node.setAttribute('href', mpFooterHref(item.href, node.getAttribute('href')));
        });
    });
    const stores = foot.querySelector('.mp-stores');
    const apps = footer.apps || {};
    if (stores) {
        stores.textContent = '';
        stores.appendChild(mpStoreNode(apps.google, 'Google Play'));
        stores.appendChild(mpStoreNode(apps.apple, 'App Store'));
    }
    const note = foot.querySelector('[data-mp-app-note]');
    if (note) note.hidden = Boolean(mpFooterHref(apps.google, '') || mpFooterHref(apps.apple, ''));
}

function mpLoadFooter() {
    fetch('/api/admin/cms/footer')
        .then((response) => response.json())
        .then((data) => mpPaintFooter(data.footer))
        .catch(() => {});
}
