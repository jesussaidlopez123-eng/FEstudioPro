const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const helper = `
const safeRemoveItem = (key: string) => {
  try { localStorage.removeItem(key); } catch (e) { console.warn('LocalStorage disabled'); }
};
`;

code = code.replace("export default function App() {", helper + "export default function App() {");

code = code.replace(/localStorage\.removeItem\(/g, "safeRemoveItem(");

fs.writeFileSync('src/App.tsx', code);
