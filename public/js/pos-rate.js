function posMinRateOf(line) {
    return Number(line && line.minSellingRate) || 0;
}

function posRateIsLow(line) {
    const min = posMinRateOf(line);
    const rate = Number(line && line.rate) || 0;
    return min > 0 && rate > 0 && rate < min;
}

function posMinBadgeHtml(line) {
    const min = posMinRateOf(line);
    if (!(min > 0)) return '';
    const warn = posRateIsLow(line) ? ' pos-min-warn' : '';
    return `<span class="pos-min-badge${warn}">Min: Rs. ${min.toLocaleString()}</span>`;
}

function posRateCellHtml(line, index, attr) {
    const warn = posRateIsLow(line) ? ' pos-rate-low' : '';
    const rate = Number(line.rate) || 0;
    return `<td class="pos-rate${warn}" data-label="Unit Price">
        <input class="qty-input pos-rate-input" data-${attr}="${index}" type="number" min="0" step="0.01"
            value="${rate > 0 ? rate : ''}" autocomplete="off" name="${attr}${index}">
        ${posMinBadgeHtml(line)}
    </td>`;
}

function posCopyMinRate(product) {
    return { minSellingRate: Number(product && product.minSellingRate) || 0 };
}

function posPaintRateRow(input, line) {
    const cell = input.closest('.pos-rate') || input.closest('tr')?.querySelector('.pos-rate');
    if (!cell) return;
    cell.classList.toggle('pos-rate-low', posRateIsLow(line));
    const badge = cell.querySelector('.pos-min-badge');
    if (badge) {
        badge.classList.toggle('pos-min-warn', posRateIsLow(line));
    } else {
        cell.insertAdjacentHTML('beforeend', posMinBadgeHtml(line));
    }
    const totalCell = input.closest('tr')?.querySelector('.pos-line-total');
    if (totalCell) {
        totalCell.textContent = ((Number(line.qty) || 0) * (Number(line.rate) || 0)).toLocaleString();
    }
}

function posApplyRateInput(lines, input, key) {
    const index = Number(input.dataset[key]);
    if (!lines[index]) return;
    const rate = Number(input.value);
    lines[index].rate = Number.isFinite(rate) && rate >= 0 ? rate : 0;
    posPaintRateRow(input, lines[index]);
}
