const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "            <ModuleIngenieria \n              fichasTecnicas={fichasTecnicas}",
  "            <ModuleIngenieria \n              users={users}\n              fichasTecnicas={fichasTecnicas}"
);

fs.writeFileSync('src/App.tsx', code);
