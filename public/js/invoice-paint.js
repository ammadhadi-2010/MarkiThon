function invLineQty(line) {
    if (line.quantitySold != null) return line.quantitySold;
    return line.quantityMeters;
}

function invLineUnit(line) {
    return String(line.sellUnit || '').trim();
}

function invItemCell(line) {
    const spec = (typeof posItemSpecLabel === 'function' ? posItemSpecLabel(line) : '')
        || (typeof bedsheetSpecLabel === 'function' ? bedsheetSpecLabel(line) : '')
        || line.specLabel || '';
    return `${escapeHtml(line.title)}${spec ? `<span class="inv-line-spec">${escapeHtml(spec)}</span>` : ''}`;
}

function paintInvoice(bill) {
    lastInvoice = bill;
    document.getElementById('invNumber').textContent = bill.number || 'Invoice';
    document.getElementById('invDate').textContent = formatInvDate(bill.createdAt);
    document.getElementById('invPay').textContent = bill.paymentMethod || 'Cash';
    document.getElementById('invCustName').textContent = bill.customerName || 'Walk-in Customer';
    document.getElementById('invCustPhone').textContent = bill.customerPhone || 'No phone on file';
    const items = bill.items || [];
    document.getElementById('invItems').innerHTML = items.map((line) => `
        <tr>
            <td>${invLineQty(line)} ${escapeHtml(invLineUnit(line))}</td>
            <td>${invItemCell(line)}</td>
            <td>${moneyInv(line.rate)}</td>
            <td>${moneyInv(line.total)}</td>
        </tr>`).join('') || '<tr><td colspan="4">No items</td></tr>';
    const a4 = document.getElementById('invA4Items');
    if (a4) {
        a4.innerHTML = items.map((line, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${invItemCell(line)}</td>
                <td>${invLineQty(line)} ${escapeHtml(invLineUnit(line))}</td>
                <td>${moneyInv(line.rate)}</td>
                <td>${moneyInv(line.total)}</td>
            </tr>`).join('') || '<tr><td colspan="5">No items</td></tr>';
    }
    const grand = Number(bill.grandTotal || 0);
    const paid = bill.amountPaid != null ? Number(bill.amountPaid) : grand;
    document.getElementById('invSub').textContent = moneyInv(bill.subTotal);
    const tax = document.getElementById('invTax');
    if (tax) tax.textContent = moneyInv(bill.tax);
    document.getElementById('invDisc').textContent = moneyInv(bill.discount);
    const paidEl = document.getElementById('invPaid');
    if (paidEl) paidEl.textContent = moneyInv(paid);
    document.getElementById('invGrand').textContent = moneyInv(grand);
    paintInvBarcode(bill.number);
    const qr = document.getElementById('invQrMount');
    if (qr) {
        if (bill.stickers && typeof recvLabelSheetHtml === 'function') {
            qr.innerHTML = recvLabelSheetHtml(bill.stickers);
            qr.hidden = false;
        } else {
            qr.innerHTML = '';
            qr.hidden = true;
        }
    }
}
