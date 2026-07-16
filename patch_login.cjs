const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace(
  "onLogin: (role: UserRole) => void;",
  "onLogin: (role: UserRole, username: string) => void;"
);

code = code.replace(
  "onLogin(user.role);",
  "onLogin(user.role, user.username);"
);

fs.writeFileSync('src/components/Login.tsx', code);
