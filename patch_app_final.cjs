const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("ProductionStatus\n} from './types';", "ProductionStatus,\n  AppUser\n} from './types';");
code = code.replace("initialOKRs\n} from './initialData';", "initialOKRs,\n  initialUsers\n} from './initialData';");

const usersState = `\n  const [users, setUsers] = useState<AppUser[]>(() => {
    const data = localStorage.getItem('f_estudio_db_users');
    return data ? JSON.parse(data) : initialUsers;
  });\n`;

code = code.replace("const [okrs, setOkrs] = useState<OKR[]>(() => {", usersState + "const [okrs, setOkrs] = useState<OKR[]>(() => {");

const usersEffect = `\n  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);\n`;

code = code.replace("useEffect(() => {\n    try {\n      localStorage.setItem('f_estudio_db_okrs'", usersEffect + "useEffect(() => {\n    try {\n      localStorage.setItem('f_estudio_db_okrs'");

code = code.replace("<Login onLogin={handleLogin} />", "<Login onLogin={handleLogin} users={users} />");

fs.writeFileSync('src/App.tsx', code);
