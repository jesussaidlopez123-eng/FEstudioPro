const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleOperaciones.tsx', 'utf-8');

// 1. Update Props
code = code.replace(
  "userRole: 'Admin' | 'Operador';",
  "userRole: 'Admin' | 'Operador';\n  activeUsername?: string;"
);

code = code.replace(
  "onAddTransaction,\n}: ModuleOperacionesProps) {",
  "onAddTransaction,\n  activeUsername = 'Operador'\n}: ModuleOperacionesProps) {"
);
code = code.replace(
  "onAddTransaction\n}: ModuleOperacionesProps) {",
  "onAddTransaction,\n  activeUsername = 'Operador'\n}: ModuleOperacionesProps) {"
);

// Fallback just in case destructuring looks different
if (code.indexOf("activeUsername = 'Operador'") === -1) {
  code = code.replace(
    "onAddTransaction",
    "onAddTransaction, activeUsername = 'Operador'"
  );
}

// 2. Remove the state variable
code = code.replace(
  "const [operatorSelectedArtisan, setOperatorSelectedArtisan] = useState<string>('Carlos Ruiz');\n",
  ""
);

// 3. Replace all usage of operatorSelectedArtisan with activeUsername
code = code.replace(/operatorSelectedArtisan/g, "activeUsername");

// 4. Remove the dropdown from the UI
const dropStart = "        {/* Quick artisan profile filter switcher */}";
const dropEnd = "        </div>\n\n        {/* Header Tabs Navigation */}";

const dropStartIdx = code.indexOf(dropStart);
const dropEndIdx = code.indexOf(dropEnd);
if (dropStartIdx !== -1 && dropEndIdx !== -1) {
    code = code.slice(0, dropStartIdx) + code.slice(dropEndIdx + "        </div>\n".length);
}

// If the previous replace failed because the comment is different, let's try regex:
code = code.replace(/\{\/\* Quick artisan profile filter switcher \*\/\}.*?<\/div>/s, "");

fs.writeFileSync('src/components/ModuleOperaciones.tsx', code);
