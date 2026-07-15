const fs = require('fs');
let pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
pkg.name = "f-estudio-erp";
pkg.description = "ERP Corporativo de F. Estudio";
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
