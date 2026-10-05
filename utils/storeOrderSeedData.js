function line(title, sku, qty, price, discount) {
    const disc = Number(discount || 0);
    return { title, sku, qty, price, discount: disc, total: qty * price - disc };
}

function demoAddress(house) {
    return `House # ${house}, Street 3, Model Town, Multan, Punjab, Pakistan`;
}

function demoDetails(phone, house, extra) {
    return Object.assign({
        whatsapp: phone,
        address: demoAddress(house),
        mapUrl: 'https://maps.google.com/?q=Model+Town+Multan',
        deliveryMethod: 'Home Delivery',
        eta: '2 - 3 Working Days',
        trackingNumber: 'N/A',
        deliveryCharges: 0
    }, extra || {});
}

function row(orderNumber, at, name, phone, items, payment, status, house, extra) {
    const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const discount = items.reduce((sum, item) => sum + Number(item.discount || 0), 0);
    const details = demoDetails(phone, house, extra);
    const delivery = Number(details.deliveryCharges || 0);
    if (details.subtotal == null) details.subtotal = subtotal;
    if (details.discount == null) details.discount = discount;
    details.paymentStatus = payment === 'Paid' ? 'Paid' : 'Pending';
    details.timeline = { New: new Date(at).toISOString() };
    return {
        orderNumber,
        customerName: name,
        customerPhone: phone,
        items,
        itemCount: items.reduce((sum, item) => sum + item.qty, 0),
        total: Number(details.subtotal) - Number(details.discount) + delivery,
        payment,
        status,
        details,
        createdAt: new Date(at),
        updatedAt: new Date(at),
        ShopId: 1
    };
}

function demoOrders() {
    const aqua = [
        line('Refinda Aqua - Bedsheet', 'RED-SHEET-001', 1, 2500, 0),
        line('Premium Cotton', 'COTTON-001', 2, 1100, 200),
        line('Towel Set', 'TOWEL-001', 1, 750, 0),
        line('Pillow Cover Set', 'PILLOW-001', 1, 450, 0),
        line('Premium Linen', 'LINEN-001', 1, 1300, 100)
    ];
    return [
        row('MK-10012', '2026-09-17T15:45:00', 'Usman Ali', '03001234567',
            [line('Korean Mink Blanket', 'BLNK-001', 2, 1800, 0), line('Pillow Pair', 'PIL-002', 1, 1200, 0)],
            'Paid', 'New', 8),
        row('MK-10011', '2026-09-17T13:22:00', 'Ayesha Khan', '03211223344',
            [line('Cotton Bedsheet Set', 'SHT-011', 2, 1350, 0)], 'Paid', 'Confirmed', 9),
        row('MK-10010', '2026-09-16T17:18:00', 'Bilal Ahmed', '03129876543', aqua,
            'COD', 'Processing', 12, { deliveryCharges: 350, subtotal: 8900, discount: 300 }),
        row('MK-10009', '2026-09-16T14:05:00', 'Sana Fatima', '03006781234',
            [line('Bath Towel Pack', 'TWL-009', 1, 1200, 0)], 'Paid', 'Dispatched', 14),
        row('MK-10008', '2026-09-15T18:40:00', 'Zain Sheikh', '03312345678',
            [line('Queen Bedsheet', 'SHT-008', 2, 1840, 0), line('Cushion Cover', 'CSH-008', 2, 1000, 0)],
            'Paid', 'Completed', 16),
        row('MK-10007', '2026-09-15T11:30:00', 'Hina Butt', '03005551212',
            [line('Kids Blanket', 'BLNK-007', 2, 1700, 0)], 'COD', 'Cancelled', 18),
        row('MK-10006', '2026-09-14T16:12:00', 'Farhan Ali', '03219876540',
            [line('Home Towel Set', 'TWL-006', 3, 1366, 0)], 'Paid', 'Confirmed', 20),
        row('MK-10005', '2026-09-14T12:05:00', 'Nadia Malik', '03145678901',
            [line('Face Towel Pack', 'TWL-005', 1, 950, 0)], 'Paid', 'Processing', 21),
        row('MK-10004', '2026-09-13T10:20:00', 'Tahir Mehmood', '03007778899',
            [line('King Bedsheet', 'SHT-004', 4, 1600, 0), line('Pillow Pair', 'PIL-004', 2, 1165, 0)],
            'Paid', 'Dispatched', 22),
        row('MK-10003', '2026-09-13T09:05:00', 'Rabia Noor', '03337889900',
            [line('Cotton Suit Length', 'FAB-003', 2, 1225, 0)], 'Paid', 'Completed', 24),
        row('MK-10002', '2026-09-12T16:40:00', 'Hamza Tariq', '03001112233',
            [line('Fleece Blanket', 'BLNK-002', 1, 2200, 0), line('Towel', 'TWL-002', 1, 700, 0)],
            'Paid', 'New', 26),
        row('MK-10001', '2026-09-12T11:10:00', 'Iqra Shah', '03224445566',
            [line('Printed Bedsheet', 'SHT-001', 2, 1550, 0)], 'COD', 'Confirmed', 28)
    ];
}

module.exports = { demoOrders };
