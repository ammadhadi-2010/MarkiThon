let activeReport = 'sales';

function rangeQuery() {
    const from = document.getElementById('rpFrom').value;
    const to = document.getElementById('rpTo').value;
    const params = new URLSearchParams();
    if (from) {
        params.set('from', from);
        params.set('startDate', from);
    }
    if (to) {
        params.set('to', to);
        params.set('endDate', to);
    }
    return params.toString();
}

function setDefaultDates() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const iso = (d) => d.toISOString().slice(0, 10);
    document.getElementById('rpFrom').value = iso(start);
    document.getElementById('rpTo').value = iso(now);
}

function renderReportCards() {
    document.getElementById('rpGrid').innerHTML = REPORT_CARDS.map((card) => `
        <button type="button" class="report-card" data-report="${card[0]}">
            <div class="icon-badge ${card[3]}">${card[4]}</div>
            <h3>${card[1]}</h3>
            <p>${card[2]}</p>
        </button>
    `).join('');
}

function objectRows(payload) {
    const rows = payload.rows || payload.suppliers || [];
    return Array.isArray(rows) ? rows : [];
}

function paintReportMeta(type, data) {
    const el = document.getElementById('rpSummary');
    if (!el) return;
    if (type === 'profit') {
        el.hidden = false;
        el.textContent = `Gross profit Rs. ${Number(data.grossProfit || 0).toLocaleString()} · Shop expenses Rs. ${Number(data.expenseTotal || 0).toLocaleString()} · Net profit Rs. ${Number(data.netProfit || 0).toLocaleString()}`;
        return;
    }
    if (type === 'expenses') {
        el.hidden = false;
        el.textContent = `Total expenses in range: Rs. ${Number(data.total || 0).toLocaleString()}`;
        return;
    }
    el.hidden = true;
    el.textContent = '';
}

function fillModalTable(rows) {
    const head = document.getElementById('rpHead');
    const body = document.getElementById('rpBody');
    if (!rows.length) {
        head.innerHTML = '';
        body.innerHTML = '<tr><td class="empty">No records in this date range.</td></tr>';
        return;
    }
    const keys = Object.keys(rows[0]);
    head.innerHTML = `<tr>${keys.map((k) => `<th>${escapeHtml(k)}</th>`).join('')}</tr>`;
    body.innerHTML = rows.map((row) =>
        `<tr>${keys.map((k) => `<td>${escapeHtml(row[k])}</td>`).join('')}</tr>`
    ).join('');
}

async function openReport(type) {
    activeReport = type;
    const card = REPORT_CARDS.find((c) => c[0] === type);
    document.getElementById('rpModalTitle').textContent = card ? card[1] : 'Report';
    const tools = document.getElementById('rpSupplierTools');
    if (type === 'suppliers' && typeof openSupplierReport === 'function') {
        if (typeof hideSalesOverview === 'function') hideSalesOverview();
        bindSupplierReport();
        await openSupplierReport();
        return;
    }
    if (tools) tools.hidden = true;
    const qs = rangeQuery();
    const data = await api.get(`/api/reports/${type}${qs ? `?${qs}` : ''}`);
    if (type === 'sales' && typeof paintSalesReport === 'function') {
        paintSalesReport(data);
    } else if (type === 'expenses' && typeof paintExpenseReport === 'function') {
        paintExpenseReport(data);
    } else {
        if (typeof hideSalesOverview === 'function') hideSalesOverview();
        fillModalTable(objectRows(data));
        paintReportMeta(type, data);
    }
    if (data.message && !(data.rows && data.rows.length)) showToast(data.message);
    showReportPage(true);
}

function setHidden(id, hidden) {
    const el = document.getElementById(id);
    if (el) el.hidden = hidden;
}

function showReportPage(open) {
    const root = document.getElementById('view-reports');
    if (root) root.classList.toggle('rp-open', !!open);
    setHidden('rpGrid', !!open);
    setHidden('rpModal', !open);
    setHidden('rpClose', !open);
    setHidden('rpHomeTitle', !!open);
    setHidden('rpModalTitle', !open);
    setHidden('rpExport', !!open);
    setHidden('rpModalExport', !open);
    if (!open && typeof hideSalesOverview === 'function') hideSalesOverview();
}

function exportActive() {
    const qs = rangeQuery();
    const url = `/api/reports/export?type=${encodeURIComponent(activeReport)}${qs ? `&${qs}` : ''}`;
    window.open(url, '_blank');
    const card = REPORT_CARDS.find((c) => c[0] === activeReport);
    api.post('/api/reports/sales/recent-downloads', {
        title: `${card ? card[1] : 'Report'}`,
        reportType: activeReport,
        rangeLabel: `${document.getElementById('rpFrom').value} - ${document.getElementById('rpTo').value}`
    }).catch(() => {});
}

document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('view-reports');
    root.innerHTML = reportsMarkup();
    disableAutofill(root);
    setDefaultDates();
    renderReportCards();
    document.getElementById('rpGrid').addEventListener('click', (e) => {
        const card = e.target.closest('[data-report]');
        if (card) openReport(card.dataset.report).catch((err) => showToast(err.message));
    });
    document.getElementById('rpClose').addEventListener('click', () => {
        showReportPage(false);
        const tools = document.getElementById('rpSupplierTools');
        if (tools) tools.hidden = true;
        const pay = document.getElementById('rpPayModal');
        const led = document.getElementById('rpLedModal');
        if (pay) pay.hidden = true;
        if (led) led.hidden = true;
    });
    document.getElementById('rpExport').addEventListener('click', exportActive);
    document.getElementById('rpFrom').addEventListener('change', () => {
        if (!document.getElementById('rpModal').hidden) {
            openReport(activeReport).catch((err) => showToast(err.message));
        }
    });
    document.getElementById('rpTo').addEventListener('change', () => {
        if (!document.getElementById('rpModal').hidden) {
            openReport(activeReport).catch((err) => showToast(err.message));
        }
    });
    document.getElementById('rpModalExport').addEventListener('click', () => {
        if (activeReport === 'suppliers' && typeof exportSupplierReportCsv === 'function') {
            exportSupplierReportCsv();
            return;
        }
        exportActive();
    });
});
