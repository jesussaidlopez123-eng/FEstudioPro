const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "  const [users, setUsers] = useState<AppUser[]>(initialUsers);\n\n    return parsedUsers;\n  });",
  "  const [users, setUsers] = useState<AppUser[]>(initialUsers);"
);

// Also remove the extra bracket at the end if there is any TS1128 error at line 600.
// Wait, the line 600 might be an extra closing bracket. Let's see the end of the file.

fs.writeFileSync('src/App.tsx', code);
