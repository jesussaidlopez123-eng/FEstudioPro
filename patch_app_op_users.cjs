const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "              onUpdateTaskProgress={handleUpdateTaskProgress}\n              userRole={userRole}",
  "              onUpdateTaskProgress={handleUpdateTaskProgress}\n              userRole={userRole}\n              users={users}"
);

fs.writeFileSync('src/App.tsx', code);
