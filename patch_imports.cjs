const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace("ProductionStatus\n} from './types';", "ProductionStatus,\n  AppUser\n} from './types';");
code = code.replace(/ProductionStatus \} from '\.\/types';/g, "ProductionStatus, AppUser } from './types';");
code = code.replace(/initialOKRs\n\} from '\.\/initialData';/g, "initialOKRs,\n  initialUsers\n} from './initialData';");
code = code.replace(/initialOKRs \} from '\.\/initialData';/g, "initialOKRs, initialUsers } from './initialData';");
code = code.replace(/ProductionStatus[\s]*\} from '\.\/types';/m, "ProductionStatus,\n  AppUser\n} from './types';");
code = code.replace(/initialOKRs[\s]*\} from '\.\/initialData';/m, "initialOKRs,\n  initialUsers\n} from './initialData';");
fs.writeFileSync('src/App.tsx', code);
