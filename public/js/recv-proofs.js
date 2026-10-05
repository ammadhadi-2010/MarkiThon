function recvProofValue(id) {
    return document.getElementById(id)?.value || '';
}

function recvProofField(fileId, hiddenId, imgId, hintId, label, hint) {
    return `<div class="field">
        <label>${label}</label>
        <div class="recv-proof">
            <img id="${imgId}" class="recv-proof-img" alt="${label}" hidden>
            <span id="${hintId}">${hint}</span>
        </div>
        <input id="${fileId}" name="${fileId}" type="file" accept="image/*" autocomplete="off">
        <input id="${hiddenId}" name="${hiddenId}" type="hidden" autocomplete="off">
    </div>`;
}

function setRecvProofPreview(imgId, hintId, dataUrl) {
    const img = document.getElementById(imgId);
    const hint = document.getElementById(hintId);
    if (!img) return;
    if (dataUrl) {
        img.src = dataUrl;
        img.hidden = false;
        if (hint) hint.hidden = true;
    } else {
        img.removeAttribute('src');
        img.hidden = true;
        if (hint) hint.hidden = false;
    }
}

function resetRecvProofs() {
    ['recvInvoiceFile', 'recvPayProofFile'].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const invoice = document.getElementById('recvInvoiceImage');
    const slip = document.getElementById('recvPayProofImage');
    if (invoice) invoice.value = '';
    if (slip) slip.value = '';
    setRecvProofPreview('recvInvoicePrev', 'recvInvoiceHint', '');
    setRecvProofPreview('recvPayProofPrev', 'recvPayProofHint', '');
}

function bindRecvProofInput(fileId, hiddenId, imgId, hintId) {
    const file = document.getElementById(fileId);
    if (!file || file.dataset.bound) return;
    file.dataset.bound = '1';
    file.addEventListener('change', (e) => {
        const picked = e.target.files && e.target.files[0];
        if (!picked) return;
        const compress = typeof compressInvImage === 'function'
            ? compressInvImage
            : null;
        if (!compress) return showToast('Image compressor is not ready.');
        compress(picked).then((dataUrl) => {
            document.getElementById(hiddenId).value = dataUrl;
            setRecvProofPreview(imgId, hintId, dataUrl);
        }).catch((error) => showToast(error.message));
    });
}

function bindRecvProofs() {
    bindRecvProofInput('recvInvoiceFile', 'recvInvoiceImage', 'recvInvoicePrev', 'recvInvoiceHint');
    bindRecvProofInput('recvPayProofFile', 'recvPayProofImage', 'recvPayProofPrev', 'recvPayProofHint');
}
