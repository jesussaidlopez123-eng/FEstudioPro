const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "assignedTo: 'Oficina Central',",
  "assignedTo: users.filter(u => u.role === 'Operador')[0]?.username || 'Oficina Central',"
);

code = code.replace(
  "assignedTo: assignedTo || 'Jorge Salmero',",
  "assignedTo: assignedTo || users.filter(u => u.role === 'Operador')[0]?.username || 'Oficina Central',"
);

code = code.replace(
  "asignado a ${assignedTo || 'Jorge Salmero'}",
  "asignado a ${assignedTo || users.filter(u => u.role === 'Operador')[0]?.username || 'Oficina Central'}"
);

fs.writeFileSync('src/App.tsx', code);
