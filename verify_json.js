const fs = require('fs');
const path = require('path');

const files = [
    'frontend/src/locales/vi.json',
    'frontend/src/locales/en.json'
];

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        JSON.parse(content);
        console.log(`✅ ${file} is valid JSON.`);
    } catch (e) {
        console.error(`❌ ${file} has INVALID JSON:`, e.message);
    }
});
