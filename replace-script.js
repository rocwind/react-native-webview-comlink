// write web.bundle to native script.js
const path = require('path');
const fs = require('fs');

const scriptFile = path.join(__dirname, 'lib/web/web.bundle.js');
const scriptTarget = path.join(__dirname, 'lib/native/script.js');

const contents = fs.readFileSync(scriptFile, 'utf-8');
fs.writeFileSync(
    scriptTarget,
    //                                  \x  -> \\x                   add 'true' to the end, to fix ios inject warnings
    'export const script = `\n' + contents.replace(/\\/g, '\\\\') + '\ntrue`;',
);
