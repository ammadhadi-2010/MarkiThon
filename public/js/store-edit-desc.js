function storeEditDescMarkup() {
    return `
    <section class="os-edit-sec">
        <div class="os-edit-sec-head">
            <span class="os-step">5</span>
            <div>
                <strong>Website Display</strong>
                <p>Customize product details shown on your website.</p>
            </div>
        </div>
        <div class="field">
            <label for="osEditStoreTitle">Product Title <span class="os-req">*</span></label>
            <input id="osEditStoreTitle" name="osEditStoreTitle" maxlength="120" autocomplete="off">
        </div>
        <div class="field">
            <label for="osEditShort">Short Description <span class="os-req">*</span></label>
            <textarea id="osEditShort" name="osEditShort" rows="2" maxlength="200" autocomplete="off"
                placeholder="High quality fabric, soft and comfortable."></textarea>
            <small class="os-count" id="osEditShortCount">0/200</small>
        </div>
        <div class="field">
            <label for="osEditFull">Full Description</label>
            <div class="os-rich">
                <div class="os-rich-bar">
                    <button type="button" data-osfmt="bold" title="Bold"><b>B</b></button>
                    <button type="button" data-osfmt="italic" title="Italic"><i>I</i></button>
                    <button type="button" data-osfmt="insertUnorderedList" title="Bullets">•</button>
                    <button type="button" data-osfmt="insertOrderedList" title="Numbers">1.</button>
                    <button type="button" data-osfmt="createLink" title="Link">Link</button>
                </div>
                <div id="osEditFull" class="os-rich-body" contenteditable="true" role="textbox"></div>
            </div>
            <small class="os-count" id="osEditFullCount">0/1000</small>
        </div>
    </section>`;
}

function osEditFullText() {
    return String(document.getElementById('osEditFull')?.innerText || '').trim();
}

function paintOsEditCounts() {
    const short = document.getElementById('osEditShort');
    const sc = document.getElementById('osEditShortCount');
    const fc = document.getElementById('osEditFullCount');
    if (short && sc) sc.textContent = `${short.value.length}/200`;
    if (fc) fc.textContent = `${osEditFullText().length}/1000`;
}

function fillOsEditDesc(row) {
    const title = document.getElementById('osEditStoreTitle');
    const short = document.getElementById('osEditShort');
    const full = document.getElementById('osEditFull');
    if (title) title.value = row.storeTitle || row.title || '';
    if (short) short.value = row.storeShortDescription || '';
    if (full) full.innerHTML = row.storeDescription || '';
    paintOsEditCounts();
}

function osEditDescPayload() {
    const full = document.getElementById('osEditFull');
    return {
        storeTitle: String(document.getElementById('osEditStoreTitle')?.value || '').slice(0, 120),
        storeShortDescription: String(document.getElementById('osEditShort')?.value || '').slice(0, 200),
        storeDescription: String(full?.innerHTML || '').slice(0, 4000)
    };
}

function onOsEditFmt(event) {
    const btn = event.target.closest('[data-osfmt]');
    if (!btn) return;
    event.preventDefault();
    const cmd = btn.dataset.osfmt;
    const full = document.getElementById('osEditFull');
    if (full) full.focus();
    if (cmd === 'createLink') {
        const url = window.prompt('Link URL', 'https://');
        if (url) document.execCommand('createLink', false, url);
        return;
    }
    document.execCommand(cmd, false, null);
}
