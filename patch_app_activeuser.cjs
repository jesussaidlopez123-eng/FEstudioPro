const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const [activeUsername, setActiveUsername] = useState<string>('');",
  "const [activeUsername, setActiveUsername] = useState<string>(() => {\n    return localStorage.getItem('f_estudio_active_username') || '';\n  });"
);

code = code.replace(
  "localStorage.setItem('f_estudio_user_role', userRole);",
  "localStorage.setItem('f_estudio_user_role', userRole);\n      localStorage.setItem('f_estudio_active_username', activeUsername);"
);

code = code.replace(
  "}, [isLoggedIn, userRole]);",
  "}, [isLoggedIn, userRole, activeUsername]);"
);

fs.writeFileSync('src/App.tsx', code);
