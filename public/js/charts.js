function money(value) {
    return `Rs. ${Number(value || 0).toLocaleString()}`;
}

function shortDate(label) {
    const d = new Date(label);
    if (Number.isNaN(d.getTime())) return String(label);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function lineContext(canvas) {
    const parent = canvas.parentElement;
    canvas.style.width = '100%';
    canvas.style.height = '220px';
    const cssW = Math.max(parent ? parent.clientWidth : 0, 200);
    const cssH = 220;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    return { ctx, w: cssW, h: cssH };
}

function donutContext(canvas) {
    const size = 180;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    return { ctx, size };
}

function showChartStatus(canvas, text) {
    const wrap = canvas.parentElement;
    let status = wrap.querySelector('.chart-status');
    if (!status) {
        status = document.createElement('div');
        status.className = 'chart-status';
        wrap.appendChild(status);
    }
    status.innerHTML = text ? `<span class="spinner"></span>${text}` : '';
    status.hidden = !text;
}

function drawLineChart(canvas, points) {
    showChartStatus(canvas, '');
    const { ctx, w, h } = lineContext(canvas);
    const pad = { l: 8, r: 8, t: 16, b: 28 };
    if (!points || !points.length) {
        showChartStatus(canvas, 'No sales in this range');
        return;
    }
    const max = Math.max(...points.map((p) => Number(p.total) || 0), 1);
    const innerW = w - pad.l - pad.r;
    const innerH = h - pad.t - pad.b;
    const step = points.length === 1 ? innerW : innerW / (points.length - 1);
    const coords = points.map((p, i) => ({
        x: pad.l + i * step,
        y: pad.t + innerH - ((Number(p.total) || 0) / max) * innerH,
        ...p
    }));
    ctx.beginPath();
    coords.forEach((c, i) => (i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y)));
    ctx.lineTo(coords[coords.length - 1].x, pad.t + innerH);
    ctx.lineTo(coords[0].x, pad.t + innerH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.16)';
    ctx.fill();
    ctx.beginPath();
    coords.forEach((c, i) => (i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y)));
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    canvas.onmousemove = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        let nearest = coords[0];
        coords.forEach((c) => {
            if (Math.abs(c.x - x) < Math.abs(nearest.x - x)) nearest = c;
        });
        const tip = canvas.parentElement.querySelector('.chart-tip');
        if (!tip) return;
        tip.hidden = false;
        tip.textContent = `${shortDate(nearest.label)}: ${money(nearest.total)}`;
    };
}

function drawDonut(canvas, rows) {
    showChartStatus(canvas, '');
    const { ctx, size } = donutContext(canvas);
    const colors = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#a855f7', '#06b6d4', '#f43f5e'];
    const active = (rows || []).filter((row) => Number(row.total) > 0);
    const grand = active.reduce((s, r) => s + Number(r.total || 0), 0);
    if (!grand) {
        showChartStatus(canvas, 'No category sales yet');
        return;
    }
    const cx = size / 2;
    const cy = size / 2;
    const radius = 72;
    let angle = -Math.PI / 2;
    active.forEach((row, i) => {
        const slice = (Number(row.total) / grand) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, angle, angle + Math.max(slice, 0.02));
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        angle += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.fillStyle = '#161f36';
    ctx.fill();
    ctx.fillStyle = '#93c5fd';
    ctx.font = '11px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Total Sales', cx, cy - 6);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 12px Segoe UI';
    ctx.fillText(money(grand), cx, cy + 12);
}
