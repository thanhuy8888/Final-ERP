const fs = require('fs');

const filePath = 'frontend/src/locales/vi.json';
const content = fs.readFileSync(filePath, 'utf8');

console.log(`File size: ${content.length} characters`);

try {
    JSON.parse(content);
    console.log("JSON is Valid");
} catch (e) {
    console.log("JSON Error: " + e.message);

    // Attempt to find position
    const match = e.message.match(/position (\d+)/);
    if (match) {
        const pos = parseInt(match[1]);
        console.log(`Error at position: ${pos}`);
        const start = Math.max(0, pos - 50);
        const end = Math.min(content.length, pos + 50);
        console.log("Context:");
        console.log(content.substring(start, end));
        console.log("-".repeat(pos - start) + "^");

        // Hex dump around error
        console.log("\nHex dump:");
        const buffer = fs.readFileSync(filePath);
        const bufStart = Math.max(0, pos - 20);
        const bufEnd = Math.min(buffer.length, pos + 20);
        const slice = buffer.slice(bufStart, bufEnd);
        console.log(slice.toString('hex'));
    }
}
