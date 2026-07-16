const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleIngenieria.tsx', 'utf-8');

// 1. Add AppUser to imports if not there
if (code.indexOf('AppUser') === -1) {
  code = code.replace(
    "import { FichaTecnica } from '../types';",
    "import { FichaTecnica, AppUser } from '../types';"
  );
}

// 2. Add users to Props
code = code.replace(
  "  onAddTaskToQueue: (ficha: FichaTecnica, clientName: string, quantity: number, assignedTo?: string) => void;\n}",
  "  onAddTaskToQueue: (ficha: FichaTecnica, clientName: string, quantity: number, assignedTo?: string) => void;\n  users?: AppUser[];\n}"
);

code = code.replace(
  "  onAddTaskToQueue\n}: ModuleIngenieriaProps) {",
  "  onAddTaskToQueue,\n  users = []\n}: ModuleIngenieriaProps) {"
);
if (code.indexOf("users = []") === -1) {
  code = code.replace(
    "  onAddTaskToQueue,",
    "  onAddTaskToQueue,\n  users = [],"
  );
}

fs.writeFileSync('src/components/ModuleIngenieria.tsx', code);
