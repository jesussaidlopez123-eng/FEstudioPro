const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Add activeUsername state
if (code.indexOf("const [activeUsername") === -1) {
  code = code.replace(
    "const [userRole, setUserRole] = useState<UserRole>(() => {",
    "const [activeUsername, setActiveUsername] = useState<string>('');\n  const [userRole, setUserRole] = useState<UserRole>(() => {"
  );
}

// Remove from Sidebar
code = code.replace(
  "              activeUsername={activeUsername} \n        onLogout={handleLogout}",
  "        onLogout={handleLogout}"
);
code = code.replace(
  "        userRole={userRole}\n              activeUsername={activeUsername} \n        onLogout={handleLogout} ",
  "        userRole={userRole}\n        onLogout={handleLogout} "
);

// Add to ModuleOperaciones
if (code.indexOf("activeUsername={activeUsername}") === -1) {
  code = code.replace(
    "userRole={userRole}\n              onPublishAlert={handleAddAlert}",
    "userRole={userRole}\n              activeUsername={activeUsername}\n              onPublishAlert={handleAddAlert}"
  );
}

fs.writeFileSync('src/App.tsx', code);
