const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleOperaciones.tsx', 'utf-8');

const helper = `
// Safe local storage helper
const safeGetItem = (key: string) => {
  try { return localStorage.getItem(key); } catch (e) { return null; }
};
const safeSetItem = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } catch (e) { console.warn('LocalStorage disabled'); }
};

export default function ModuleOperaciones({`;

code = code.replace("export default function ModuleOperaciones({", helper);

code = code.replace(/localStorage\.getItem\(/g, "safeGetItem(");
code = code.replace(/localStorage\.setItem\(/g, "safeSetItem(");

fs.writeFileSync('src/components/ModuleOperaciones.tsx', code);
