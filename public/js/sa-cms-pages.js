function saCmsLinkLists(pack) {
    const footer = pack.cms && pack.cms.footer;
    if (!footer) return '<section class="sa-card"><h3>Footer links</h3><p class="sa-muted">Footer settings are unavailable.</p></section>';
    const groups = (footer.groups || []).filter((group) => group.id === 'company' || group.id === 'support');
    const html = groups.map((group) => {
        const fields = (group.links || []).map((link) => saFooterInput('link-' + group.id + '-' + link.id, link.label, link.href)).join('');
        return `<h3>${saText(group.title)}</h3><div class="sa-foot-grid">${fields}</div>`;
    }).join('');
    return `<form class="sa-card" id="saCmsLinkForm" autocomplete="off">
        <h3>Footer links</h3>
        <p class="sa-muted">These Company and Help &amp; Support links appear on the marketplace footer.</p>
        ${html}
        <button class="sa-cms-visit" type="submit">Save Links</button>
    </form>`;
}

function saCmsPageEditor(pack) {
    const pages = pack.cms && pack.cms.pages ? pack.cms.pages : {};
    const keys = Object.keys(pages);
    const first = pages[keys[0]] || { id: '', title: '', body: '' };
    const options = keys.map((id) => `<option value="${id}"${id === first.id ? ' selected' : ''}>${saText(pages[id].title)}</option>`).join('');
    return `<form class="sa-card" id="saCmsPageForm" autocomplete="off">
        <h3>Page content</h3>
        <p class="sa-muted">Choose a page, edit the text, and save it to the storefront.</p>
        <label>Page</label>
        <select id="saCmsPageId" autocomplete="off">${options}</select>
        <label>Title</label>
        <input id="saCmsPageTitle" autocomplete="off" maxlength="80" value="${saText(first.title)}">
        <label>Content</label>
        <div class="sa-page-tools">
            <button class="sa-page-tool" type="button" data-page-tool="bold">Bold</button>
            <button class="sa-page-tool" type="button" data-page-tool="list">Bullet</button>
        </div>
        <textarea id="saCmsPageBody" autocomplete="off" maxlength="4000" rows="8">${saText(first.body)}</textarea>
        <h3>Preview</h3>
        <div class="sa-page-preview" id="saCmsPagePreview"></div>
        <button class="sa-cms-visit" type="submit">Save Page</button>
    </form>`;
}

function saCmsFooterTab(pack) {
    return `<div class="sa-cms-grid"><div>${saCmsLinkLists(pack)}</div><div>${saCmsPageEditor(pack)}</div></div>`;
}

function saPageInline(parent, text) {
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

function saCmsPagePaint() {
    const preview = document.getElementById('saCmsPagePreview');
    const body = document.getElementById('saCmsPageBody');
    if (!preview || !body) return;
    preview.textContent = '';
    const title = document.getElementById('saCmsPageTitle');
    if (title && title.value.trim()) {
        const heading = document.createElement('strong');
        heading.textContent = title.value.trim();
        preview.appendChild(heading);
    }
    String(body.value || '').split(/\n{2,}/).forEach((block) => {
        const lines = block.split('\n').filter((line) => line.trim());
        if (!lines.length) return;
        if (lines.every((line) => line.trim().startsWith('- '))) {
            const list = document.createElement('ul');
            lines.forEach((line) => {
                const item = document.createElement('li');
                saPageInline(item, line.trim().slice(2));
                list.appendChild(item);
            });
            preview.appendChild(list);
            return;
        }
        const paragraph = document.createElement('p');
        lines.forEach((line, index) => {
            if (index) paragraph.appendChild(document.createElement('br'));
            saPageInline(paragraph, line);
        });
        preview.appendChild(paragraph);
    });
}

function saCmsPageFill() {
    const select = document.getElementById('saCmsPageId');
    const pages = saCmsPack && saCmsPack.cms && saCmsPack.cms.pages;
    if (!select || !pages || !pages[select.value]) return;
    document.getElementById('saCmsPageTitle').value = pages[select.value].title || '';
    document.getElementById('saCmsPageBody').value = pages[select.value].body || '';
    saCmsPagePaint();
}

function saPageTool(kind) {
    const area = document.getElementById('saCmsPageBody');
    if (!area) return;
    if (kind === 'bold') {
        const selected = area.value.slice(area.selectionStart, area.selectionEnd) || 'text';
        area.setRangeText('**' + selected + '**', area.selectionStart, area.selectionEnd, 'end');
    } else {
        const lead = area.value && !area.value.endsWith('\n') ? '\n' : '';
        area.setRangeText(lead + '- ', area.selectionStart, area.selectionEnd, 'end');
    }
    area.focus();
    area.dispatchEvent(new Event('input', { bubbles: true }));
}

async function saCmsSavePage() {
    const payload = {
        id: document.getElementById('saCmsPageId').value,
        title: document.getElementById('saCmsPageTitle').value,
        body: document.getElementById('saCmsPageBody').value
    };
    try {
        const response = await fetch('/api/admin/cms/pages', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not save page content.');
        if (saCmsPack && saCmsPack.cms) saCmsPack.cms.pages = data.pages;
        saCmsNote = data.message || 'Page content updated.';
    } catch (error) {
        const fresh = typeof saCmsReload === 'function' ? await saCmsReload() : null;
        if (fresh && fresh.cms && fresh.cms.pages) {
            saCmsPack = fresh;
            saCmsNote = 'Page content updated.';
        } else {
            saCmsNote = error.message || 'Could not save page content.';
        }
    }
    saPaintCms();
}

document.addEventListener('change', (event) => {
    if (event.target.id === 'saCmsPageId') saCmsPageFill();
});

document.addEventListener('input', (event) => {
    if (event.target.id === 'saCmsPageBody' || event.target.id === 'saCmsPageTitle') saCmsPagePaint();
});

document.addEventListener('click', (event) => {
    const tool = event.target.closest('[data-page-tool]');
    if (tool) saPageTool(tool.dataset.pageTool);
});

document.addEventListener('submit', (event) => {
    if (event.target.id !== 'saCmsPageForm') return;
    event.preventDefault();
    saCmsSavePage();
});
