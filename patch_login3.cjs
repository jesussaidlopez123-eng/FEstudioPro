const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

const errorBlock = `
          {error && (
            <div className="text-red-400 text-xs flex items-center gap-1.5 bg-red-500/10 p-2 rounded border border-red-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}
`;

code = code.replace("<span>Acceso restringido para personal autorizado de F. Estudio.</span>\n          </div>", "<span>Acceso restringido para personal autorizado de F. Estudio.</span>\n          </div>" + errorBlock);
fs.writeFileSync('src/components/Login.tsx', code);
