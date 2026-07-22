const fs = require('fs');
let code = fs.readFileSync('package.json', 'utf-8');
const pkg = JSON.parse(code);
delete pkg.scripts.start;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
