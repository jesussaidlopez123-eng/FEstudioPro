const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("ProductionStatus } from './types';", "ProductionStatus, AppUser } from './types';");
code = code.replace("initialOKRs } from './initialData';", "initialOKRs, initialUsers } from './initialData';");
fs.writeFileSync('src/App.tsx', code);
