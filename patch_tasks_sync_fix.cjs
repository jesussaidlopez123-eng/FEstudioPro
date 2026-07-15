const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "setProductionTasks(prev => [...autoTasks, ...prev]);\\n    handleAddAlert(\\n      'success',", 
  "setProductionTasks(prev => [...autoTasks, ...prev]);\\n    autoTasks.forEach(task => syncToGoogleSheets('ADD_TASK', task));\\n    handleAddAlert(\\n      'success',"
);
fs.writeFileSync('src/App.tsx', code);
