let osEditTagsList = [];

function storeEditTagsMarkup() {
    return `
    <section class="os-edit-sec">
        <div class="os-edit-sec-head">
            <span class="os-step">6</span>
            <div>
                <strong>Product Tags</strong>
                <p>Add tags to help customers find your product.</p>
            </div>
        </div>
        <div class="os-tag-box" id="osEditTagBox">
            <div id="osEditTagChips" class="os-tag-chips"></div>
            <input id="osEditTagAdd" name="osEditTagAdd" autocomplete="off" placeholder="Add tag...">
        </div>
    </section>`;
}

function osTagList(value) {
    return String(value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
}

function fillOsEditTags(row) {
    osEditTagsList = osTagList(row.storeTags || '');
    paintOsEditTagChips();
}

function osEditTagPayload() {
    return { storeTags: osEditTagsList.join(', ') };
}

function paintOsEditTagChips() {
    const box = document.getElementById('osEditTagChips');
    if (!box) return;
    box.innerHTML = osEditTagsList.map((tag, i) =>
        `<span class="os-tag-chip">${escapeHtml(tag)}<button type="button" data-ostagx="${i}" aria-label="Remove">×</button></span>`
    ).join('');
    if (typeof osEditSyncState === 'function') osEditSyncState();
}

function addOsEditTag(raw) {
    osTagList(String(raw || '').replace(/;/g, ',')).forEach((tag) => {
        const key = tag.toLowerCase();
        if (!osEditTagsList.some((item) => item.toLowerCase() === key)) {
            osEditTagsList.push(tag);
        }
    });
    paintOsEditTagChips();
}

function onOsEditTagClick(event) {
    const btn = event.target.closest('[data-ostagx]');
    if (!btn) return;
    osEditTagsList.splice(Number(btn.dataset.ostagx), 1);
    paintOsEditTagChips();
}

function onOsEditTagKey(event) {
    if (event.target.id !== 'osEditTagAdd') return;
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        addOsEditTag(event.target.value);
        event.target.value = '';
    }
    if (event.key === 'Backspace' && !event.target.value && osEditTagsList.length) {
        osEditTagsList.pop();
        paintOsEditTagChips();
    }
}

function onOsEditTagBlur(event) {
    if (event.target.id !== 'osEditTagAdd') return;
    if (!event.target.value.trim()) return;
    addOsEditTag(event.target.value);
    event.target.value = '';
}
