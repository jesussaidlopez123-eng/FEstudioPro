const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add activeUsername state
code = code.replace(
  "const [userRole, setUserRole] = useState<UserRole>('Admin');",
  "const [userRole, setUserRole] = useState<UserRole>('Admin');\n  const [activeUsername, setActiveUsername] = useState<string>('');"
);

// 2. Update handleLogin
code = code.replace(
  "const handleLogin = (role: UserRole) => {",
  "const handleLogin = (role: UserRole, username: string) => {\n    setActiveUsername(username);"
);

// 3. Update Login usage
code = code.replace(
  "<Login onLogin={handleLogin} users={users} />",
  "<Login onLogin={handleLogin as any} users={users} />" // Temporary cast, but we'll update Login.tsx too. Actually, I can just update Login component types!
);

// 4. Update ModuleOperaciones usage
code = code.replace(
  "userRole={userRole}",
  "userRole={userRole}\n              activeUsername={activeUsername}"
);

fs.writeFileSync('src/App.tsx', code);
