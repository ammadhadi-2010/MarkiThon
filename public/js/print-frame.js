function printFrameCss(mode) {
    const a4 = mode === 'a4';
    return `<style>
      @page { size: auto; margin: 0mm; }
      html, body {
        margin: 0; padding: 0; background: #fff; color: #111;
        height: auto !important; max-height: max-content; overflow: visible !important;
      }
      .printable-area {
        height: auto !important; max-height: max-content; overflow: visible !important;
        page-break-inside: avoid; break-inside: avoid; background: #fff; color: #111; border: 0;
        ${a4 ? 'width:190mm;padding:12mm;font-family:Segoe UI,Arial,sans-serif;font-size:13px;line-height:1.6;' : 'width:80mm;padding:2mm;font-family:Courier New,Consolas,monospace;font-size:11px;'}
      }
      .inv-format, .invoice-actions { display: none !important; }
      .inv-barcode-svg svg { width: 72%; max-width: 420px; height: 56px; }
      .inv-barcode-wrap { text-align: center; margin: 16px 0 10px; }
      .inv-barcode-wrap span { display: block; letter-spacing: 0.12em; margin-top: 6px; }
      ${a4 ? `
        .inv-thermal-table, .inv-thermal-only { display: none; }
        .inv-brand { display: flex; justify-content: space-between; gap: 16px; }
        .inv-platform { font-size: 22px; font-weight: 800; }
        .slip-shop { font-size: 18px; font-weight: 700; }
        .inv-rule { border-top: 2px solid #111; margin: 14px 0; }
        .inv-a4-table { width: 100%; table-layout: fixed; border-collapse: collapse; margin: 12px 0 18px; }
        .inv-a4-table th, .inv-a4-table td { border: 1px solid #d1d5db; padding: 10px 12px; }
        .inv-a4-table th { background: #f3f4f6; text-align: left; }
        .inv-a4-table td:nth-child(4), .inv-a4-table td:nth-child(5),
        .inv-a4-table th:nth-child(4), .inv-a4-table th:nth-child(5) { text-align: right; }
        .inv-finance { margin-left: auto; width: 78mm; border: 1px solid #9ca3af; background: #f3f4f6; padding: 12px 14px; }
        .slip-row { display: flex; justify-content: space-between; padding: 5px 0; }
        .slip-grand { font-weight: 800; border-top: 1px solid #9ca3af; margin-top: 6px; padding-top: 8px; }
      ` : `
        .inv-a4-table { display: none; }
        .inv-brand { text-align: center; }
        .inv-platform { font-weight: 800; }
        .slip-row { display: flex; justify-content: space-between; }
        .slip-dash, .inv-rule { border-top: 1px dashed #999; margin: 6px 0; }
      `}
      .inv-line-spec { display:block; margin-top:2px; font-size:10px; font-weight:500; line-height:1.3; color:#333; white-space:normal; }
      .qr-sheet { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .qr-sticker { border: 1px dashed #333; padding: 8px; text-align: center; font-size: 11px; break-inside: avoid; }
    </style>`;
}

function printFrameEl() {
    let frame = document.getElementById('markithon-print-frame');
    if (frame) return frame;
    frame = document.createElement('iframe');
    frame.id = 'markithon-print-frame';
    frame.title = 'Print';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;left:-10000px;top:0;width:800px;height:900px;border:0;opacity:0;pointer-events:none;';
    document.body.appendChild(frame);
    return frame;
}

function printHtmlFrame(innerHtml, opts) {
    const mode = opts && opts.mode === 'a4' ? 'a4' : 'thermal';
    const title = String((opts && opts.title) || 'Receipt').replace(/[<>]/g, '');
    const html = `<!DOCTYPE html><html class="print-${mode}"><head><meta charset="UTF-8">
        <title>${title}</title>${printFrameCss(mode)}</head>
        <body>${innerHtml}</body></html>`;
    const frame = printFrameEl();
    const doc = frame.contentDocument;
    if (!doc) {
        if (typeof showToast === 'function') showToast('Could not prepare the print preview.');
        return;
    }
    doc.open();
    doc.write(html);
    doc.close();
    const runPrint = () => {
        try { frame.contentWindow.print(); } catch (error) { /* keep the app open */ }
    };
    if (doc.readyState === 'complete') setTimeout(runPrint, 250);
    else frame.addEventListener('load', () => setTimeout(runPrint, 250), { once: true });
}

function printIsolatedNode(node, opts) {
    if (!node) return;
    const clone = node.cloneNode(true);
    clone.classList.add('printable-area');
    clone.querySelectorAll('.qr-sheet').forEach((el) => el.remove());
    printHtmlFrame(clone.outerHTML, opts);
}
