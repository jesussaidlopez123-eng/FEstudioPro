const fs = require('fs');
let code = fs.readFileSync('src/components/Sidebar.tsx', 'utf-8');

code = code.replace(
  "export default function Sidebar({ activeModule, onModuleChange, userRole, onLogout }: SidebarProps) {",
  "export default function Sidebar({ activeModule, onModuleChange, userRole, onLogout, activeUsername = '' }: SidebarProps & { activeUsername?: string }) {"
);

code = code.replace(
  "{userRole === 'Admin' ? 'AD' : 'OP'}",
  "{activeUsername.slice(0, 2).toUpperCase() || (userRole === 'Admin' ? 'AD' : 'OP')}"
);

code = code.replace(
  "{userRole === 'Admin' ? 'Administrador' : 'Operador Taller'}",
  "{activeUsername || (userRole === 'Admin' ? 'Administrador' : 'Operador Taller')}"
);

fs.writeFileSync('src/components/Sidebar.tsx', code);
