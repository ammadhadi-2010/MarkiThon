const SA_COLORS = ['#8b5cf6', '#22c55e', '#38bdf8', '#f472b6', '#fbbf24', '#94a3b8'];

function saPoint(series, key, index, max, width, height) {
    const pad = 24;
    const x = pad + (index * (width - pad * 2)) / Math.max(1, series.length - 1);
    const y = height - pad - ((series[index][key] || 0) / max) * (height - pad * 2);
    return x + ',' + y;
}

function saSalesChart(series) {
    const width = 560;
    const height = 190;
    const rows = series.length ? series : [{ label: 'Today', current: 0, previous: 0 }];
    const max = Math.max(1, ...rows.map((row) => Math.max(row.current, row.previous)));
    const current = rows.map((row, index) => saPoint(rows, 'current', index, max, width, height)).join(' ');
    const previous = rows.map((row, index) => saPoint(rows, 'previous', index, max, width, height)).join(' ');
    const labels = rows.map((row, index) => {
        const x = 24 + (index * (width - 48)) / Math.max(1, rows.length - 1);
        return `<text x="${x}" y="${height - 4}" fill="#93a0bd" font-size="11" text-anchor="middle">${row.label}</text>`;
    }).join('');
    return `<svg class="sa-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Sales overview">
        <polyline fill="none" stroke="#64748b" stroke-width="2" points="${previous}"></polyline>
        <polyline fill="none" stroke="#60a5fa" stroke-width="3" points="${current}"></polyline>
        ${labels}
    </svg>
    <div class="sa-legend"><span><i style="background:#60a5fa"></i>This week</span><span><i style="background:#64748b"></i>Previous week</span></div>`;
}

function saDonut(categories, products) {
    const rows = categories.length ? categories : [{ name: 'No products yet', total: 1 }];
    const total = categories.reduce((sum, row) => sum + row.total, 0);
    let cursor = 0;
    const stops = rows.map((row, index) => {
        const start = cursor;
        const share = total ? (row.total / total) * 100 : 100;
        cursor += share;
        return SA_COLORS[index % SA_COLORS.length] + ' ' + start + '% ' + cursor + '%';
    }).join(', ');
    const list = (categories.length ? categories : []).map((row, index) => {
        const share = total ? Math.round((row.total / total) * 100) : 0;
        return `<li><span><i class="sa-swatch" style="background:${SA_COLORS[index % SA_COLORS.length]}"></i>${row.name}</span><span>${share}%</span></li>`;
    }).join('') || '<li>No categories yet</li>';
    return `<div class="sa-donut-wrap">
        <div class="sa-donut" style="background:conic-gradient(${stops})"><span><strong>${products}</strong>Products</span></div>
        <ul class="sa-cat">${list}</ul>
    </div>`;
}
