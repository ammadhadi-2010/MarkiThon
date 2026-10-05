const MP_LEGAL = {
    about: 'about',
    mission: 'mission',
    careers: 'careers',
    terms: 'terms',
    privacy: 'privacy',
    faqs: 'faqs',
    delivery: 'delivery',
    returns: 'returns'
};

function mpIsLegal(page) {
    return Boolean(MP_LEGAL[page]);
}

function mpLegalMarkup() {
    return '<section class="mp-block mp-page" id="mpLegal"><h1 id="mpLegalTitle">MarkiThon</h1><div id="mpLegalBody"></div></section>';
}

function mpLegalInline(parent, text) {
    String(text).split(/(\*\*[^*]+\*\*)/g).forEach((part) => {
        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
            const strong = document.createElement('strong');
            strong.textContent = part.slice(2, -2);
            parent.appendChild(strong);
            return;
        }
        parent.appendChild(document.createTextNode(part));
    });
}

function mpLegalFill(title, body) {
    const heading = document.getElementById('mpLegalTitle');
    const box = document.getElementById('mpLegalBody');
    if (!heading || !box) return;
    heading.textContent = title || 'MarkiThon';
    document.title = heading.textContent + ' · MarkiThon';
    box.textContent = '';
    String(body || '').split(/\n{2,}/).forEach((block) => {
        const lines = block.split('\n').filter((line) => line.trim());
        if (!lines.length) return;
        if (lines.every((line) => line.trim().startsWith('- '))) {
            const list = document.createElement('ul');
            lines.forEach((line) => {
                const item = document.createElement('li');
                mpLegalInline(item, line.trim().slice(2));
                list.appendChild(item);
            });
            box.appendChild(list);
            return;
        }
        const paragraph = document.createElement('p');
        lines.forEach((line, index) => {
            if (index) paragraph.appendChild(document.createElement('br'));
            mpLegalInline(paragraph, line);
        });
        box.appendChild(paragraph);
    });
}

function mpLoadLegal(page) {
    const id = MP_LEGAL[page];
    if (!id) return;
    fetch('/api/admin/cms/pages')
        .then((response) => response.json())
        .then((data) => {
            const row = data.pages && data.pages[id];
            if (row) mpLegalFill(row.title, row.body);
        })
        .catch(() => {});
}
