const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace("import { UserRole } from '../types';", "import { UserRole, AppUser } from '../types';\nimport { AlertCircle } from 'lucide-react';");
code = code.replace("interface LoginProps {\n  onLogin: (role: UserRole) => void;\n}", "interface LoginProps {\n  onLogin: (role: UserRole) => void;\n  users?: AppUser[];\n}");
code = code.replace("export default function Login({ onLogin }: LoginProps) {", "export default function Login({ onLogin, users = [] }: LoginProps) {");

const loginLogic = `
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const user = users.find(u => u.username === username);
      if (!user) {
        setError('Usuario no encontrado');
        setLoading(false);
        return;
      }
      
      if (user.passwordHash !== password) {
        setError('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      onLogin(user.role);
      setLoading(false);
    }, 600);
  };
`;

code = code.replace(/const \[role, setRole\] = useState<UserRole>\('Admin'\);\s*const \[password, setPassword\] = useState\(''\);\s*const \[showPassword, setShowPassword\] = useState\(false\);\s*const \[loading, setLoading\] = useState\(false\);\s*const \[error, setError\] = useState\(''\);\s*const handleSubmit = \(e: React.FormEvent\) => {[\s\S]*?};\s*/, "const [password, setPassword] = useState('');\n  const [showPassword, setShowPassword] = useState(false);\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState('');\n" + loginLogic);

code = code.replace(/<label className="block text-xs font-medium text-slate-400 mb-1\.5">\s*Perfil de Acceso\s*<\/label>[\s\S]*?<\/div>/, `<label className="block text-xs font-medium text-slate-400 mb-1.5">
              Usuario de Acceso
            </label>
            <div className="relative">
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-3 px-4 pr-10 bg-[#080f1e]/80 border border-[#1e293b] rounded-lg text-white text-sm outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer font-medium"
                id="login-role-select"
                required
              >
                <option value="" disabled>Selecciona un usuario</option>
                {users.map(u => (
                  <option key={u.id} value={u.username}>{u.username} ({u.role})</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>`);

code = code.replace(/<div className="flex items-center text-xs text-slate-500 gap-1\.5 py-1">\s*<Shield size={14} className="text-blue-500\/80" \/>\s*<span>Acceso restringido para personal autorizado de F. Estudio.<\/span>\s*<\/div>/, `<div className="flex items-center text-xs text-slate-500 gap-1.5 py-1">
            <Shield size={14} className="text-blue-500/80" />
            <span>Acceso restringido para personal autorizado de F. Estudio.</span>
          </div>
          {error && (
            <div className="text-red-400 text-xs flex items-center gap-1.5 bg-red-500/10 p-2 rounded border border-red-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}`);

code = code.replace('placeholder="Contraseña de acceso (Cualquiera)"', 'placeholder="Contraseña de acceso"');

fs.writeFileSync('src/components/Login.tsx', code);
