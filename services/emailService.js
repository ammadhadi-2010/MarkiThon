const nodemailer = require('nodemailer');

function envPass() {
    return String(process.env.EMAIL_PASS || '').replace(/\s+/g, '');
}

function fromAddress() {
    return process.env.EMAIL_FROM
        || `MarkiThon Marketplace <${process.env.EMAIL_USER || 'noreply@markithon.com'}>`;
}

function smtpReady() {
    return Boolean(process.env.EMAIL_USER && envPass());
}

function createTransport() {
    if (!smtpReady()) return null;
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: Number(process.env.EMAIL_PORT || 465),
        secure: process.env.EMAIL_SECURE !== '0',
        auth: {
            user: process.env.EMAIL_USER,
            pass: envPass()
        }
    });
}

async function sendMail({ to, subject, html, text }) {
    const email = String(to || '').trim();
    if (!email || !email.includes('@')) {
        return { skipped: true, reason: 'missing_email' };
    }
    const transporter = createTransport();
    if (!transporter) {
        console.warn('[email] SMTP not configured. Skipping send to', email);
        return { skipped: true, reason: 'not_configured' };
    }
    const info = await transporter.sendMail({
        from: fromAddress(),
        to: email,
        subject,
        html,
        text: text || subject
    });
    return { ok: true, messageId: info.messageId };
}

function escapeHtml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function money(value) {
    return 'Rs. ' + Number(value || 0).toLocaleString('en-PK');
}

async function sendWelcomeEmail(email, shopName) {
    const name = String(shopName || 'your shop').trim() || 'your shop';
    const subject = 'Welcome to MarkiThon';
    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
            <h2>Welcome to MarkiThon</h2>
            <p>Hello,</p>
            <p>Your shopkeeper registration for <strong>${escapeHtml(name)}</strong> was received.</p>
            <p>An admin will review your account. You can sign in after approval.</p>
            <p style="color:#64748b">— Ammad Hadi Stor / MarkiThon Marketplace</p>
        </div>`;
    return sendMail({
        to: email,
        subject,
        html,
        text: `Welcome to MarkiThon. Your registration for ${name} was received.`
    });
}

function orderLinesHtml(items) {
    const rows = Array.isArray(items) ? items : [];
    if (!rows.length) return '<p>No line items listed.</p>';
    return `<table style="width:100%;border-collapse:collapse;margin:12px 0">
        <thead><tr>
            <th style="text-align:left;border-bottom:1px solid #e2e8f0;padding:6px">Item</th>
            <th style="text-align:right;border-bottom:1px solid #e2e8f0;padding:6px">Qty</th>
            <th style="text-align:right;border-bottom:1px solid #e2e8f0;padding:6px">Total</th>
        </tr></thead>
        <tbody>${rows.map((item) => {
            const title = item.title || item.name || item.productName || 'Item';
            const qty = item.qty || item.quantity || item.quantitySold || item.meters || 1;
            const total = item.total != null ? item.total : (Number(item.price || item.rate || 0) * Number(qty));
            return `<tr>
                <td style="padding:6px;border-bottom:1px solid #f1f5f9">${escapeHtml(title)}</td>
                <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:right">${escapeHtml(qty)}</td>
                <td style="padding:6px;border-bottom:1px solid #f1f5f9;text-align:right">${money(total)}</td>
            </tr>`;
        }).join('')}</tbody>
    </table>`;
}

async function sendOrderConfirmation(email, orderDetails) {
    const order = orderDetails || {};
    const number = order.number || order.orderNumber || order.billNumber || 'Order';
    const name = order.customerName || order.customer || 'Customer';
    const total = order.total != null ? order.total : order.grandTotal;
    const shop = order.shopName || order.shop || 'Ammad Hadi Stor';
    const subject = `Order confirmation ${number}`;
    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
            <h2>Order Confirmation</h2>
            <p>Hi ${escapeHtml(name)},</p>
            <p>Thank you for your order from <strong>${escapeHtml(shop)}</strong>.</p>
            <p><strong>Order:</strong> ${escapeHtml(number)}<br>
            <strong>Total:</strong> ${money(total)}<br>
            <strong>Payment:</strong> ${escapeHtml(order.payment || order.paymentMethod || 'Cash')}</p>
            ${orderLinesHtml(order.items)}
            <p style="color:#64748b">— MarkiThon Marketplace</p>
        </div>`;
    return sendMail({
        to: email,
        subject,
        html,
        text: `Order ${number} confirmed. Total ${money(total)}.`
    });
}

async function sendPasswordResetEmail(email, resetToken) {
    const token = String(resetToken || '').trim();
    const base = String(process.env.FRONTEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const link = `${base}/forgot-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
    const subject = 'Reset your MarkiThon password';
    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a">
            <h2>Password Reset</h2>
            <p>Use this code to reset your password:</p>
            <p style="font-size:20px;font-weight:700;letter-spacing:1px">${escapeHtml(token)}</p>
            <p>Or open: <a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>
            <p>This code expires in 1 hour.</p>
            <p style="color:#64748b">— MarkiThon Marketplace</p>
        </div>`;
    return sendMail({
        to: email,
        subject,
        html,
        text: `Your MarkiThon reset code is ${token}. It expires in 1 hour.`
    });
}

function queueEmail(task) {
    Promise.resolve()
        .then(task)
        .catch((error) => console.error('[email]', error.message || error));
}

module.exports = {
    sendWelcomeEmail,
    sendOrderConfirmation,
    sendPasswordResetEmail,
    sendMail,
    queueEmail,
    smtpReady
};
