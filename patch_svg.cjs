const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleDireccion.tsx', 'utf-8');

code = code.replace(/520 \/ \(totalItems - 1\)/g, '520 / Math.max(1, totalItems - 1)');
code = code.replace(/520 \/ \(orderedMonths\.length - 1\)/g, '520 / Math.max(1, orderedMonths.length - 1)');

fs.writeFileSync('src/components/ModuleDireccion.tsx', code);
