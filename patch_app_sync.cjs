const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert import
code = code.replace("import ModuleConfiguracion from './components/ModuleConfiguracion';", "import ModuleConfiguracion from './components/ModuleConfiguracion';\nimport { syncToGoogleSheets } from './lib/googleSheets';");

// Sync Order
code = code.replace("setOrders(prev => [newOrder, ...prev]);", "setOrders(prev => [newOrder, ...prev]);\n    syncToGoogleSheets('ADD_ORDER', newOrder);");

// Sync Ficha
code = code.replace("setFichasTecnicas(prev => [newFicha, ...prev]);", "setFichasTecnicas(prev => [newFicha, ...prev]);\n    syncToGoogleSheets('ADD_FICHA', newFicha);");

// Sync Transaction
code = code.replace("setTransactions(prev => [newTx, ...prev]);", "setTransactions(prev => [newTx, ...prev]);\n    syncToGoogleSheets('ADD_TRANSACTION', newTx);");

// Sync User
code = code.replace("setUsers(prev => [...prev, newUser]);", "setUsers(prev => [...prev, newUser]);\n    syncToGoogleSheets('ADD_USER', newUser);");

fs.writeFileSync('src/App.tsx', code);
