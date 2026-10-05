const Product = require('../models/Product');
const { formatBedsheetSpec } = require('./bedsheetCatalog');
const { formatBlanketSpec } = require('./blanketCatalog');

const productInclude = {
    model: Product,
    attributes: [
        'id', 'title', 'sku', 'category', 'bedsheetSize', 'bedsheetSetType',
        'bedsheetDimensions', 'pillowCoverSize', 'pillowCoverCount',
        'bedsheetWeight', 'bedsheetWeightUnit',
        'blanketPly', 'blanketSize', 'blanketWeight', 'blanketMaterial', 'fabricType'
    ]
};

function mapItems(items) {
    return (items || []).map((row) => {
        const item = row.toJSON ? row.toJSON() : row;
        const product = item.Product || {};
        return {
            productId: item.ProductId,
            title: product.title || 'Product',
            sku: product.sku || '',
            quantityMeters: item.quantityMeters,
            quantitySold: item.quantitySold,
            sellUnit: item.sellUnit,
            rate: item.rate,
            total: item.total,
            category: product.category || '',
            bedsheetSize: product.bedsheetSize || '',
            bedsheetSetType: product.bedsheetSetType || '',
            bedsheetDimensions: product.bedsheetDimensions || '',
            pillowCoverSize: product.pillowCoverSize || '',
            pillowCoverCount: product.pillowCoverCount,
            bedsheetWeight: product.bedsheetWeight,
            bedsheetWeightUnit: product.bedsheetWeightUnit || '',
            blanketPly: product.blanketPly || '',
            blanketSize: product.blanketSize || '',
            blanketWeight: product.blanketWeight,
            blanketMaterial: product.blanketMaterial || '',
            fabricType: product.fabricType || '',
            specLabel: formatBlanketSpec(product) || formatBedsheetSpec(product)
        };
    });
}

function asInvoice(row, channel) {
    const json = row.toJSON ? row.toJSON() : row;
    return {
        id: json.id,
        channel,
        number: json.billNumber || json.orderNumber,
        customerName: json.customerName,
        customerPhone: json.customerPhone || '',
        subTotal: json.subTotal,
        discount: json.discount,
        grandTotal: json.grandTotal,
        paymentMethod: json.paymentMethod,
        notes: json.notes || '',
        createdAt: json.createdAt,
        items: mapItems(json.items)
    };
}

module.exports = { productInclude, asInvoice };
