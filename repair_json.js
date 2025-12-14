const fs = require('fs');
const path = require('path');

const filePath = 'frontend/src/locales/vi.json';
let content = fs.readFileSync(filePath, 'utf8');

const key = '"stockLookup": {';
const keyIndex = content.lastIndexOf(key);

if (keyIndex === -1) {
    console.error("Could not find stockLookup key!");
    process.exit(1);
}

// Keep everything before the key, including the comma and newline/spaces
const prefix = content.substring(0, keyIndex);

// Define the clean stockLookup block
const cleanBlock = `"stockLookup": {
        "stockStatus": "Trạng thái tồn kho",
        "totalSKU": "Tổng SKU",
        "criticalStock": "Rất thấp",
        "lowStock": "Thấp",
        "goodStock": "Tốt",
        "outOfStock": "Hết hàng",
        "searchPlaceholder": "Tìm theo tên sản phẩm, mã SKU...",
        "allStatus": "Tất cả",
        "store": "Cửa hàng",
        "product": "Sản phẩm",
        "variant": "Biến thể",
        "stock": "Tồn kho",
        "status": "Trạng thái",
        "action": "Hành động",
        "showing": "Hiển thị {{count}} / {{total}} sản phẩm",
        "suggest": "Gợi ý",
        "findBranch": "Tìm kho",
        "suggestTitle": "✨ Gợi ý sản phẩm thay thế",
        "branchTitle": "🏢 Tồn kho chi nhánh khác",
        "close": "Đóng",
        "suggestMsg": "Sản phẩm tương tự thay thế:",
        "remaining": "Còn:",
        "noSuggestion": "Không tìm thấy sản phẩm tương tự.",
        "branchMsg": "Tồn kho tại các chi nhánh khác:",
        "noBranchData": "Không tìm thấy thông tin tại các chi nhánh khác.",
        "inStock": "Còn {{count}}",
        "soldOut": "Hết hàng"
    }
}`;

const newContent = prefix + cleanBlock;

try {
    JSON.parse(newContent);
    console.log("Constructed JSON is valid. Writing file...");
    fs.writeFileSync(filePath, newContent, 'utf8');
} catch (e) {
    console.error("Constructed JSON is STILL invalid: " + e.message);
    // Try adding one more curly brace?
    try {
        const withBrace = newContent + "\n}";
        JSON.parse(withBrace);
        console.log("Constructed JSON (with extra brace) is valid. Writing file...");
        fs.writeFileSync(filePath, withBrace, 'utf8');
    } catch (e2) {
        console.error("Failed even with extra brace: " + e2.message);
    }
}
