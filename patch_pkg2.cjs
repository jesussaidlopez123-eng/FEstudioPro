const fs = require('fs');
let code = fs.readFileSync('package.json', 'utf-8');
const pkg = JSON.parse(code);
pkg.scripts.build = "vite build";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
