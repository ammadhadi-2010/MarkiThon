function toNum(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}

function calcProfit(purchasePrice, sellPrice) {
    const purchase = toNum(purchasePrice);
    const sell = toNum(sellPrice);
    const amount = sell - purchase;
    const percent = purchase > 0 ? (amount / purchase) * 100 : 0;
    return { amount, percent };
}

function withProductMargins(product) {
    const json = product.toJSON ? product.toJSON() : { ...product };
    json.wholesaleProfit = calcProfit(json.purchasePrice, json.wholesalePrice);
    json.retailProfit = calcProfit(json.purchasePrice, json.retailPrice);
    return json;
}

module.exports = { toNum, calcProfit, withProductMargins };
