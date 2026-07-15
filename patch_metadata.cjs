const fs = require('fs');
let meta = JSON.parse(fs.readFileSync('metadata.json', 'utf-8'));
meta.name = "f-estudio-erp";
fs.writeFileSync('metadata.json', JSON.stringify(meta, null, 2));
