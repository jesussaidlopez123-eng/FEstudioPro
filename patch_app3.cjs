const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert users state after okrs state
const okrsState = "const [okrs, setOkrs] = useState<OKR[]>(() => {    const data = localStorage.getItem('f_estudio_db_okrs');    return data ? JSON.parse(data) : initialOKRs;  });";
const usersState = `\n  const [users, setUsers] = useState<AppUser[]>(() => {
    const data = localStorage.getItem('f_estudio_db_users');
    return data ? JSON.parse(data) : initialUsers;
  });\n`;
code = code.replace(okrsState, okrsState + usersState);

// Insert users effect
const okrsEffect = "useEffect(() => {    try {      localStorage.setItem('f_estudio_db_okrs', JSON.stringify(okrs));    } catch (e) {      console.error('Failed to save okrs', e);    }  }, [okrs]);";
const usersEffect = `\n  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);\n`;
code = code.replace(okrsEffect, okrsEffect + usersEffect);

// Pass users to Login
code = code.replace("<Login onLogin={handleLogin} />", "<Login onLogin={handleLogin} users={users} />");

// User callbacks
const moduleConfigCallbacks = `
  const handleAddUser = (user: Omit<AppUser, 'id'>) => {
    const newUser: AppUser = { ...user, id: \`usr-\${Date.now()}\` };
    setUsers(prev => [...prev, newUser]);
    handleAddAlert('success', 'Usuario Creado', \`Se ha creado el usuario \${user.username}.\`);
  };

  const handleUpdateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    handleAddAlert('info', 'Usuario Actualizado', 'Se han actualizado los datos del usuario.');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    handleAddAlert('info', 'Usuario Eliminado', 'Se ha eliminado el usuario del sistema.');
  };
`;
code = code.replace("const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;", moduleConfigCallbacks + "\n  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;");

// Render ModuleConfiguracion
const configModuleRender = `
          {activeModule === 'configuracion' && (
            <ModuleConfiguracion 
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}
`;
code = code.replace("{activeModule === 'marketing' && (            <ModuleMarketing />          )}", "{activeModule === 'marketing' && (            <ModuleMarketing />          )}" + configModuleRender);

// Module Title mapping
code = code.replace("'marketing': '5. Marketing y Comercialización (Ventas)'", "'marketing': '5. Marketing y Comercialización (Ventas)',\n    'configuracion': '6. Configuración'");

fs.writeFileSync('src/App.tsx', code);
