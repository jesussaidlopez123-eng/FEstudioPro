const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "setProductionTasks(prev => [...autoTasks, ...prev]);\\n    handleAddAlert('info', 'Producción Programada', \\`Se programó producción de \${quantity}x \${ficha.name}.\\`);", 
  "setProductionTasks(prev => [...autoTasks, ...prev]);\\n    autoTasks.forEach(task => syncToGoogleSheets('ADD_TASK', task));\\n    handleAddAlert('info', 'Producción Programada', \\`Se programó producción de \${quantity}x \${ficha.name}.\\`);"
);
fs.writeFileSync('src/App.tsx', code);
