const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace safeGetItem and safeSetItem
code = code.replace(
  "const safeGetItem = (key: string) => {\n  try { return safeGetItem(key); } catch (e) { return null; }\n};\nconst safeSetItem = (key: string, value: string) => {\n  try { localStorage.setItem(key, value); } catch (e) {}\n};",
  ""
);

// We'll rewrite the state initializations
code = code.replace(
  "const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {\n    return safeGetItem('f_estudio_is_logged_in') === 'true';\n  });",
  "const [isAppLoaded, setIsAppLoaded] = useState(false);\n  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);"
);
code = code.replace(
  "const [activeUsername, setActiveUsername] = useState<string>(() => {\n    return safeGetItem('f_estudio_active_username') || '';\n  });",
  "const [activeUsername, setActiveUsername] = useState<string>('');"
);
code = code.replace(
  "const [userRole, setUserRole] = useState<UserRole>(() => {\n    return (safeGetItem('f_estudio_user_role') as UserRole) || 'Admin';\n  });",
  "const [userRole, setUserRole] = useState<UserRole>('Admin');"
);

code = code.replace(
  "const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>(() => {\n    const data = safeGetItem('f_estudio_db_v2_fichas');\n    return data ? JSON.parse(data) : initialFichasTecnicas;\n  });",
  "const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>(initialFichasTecnicas);"
);

code = code.replace(
  "const [orders, setOrders] = useState<SalesOrder[]>(() => {\n    const data = safeGetItem('f_estudio_db_v2_orders');\n    return data ? JSON.parse(data) : initialSalesOrders;\n  });",
  "const [orders, setOrders] = useState<SalesOrder[]>(initialSalesOrders);"
);

code = code.replace(
  "const [productionTasks, setProductionTasks] = useState<ProductionTask[]>(() => {\n    const data = safeGetItem('f_estudio_db_v2_tasks');\n    return data ? JSON.parse(data) : initialProductionTasks;\n  });",
  "const [productionTasks, setProductionTasks] = useState<ProductionTask[]>(initialProductionTasks);"
);

code = code.replace(
  "const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {\n    const data = safeGetItem('f_estudio_db_v2_transactions');\n    return data ? JSON.parse(data) : initialFinancialTransactions;\n  });",
  "const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialFinancialTransactions);"
);

code = code.replace(
  "const [alerts, setAlerts] = useState<SystemAlert[]>(() => {\n    const data = safeGetItem('f_estudio_db_v2_alerts');\n    return data ? JSON.parse(data) : initialSystemAlerts;\n  });",
  "const [alerts, setAlerts] = useState<SystemAlert[]>(initialSystemAlerts);"
);

code = code.replace(
  "const [users, setUsers] = useState<AppUser[]>(() => {\n    const data = safeGetItem('f_estudio_db_v2_users');\n    let parsedUsers = data ? JSON.parse(data) : initialUsers;\n    \n    // Auto-migrate \"operador1\" to \"Jorge Salmero\" in user's browser localStorage\n    parsedUsers = parsedUsers.map(u => \n      u.username === 'operador1' ? { ...u, username: 'Jorge Salmero' } : u\n    );\n    \n    // Ensure initial users exist (admin and Jorge Salmero)\n    initialUsers.forEach(initU => {\n      if (!parsedUsers.find(u => u.username === initU.username)) {\n        parsedUsers.push(initU);\n      }\n    });\n    return parsedUsers;\n  });",
  "const [users, setUsers] = useState<AppUser[]>(initialUsers);"
);

code = code.replace(
  "const [okrs, setOkrs] = useState<OKR[]>(() => {\n    const data = safeGetItem('f_estudio_db_v2_okrs');\n    return data ? JSON.parse(data) : initialOKRs;\n  });",
  "const [okrs, setOkrs] = useState<OKR[]>(initialOKRs);"
);

