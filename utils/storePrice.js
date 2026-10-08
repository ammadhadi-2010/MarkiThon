function toNum(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function resolveStorePrice(row) {
    const online = toNum(
        row.onlineSellingPrice != null ? row.onlineSellingPrice
            : (row.storeOnlinePrice != null ? row.storeOnlinePrice
                : (row.onlinePrice != null ? row.onlinePrice : row.retailPrice))
    );
    const discount = toNum(
        row.discountPrice != null ? row.discountPrice
            : (row.storeDiscountPrice != null ? row.storeDiscountPrice : row.wasPrice)
    );
    let pct = toNum(row.discountPercent != null ? row.discountPercent : row.discountPct);
    let finalPrice = online;
    let hasDiscount = false;
    if (online > 0 && discount > 0 && discount < online) {
        finalPrice = Math.max(0, online - discount);
        if (!(pct > 0)) pct = Math.round((discount / online) * 100);
        hasDiscount = finalPrice < online;
    } else if (online > 0 && discount > online) {
        finalPrice = online;
        if (!(pct > 0)) pct = Math.round(((discount - online) / discount) * 100);
        hasDiscount = pct > 0;
        return {
            onlineSellingPrice: discount,
            discountPrice: discount - online,
            finalPrice: online,
            discountPercent: pct,
            hasDiscount: true
        };
    }
    return {
        onlineSellingPrice: online,
        discountPrice: hasDiscount ? discount : 0,
        finalPrice: hasDiscount ? finalPrice : online,
        discountPercent: hasDiscount ? pct : 0,
        hasDiscount
    };
}

module.exports = { resolveStorePrice, toNum };
