const fs = require('fs');
const path = require('path');

// 1x1 pixel transparent PNG base64 representation
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
const buffer = Buffer.from(base64Png, 'base64');
const targetPath = path.join(__dirname, 'sample.png');

fs.writeFileSync(targetPath, buffer);
console.log(`Successfully generated mock test image at: ${targetPath}`);