// Now the save hooks.
code = code.replace(
  "useEffect(() => {\n    try {\n      safeSetItem('f_estudio_db_v2_fichas', JSON.stringify(fichasTecnicas));\n    } catch (e) {\n      console.error('Failed to save fichas', e);\n    }\n  }, [fichasTecnicas]);",
  "useEffect(() => {\n    if (isAppLoaded) {\n      fetch('/api/data', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ fichasTecnicas, orders, productionTasks, transactions, alerts, users, okrs })\n      }).catch(console.error);\n    }\n  }, [fichasTecnicas, orders, productionTasks, transactions, alerts, users, okrs, isAppLoaded]);"
);

// Remove other save hooks
let toRemove = [
  "useEffect(() => {\n    try {\n      safeSetItem('f_estudio_db_v2_orders', JSON.stringify(orders));\n    } catch (e) {\n      console.error('Failed to save orders', e);\n    }\n  }, [orders]);",
  "useEffect(() => {\n    try {\n      safeSetItem('f_estudio_db_v2_tasks', JSON.stringify(productionTasks));\n    } catch (e) {\n      console.error('Failed to save tasks', e);\n    }\n  }, [productionTasks]);",
  "useEffect(() => {\n    try {\n      safeSetItem('f_estudio_db_v2_transactions', JSON.stringify(transactions));\n    } catch (e) {\n      console.error('Failed to save transactions', e);\n    }\n  }, [transactions]);",
  "useEffect(() => {\n    try {\n      safeSetItem('f_estudio_db_v2_alerts', JSON.stringify(alerts));\n    } catch (e) {\n      console.error('Failed to save alerts', e);\n    }\n  }, [alerts]);",
  "useEffect(() => {\n    try {\n      safeSetItem('f_estudio_db_v2_users', JSON.stringify(users));\n    } catch (e) {\n      console.error('Failed to save users', e);\n    }\n  }, [users]);",
  "useEffect(() => {\n    try {\n      safeSetItem('f_estudio_db_v2_okrs', JSON.stringify(okrs));\n    } catch (e) {\n      console.error('Failed to save okrs', e);\n    }\n  }, [okrs]);"
];

for (let r of toRemove) {
  code = code.replace(r, "");
}

// Add fetch on mount
code = code.replace(
  "// Auto update OKR 1 on tasks change",
  "useEffect(() => {\n    fetch('/api/data').then(res => res.json()).then(data => {\n      if (data.fichasTecnicas) setFichasTecnicas(data.fichasTecnicas);\n      if (data.orders) setOrders(data.orders);\n      if (data.productionTasks) setProductionTasks(data.productionTasks);\n      if (data.transactions) setTransactions(data.transactions);\n      if (data.alerts) setAlerts(data.alerts);\n      if (data.users) setUsers(data.users);\n      if (data.okrs) setOkrs(data.okrs);\n      \n      // check session\n      const storedSession = localStorage.getItem('erp_session');\n      if (storedSession) {\n        const sess = JSON.parse(storedSession);\n        setIsLoggedIn(true);\n        setActiveUsername(sess.username);\n        setUserRole(sess.role);\n      }\n      setIsAppLoaded(true);\n    }).catch(e => {\n      console.error('Error fetching data', e);\n      setIsAppLoaded(true);\n    });\n  }, []);\n\n  // Auto update OKR 1 on tasks change"
);

// Update login / logout 
code = code.replace(
  "safeSetItem('f_estudio_is_logged_in', 'true');\n    safeSetItem('f_estudio_active_username', username);\n    safeSetItem('f_estudio_user_role', role);",
  "localStorage.setItem('erp_session', JSON.stringify({ role, username }));"
);
code = code.replace(
  "safeSetItem('f_estudio_is_logged_in', 'false');\n    safeSetItem('f_estudio_active_username', '');\n    safeSetItem('f_estudio_user_role', 'Admin');",
  "localStorage.removeItem('erp_session');"
);

// Add loading state rendering
code = code.replace(
  "const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;",
  "const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;\n\n  if (!isAppLoaded) return <div className=\"h-screen bg-[#080f1e] flex items-center justify-center text-white font-bold\">Cargando ERP...</div>;"
);

fs.writeFileSync('src/App.tsx', code);
