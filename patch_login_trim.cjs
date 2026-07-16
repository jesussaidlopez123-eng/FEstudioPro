const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace(
  "const user = users.find(u => u.username === username);",
  "const user = users.find(u => u.username === username);\n      const enteredPassword = password.trim();"
);

code = code.replace(
  "if (user.passwordHash !== password) {",
  "if (user.passwordHash.trim() !== enteredPassword) {"
);

fs.writeFileSync('src/components/Login.tsx', code);
