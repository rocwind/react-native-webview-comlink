const fs = require("fs");

const file = 'lib/native.bundle.js';
const contents = fs.readFileSync(file).toString();

const lines = contents.split('\n');
const start = lines.findIndex(line => line.includes('POLYFILL_BEGIN'));
const end = lines.findIndex(line => line.includes('POLYFILL_END')) + 1;
const polyfill = lines.splice(start, end - start);

for (let i = 0; i < polyfill.length; i++) {
    lines.splice(i, 0, polyfill[i]);
}

fs.writeFileSync(file, lines.join('\n'));
