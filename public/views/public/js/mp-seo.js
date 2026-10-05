function mpMeta(name, content, attr) {
    const key = attr || 'name';
    let node = document.head.querySelector('meta[' + key + '="' + name + '"]');
    if (!content) {
        if (node) node.remove();
        return;
    }
    if (!node) {
        node = document.createElement('meta');
        node.setAttribute(key, name);
        document.head.appendChild(node);
    }
    node.setAttribute('content', content);
}

function mpCanon(href) {
    let node = document.head.querySelector('link[rel="canonical"]');
    if (!href) {
        if (node) node.remove();
        return;
    }
    if (!node) {
        node = document.createElement('link');
        node.rel = 'canonical';
        document.head.appendChild(node);
    }
    node.href = href;
}

function mpSeoImage(url) {
    const value = String(url || '');
    if (/^https?:\/\//i.test(value)) return value;
    if (/^\/uploads\/banners\/[a-z0-9._-]+$/i.test(value)) return location.origin + value;
    return '';
}

function mpApplySeo(seo) {
    const title = seo.title || 'MarkiThon';
    const text = seo.description || '';
    const page = seo.canonical || (location.origin + '/');
    const image = mpSeoImage(seo.ogImage);
    const robots = (seo.index === false ? 'noindex' : 'index') + ', ' + (seo.follow === false ? 'nofollow' : 'follow');
    document.title = title;
    mpMeta('description', text);
    mpMeta('keywords', seo.keywords || '');
    mpMeta('robots', robots);
    mpCanon(/^https?:\/\//i.test(seo.canonical) ? seo.canonical : page);
    mpMeta('og:title', seo.ogTitle || title, 'property');
    mpMeta('og:description', seo.ogDescription || text, 'property');
    mpMeta('og:image', image, 'property');
    mpMeta('og:url', page, 'property');
    mpMeta('og:site_name', seo.siteName || 'MarkiThon', 'property');
    mpMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    mpMeta('twitter:title', seo.ogTitle || title);
    mpMeta('twitter:description', seo.ogDescription || text);
    let script = document.getElementById('mpSeoLd');
    if (!script) {
        script = document.createElement('script');
        script.id = 'mpSeoLd';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: seo.siteName || 'MarkiThon',
        url: page,
        description: text
    });
}
