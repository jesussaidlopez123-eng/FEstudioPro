const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  "const unsub = onSnapshot(doc(db, 'erp', 'core_state'), (docSnap) => {",
  "if (!db.app) {\n      setIsAppLoaded(true);\n      return () => {};\n    }\n    const unsub = onSnapshot(doc(db, 'erp', 'core_state'), (docSnap) => {"
);

code = code.replace(
  "if (!isAppLoaded || isSyncingRef.current) return;",
  "if (!isAppLoaded || isSyncingRef.current || !db.app) return;"
);

fs.writeFileSync('src/App.tsx', code);
