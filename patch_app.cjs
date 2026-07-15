const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("ProductionStatus\n} from './types';", "ProductionStatus,\n  AppUser\n} from './types';");
code = code.replace("initialOKRs\n} from './initialData';", "initialOKRs,\n  initialUsers\n} from './initialData';");
code = code.replace("import ModuleMarketing from './components/ModuleMarketing';", "import ModuleMarketing from './components/ModuleMarketing';\nimport ModuleConfiguracion from './components/ModuleConfiguracion';");
fs.writeFileSync('src/App.tsx', code);
