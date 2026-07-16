const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleIngenieria.tsx', 'utf-8');

const operators = `                      {users.filter(u => u.role === 'Operador').map(u => (
                        <option key={u.id} value={u.username}>{u.username} (Operador)</option>
                      ))}
                      {users.filter(u => u.role === 'Operador').length === 0 && (
                        <option value="Sin Operadores" disabled>No hay operadores registrados</option>
                      )}`;

code = code.replace(
  /<option value="Jorge Salmero">Jorge Salmero \(Mesa y Carpintería\)<\/option>\s*<option value="Martín Gómez">Martín Gómez \(Estructura y Soldadura\)<\/option>\s*<option value="Roberto Sosa">Roberto Sosa \(Pintura y Acabados\)<\/option>\s*<option value="Álvaro Ramos">Álvaro Ramos \(Ensamble y Calidad\)<\/option>\s*<option value="Oficina Central">Oficina Central \(Oficina\)<\/option>/g,
  operators
);

// Also set default assignedTo dynamically
code = code.replace(
  "const [queueAssignedTo, setQueueAssignedTo] = useState('Jorge Salmero');",
  "const defaultOperator = users.find(u => u.role === 'Operador')?.username || 'Sin Asignar';\n  const [queueAssignedTo, setQueueAssignedTo] = useState(defaultOperator);"
);
code = code.replace(
  "const [dqAssignedTo, setDqAssignedTo] = useState('Jorge Salmero');",
  "const [dqAssignedTo, setDqAssignedTo] = useState(defaultOperator);"
);

fs.writeFileSync('src/components/ModuleIngenieria.tsx', code);
