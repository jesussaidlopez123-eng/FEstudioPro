const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Add Firebase imports
code = code.replace(
  "import { syncToGoogleSheets } from './lib/googleSheets';",
  "import { syncToGoogleSheets } from './lib/googleSheets';\nimport { db } from './lib/firebase';\nimport { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';"
);

// 2. Remove safeGetItem and safeSetItem definitions and usage
// Replace the block defining them
code = code.replace(
  /\/\/ Safe local storage helper[\s\S]*?const safeRemoveItem = [^}]+\n};\n/,
  ""
);

// 3. Replace state initializations
code = code.replace(/const \[users, setUsers\] = useState<AppUser\[\]>\(\(\) => \{[\s\S]*?\}\);/, "const [users, setUsers] = useState<AppUser[]>(initialUsers);");

code = code.replace(/const \[isAppLoaded, setIsAppLoaded\] = useState\(false\);\n  const \[isLoggedIn, setIsLoggedIn\] = useState<boolean>\(false\);\n  const \[activeUsername, setActiveUsername\] = useState<string>\(''\);\n  const \[userRole, setUserRole\] = useState<UserRole>\('Admin'\);/,
"const [isAppLoaded, setIsAppLoaded] = useState(false);\n  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);\n  const [activeUsername, setActiveUsername] = useState<string>('');\n  const [userRole, setUserRole] = useState<UserRole>('Admin');\n  const isSyncingRef = React.useRef(false);");

// 4. Remove localStorage useEffects
code = code.replace(/  \/\/ Synchronize States to LocalStorage[\s\S]*?\/\/ Handle Login \/ Logout Actions/g, "  // Handle Login / Logout Actions");

// 5. Inject Firebase real-time sync
const firebaseSyncCode = `
  useEffect(() => {
    // Session load
    const sess = localStorage.getItem('erp_session');
    if (sess) {
      const parsed = JSON.parse(sess);
      setIsLoggedIn(true);
      setActiveUsername(parsed.username);
      setUserRole(parsed.role);
    }

    const unsub = onSnapshot(doc(db, 'erp', 'core_state'), (docSnap) => {
      if (docSnap.exists()) {
        isSyncingRef.current = true;
        const data = docSnap.data();
        if (data.fichas) setFichasTecnicas(data.fichas);
        if (data.orders) setOrders(data.orders);
        if (data.tasks) setProductionTasks(data.tasks);
        if (data.transactions) setTransactions(data.transactions);
        if (data.alerts) setAlerts(data.alerts);
        if (data.users) setUsers(data.users);
        if (data.okrs) setOkrs(data.okrs);
        
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 500);
      }
      setIsAppLoaded(true);
    }, (error) => {
      console.error("Firebase sync error:", error);
      setIsAppLoaded(true);
    });

    return () => unsub();
  }, []);

  // Sync back to Firebase on changes
  useEffect(() => {
    if (!isAppLoaded || isSyncingRef.current) return;
    const syncData = async () => {
      try {
        await setDoc(doc(db, 'erp', 'core_state'), {
          fichas: fichasTecnicas,
          orders,
          tasks: productionTasks,
          transactions,
          alerts,
          users,
          okrs,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.error("Error saving to Firebase", err);
      }
    };
    
    // Debounce saves
    const timeout = setTimeout(syncData, 1000);
    return () => clearTimeout(timeout);
  }, [fichasTecnicas, orders, productionTasks, transactions, alerts, users, okrs, isAppLoaded]);

`;

code = code.replace("  // Handle Login / Logout Actions", firebaseSyncCode + "  // Handle Login / Logout Actions");

// 6. Fix login / logout localStorage logic since we removed safeSetItem
code = code.replace(
  /setActiveUsername\(username\);\n    setUserRole\(role\);\n    setIsLoggedIn\(true\);/,
  "setActiveUsername(username);\n    setUserRole(role);\n    setIsLoggedIn(true);\n    localStorage.setItem('erp_session', JSON.stringify({ role, username }));"
);

code = code.replace(
  /setIsLoggedIn\(false\);\n    safeRemoveItem\('f_estudio_is_logged_in'\);\n    safeRemoveItem\('f_estudio_user_role'\);/,
  "setIsLoggedIn(false);\n    localStorage.removeItem('erp_session');"
);

fs.writeFileSync('src/App.tsx', code);
console.log("App.tsx rewritten for Firebase sync.");
