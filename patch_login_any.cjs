const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
code = code.replace('<Login onLogin={handleLogin as any} users={users} />', '<Login onLogin={handleLogin} users={users} />');
fs.writeFileSync('src/App.tsx', code);
