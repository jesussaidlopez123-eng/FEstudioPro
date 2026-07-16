const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleOperaciones.tsx', 'utf-8');

code = code.replace(
  "const randomArtisan = artisans[Math.floor(Math.random() * 4)];",
  "const operatorUsers = users.filter(u => u.role === 'Operador');\n    const randomArtisan = operatorUsers.length > 0 ? operatorUsers[Math.floor(Math.random() * operatorUsers.length)].username : 'Jorge Salmero';"
);

fs.writeFileSync('src/components/ModuleOperaciones.tsx', code);
