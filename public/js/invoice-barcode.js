const CODE39_BITS = {
    '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
    '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
    '8': '100100100', '9': '001100100', A: '100001001', B: '001001001',
    C: '101001000', D: '000011001', E: '100011000', F: '001011000',
    G: '000001101', H: '100001100', I: '001001100', J: '000011100',
    K: '100000011', L: '001000011', M: '101000010', N: '000010011',
    O: '100010010', P: '001010010', Q: '000000111', R: '100000110',
    S: '001000110', T: '000010110', U: '110000001', V: '011000001',
    W: '111000000', X: '010010001', Y: '110010000', Z: '011010000',
    '-': '010000101', '.': '110000100', ' ': '011000100', '*': '010010100',
    $: '010101000', '/': '010100010', '+': '010001010', '%': '000101010'
};

function barcodeSafeText(value) {
    return String(value || 'MARKITHON').toUpperCase().replace(/[^0-9A-Z. $/+% -]/g, '-').slice(0, 24);
}

function code39SvgMarkup(raw) {
    const text = `*${barcodeSafeText(raw)}*`;
    const narrow = 2;
    const wide = 5;
    let x = 0;
    let bars = '';
    [...text].forEach((ch) => {
        const bits = CODE39_BITS[ch] || CODE39_BITS['-'];
        [...bits].forEach((bit, i) => {
            const w = bit === '1' ? wide : narrow;
            if (i % 2 === 0) {
                bars += `<rect x="${x}" y="0" width="${w}" height="64" fill="#111827"/>`;
            }
            x += w;
        });
        x += narrow;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} 64" width="100%" height="56" role="img" aria-label="Barcode ${text}">${bars}</svg>`;
}

function paintInvBarcode(number) {
    const code = String(number || 'MARKITHON');
    const mount = document.getElementById('invBarcodeMount');
    const text = document.getElementById('invBarcodeText');
    const svg = code39SvgMarkup(code);
    if (text) text.textContent = barcodeSafeText(code);
    if (mount) mount.innerHTML = svg;
}
