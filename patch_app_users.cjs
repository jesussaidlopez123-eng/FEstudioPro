const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const oldInit = `  const [users, setUsers] = useState<AppUser[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_users');
    return data ? JSON.parse(data) : initialUsers;
  });`;

const newInit = `  const [users, setUsers] = useState<AppUser[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_users');
    let parsedUsers = data ? JSON.parse(data) : initialUsers;
    
    // Auto-migrate "operador1" to "Jorge Salmero" in user's browser localStorage
    parsedUsers = parsedUsers.map(u => 
      u.username === 'operador1' ? { ...u, username: 'Jorge Salmero' } : u
    );
    
    // Ensure initial users exist (admin and Jorge Salmero)
    initialUsers.forEach(initU => {
      if (!parsedUsers.find(u => u.id === initU.id || u.username === initU.username)) {
        parsedUsers.push(initU);
      }
    });

    return parsedUsers;
  });`;

code = code.replace(oldInit, newInit);
fs.writeFileSync('src/App.tsx', code);
