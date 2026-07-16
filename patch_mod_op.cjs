const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleOperaciones.tsx', 'utf-8');

code = code.replace(
  "const randomArtisan = operatorUsers.length > 0 ? operatorUsers[Math.floor(Math.random() * operatorUsers.length)].username : 'Jorge Salmero';",
  "const randomArtisan = operatorUsers.length > 0 ? operatorUsers[Math.floor(Math.random() * operatorUsers.length)].username : 'Oficina Central';"
);

code = code.replace(
  `                    <input\n                      type="text"\n                      placeholder="Ej. Carlos Ruiz"\n                      value={adminSearchArtisan}\n                      onChange={(e) => setAdminSearchArtisan(e.target.value)}\n                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 font-semibold"\n                    />`,
  `                    <select\n                      value={adminSearchArtisan}\n                      onChange={(e) => setAdminSearchArtisan(e.target.value)}\n                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 font-semibold appearance-none cursor-pointer"\n                    >\n                      <option value="">Todos los operadores</option>\n                      {users.filter(u => u.role === 'Operador').map(u => (\n                        <option key={u.id} value={u.username}>{u.username}</option>\n                      ))}\n                    </select>`
);

fs.writeFileSync('src/components/ModuleOperaciones.tsx', code);
