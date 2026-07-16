const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleOperaciones.tsx', 'utf-8');

// 1. Add AppUser to imports if not there
if (code.indexOf('AppUser') === -1) {
  code = code.replace(
    "import { ProductionTask, ProductionStatus, TaskInstructionStep, FinancialTransaction } from '../types';",
    "import { ProductionTask, ProductionStatus, TaskInstructionStep, FinancialTransaction, AppUser } from '../types';"
  );
}

// 2. Add users to Props
code = code.replace(
  "  onAddTransaction?: (transaction: FinancialTransaction) => void;\n}",
  "  onAddTransaction?: (transaction: FinancialTransaction) => void;\n  users?: AppUser[];\n}"
);

code = code.replace(
  "  activeUsername = 'Operador'\n}: ModuleOperacionesProps) {",
  "  activeUsername = 'Operador',\n  users = []\n}: ModuleOperacionesProps) {"
);

// 3. Remove hardcoded artisans array
code = code.replace(
  "  const artisans = ['Carlos Ruiz', 'Martín Gómez', 'Roberto Sosa', 'Álvaro Ramos', 'Oficina Central'];\n",
  ""
);

// 4. Update the select dropdown in Edit Modal
code = code.replace(
  "                    {artisans.map(art => (\n                      <option key={art} value={art}>{art}</option>\n                    ))}",
  `                    {users.filter(u => u.role === 'Operador').map(u => (
                      <option key={u.id} value={u.username}>{u.username}</option>
                    ))}
                    {users.filter(u => u.role === 'Operador').length === 0 && (
                      <option value="Sin Operadores" disabled>No hay operadores</option>
                    )}`
);

// 5. Check if there are other occurrences of artisans
code = code.replace(/artisans\.map/g, "users.filter(u => u.role === 'Operador').map"); // Just in case

fs.writeFileSync('src/components/ModuleOperaciones.tsx', code);
