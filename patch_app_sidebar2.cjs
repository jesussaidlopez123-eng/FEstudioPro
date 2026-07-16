const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "userRole={userRole}\n        onLogout={handleLogout}",
  "userRole={userRole}\n        activeUsername={activeUsername}\n        onLogout={handleLogout}"
);

fs.writeFileSync('src/App.tsx', code);
