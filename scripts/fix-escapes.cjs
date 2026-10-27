// Undo double-escaping: turn literal "\\u20b5" sequences back into real \uXXXX escapes.
const fs = require('fs')
const p = 'src/seed.ts'
const s = fs.readFileSync(p, 'utf8')
// currently file contains literal backslash-u sequences inside strings: e.g. 'GH\\u20b5 500'
const fixed = s.replace(/\\\\u([0-9a-fA-F]{4})/g, (_, hex) => '\\u' + hex)
fs.writeFileSync(p, fixed)
console.log('done')
