/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, User, Layout, Menu, AlertCircle, LogOut } from 'lucide-react';

import { 
  UserRole, 
  SystemAlert, 
  FichaTecnica, 
  ProductionTask, 
  FinancialTransaction, 
  SalesOrder, 
  OKR, 
  AlertType, 
  ProductionStatus,
  AppUser
} from './types';

import { 
  initialFichasTecnicas, 
  initialSalesOrders, 
  initialProductionTasks, 
  initialFinancialTransactions, 
  initialSystemAlerts, 
  initialOKRs,
  initialUsers
} from './initialData';

import Login from './components/Login';
import Sidebar from './components/Sidebar';
import AlertsDrawer from './components/AlertsDrawer';
import ModuleDireccion from './components/ModuleDireccion';
import ModuleIngenieria from './components/ModuleIngenieria';
import ModuleOperaciones from './components/ModuleOperaciones';
import ModuleAdministracion from './components/ModuleAdministracion';
import ModuleMarketing from './components/ModuleMarketing';
import ModuleConfiguracion from './components/ModuleConfiguracion';
import { syncToGoogleSheets } from './lib/googleSheets';
import { supabase } from './lib/supabase';



// Safe local storage helper
const safeGetItem = (key: string) => {
  try { return safeGetItem(key); } catch (e) { return null; }
};
const safeSetItem = (key: string, value: string) => {
  try { safeSetItem(key, value); } catch (e) { console.warn('LocalStorage disabled'); }
};


const safeRemoveItem = (key: string) => {
  try { safeRemoveItem(key); } catch (e) { console.warn('LocalStorage disabled'); }
};
export default function App() {
  // Authentication State
  const [isAppLoaded, setIsAppLoaded] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [activeUsername, setActiveUsername] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('Admin');
  const isSyncingRef = React.useRef(false);

  // ERP Core Databases States (Lazy loaded from localStorage with default initial fallback)
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>(initialFichasTecnicas);

  const [orders, setOrders] = useState<SalesOrder[]>(initialSalesOrders);

  const [productionTasks, setProductionTasks] = useState<ProductionTask[]>(initialProductionTasks);

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialFinancialTransactions);

  const [alerts, setAlerts] = useState<SystemAlert[]>(initialSystemAlerts);

  
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
const [okrs, setOkrs] = useState<OKR[]>(initialOKRs);

  // Navigation & Drawer UI states
  const [activeModule, setActiveModule] = useState<string>('direccion');
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);


  useEffect(() => {
    // Session load
    const sess = localStorage.getItem('erp_session');
    if (sess) {
      const parsed = JSON.parse(sess);
      setIsLoggedIn(true);
      setActiveUsername(parsed.username);
      setUserRole(parsed.role);
    }

    if (!supabase) {
      setIsAppLoaded(true);
      return () => {};
    }

    const loadData = async () => {
      const { data: row, error } = await supabase.from('core_state').select('data').eq('id', 'singleton').single();
      if (error) setSyncError(error.message);
      if (!error && row && (row as any).data) { setSyncError(null);
        isSyncingRef.current = true;
        const data = (row as any).data;

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
    };
    
    loadData();

    const channel = supabase.channel('core_state_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'core_state' }, (payload) => {
        if (payload.new && (payload.new as any).data) {
          isSyncingRef.current = true;
          const data = (payload.new as any).data;

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
      })
      .subscribe();

    // Fallback polling every 10 seconds in case Realtime is disabled
    const interval = setInterval(async () => {
      if (isSyncingRef.current) return;
      const { data: row, error } = await supabase.from('core_state').select('data').eq('id', 'singleton').single();
      if (!error && row && (row as any).data) {
        isSyncingRef.current = true;
        const data = (row as any).data;
        if (data.fichas) setFichasTecnicas(data.fichas);
        if (data.orders) setOrders(data.orders);
        if (data.tasks) setProductionTasks(data.tasks);
        if (data.transactions) setTransactions(data.transactions);
        if (data.alerts) setAlerts(data.alerts);
        if (data.users) setUsers(data.users);
        if (data.okrs) setOkrs(data.okrs);
        setTimeout(() => { isSyncingRef.current = false; }, 500);
      }
    }, 10000);

    return () => { 
      supabase.removeChannel(channel); 
      clearInterval(interval);
    };
  }, []);

  // Sync back to Firebase on changes
  useEffect(() => {
    if (!isAppLoaded || isSyncingRef.current || !supabase) return;
    const syncData = async () => {
      try {
        const payload = JSON.parse(JSON.stringify({
          fichas: fichasTecnicas,
          orders,
          tasks: productionTasks,
          transactions,
          alerts,
          users,
          okrs,
          updatedAt: new Date().toISOString()
        }));
        await supabase.from('core_state').upsert({ id: 'singleton', data: payload });
      } catch (err) {
        console.error("Error saving to Supabase", err); setSyncError(err instanceof Error ? err.message : String(err));
      }
    };
    
    // Debounce saves
    const timeout = setTimeout(syncData, 1000);
    return () => clearTimeout(timeout);
  }, [fichasTecnicas, orders, productionTasks, transactions, alerts, users, okrs, isAppLoaded]);

  // Handle Login / Logout Actions
  const handleLogin = (role: UserRole, username: string) => {
    setActiveUsername(username);
    setUserRole(role);
    setIsLoggedIn(true);
    localStorage.setItem('erp_session', JSON.stringify({ role, username }));
    // Operators are immediately focused on Module 3 (Production) as it represents their main workspace
    if (role === 'Operador') {
      setActiveModule('operaciones');
    } else {
      setActiveModule('direccion');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('erp_session');
  };

  // State Manipulators (Callbacks)
  const handleAddFicha = (newFicha: FichaTecnica) => {
    setFichasTecnicas(prev => [newFicha, ...prev]);
    syncToGoogleSheets('ADD_FICHA', newFicha);
    handleAddAlert(
      'success',
      `Ficha Técnica Creada: ${newFicha.code}`,
      `Se dio de alta el diseño para "${newFicha.name}" con dimensiones ${newFicha.dimensions}.`
    );
  };

  const handleDeleteFicha = (id: string) => {
    setFichasTecnicas(prev => prev.filter(f => f.id !== id));
  };

  const handleAddOrder = (newOrder: SalesOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    syncToGoogleSheets('ADD_ORDER', newOrder);

    // CLOSED-LOOP INTEGRATION: Automatically generate individual production pieces in workshop!
    const autoTasks: ProductionTask[] = [];
    const matchingFicha = fichasTecnicas.find(f => f.name === newOrder.productName);
    
    // Build initial task instruction steps
    const initialSteps = (matchingFicha?.instruccionesTrabajo || []).map((ins, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      instruction: ins,
      status: 'Pendiente' as const,
      timeSpentMinutes: 0
    }));

    for (let i = 1; i <= newOrder.quantity; i++) {
      autoTasks.push({
        id: `TSK-${Date.now()}-${i}`,
        orderId: newOrder.id,
        productName: `${newOrder.productName} (Pieza ${i} de ${newOrder.quantity})`,
        clientName: newOrder.clientName,
        status: 'Pendiente',
        assignedTo: users.filter(u => u.role === 'Operador')[0]?.username || 'Oficina Central',
        notes: 'Planificado en taller automáticamente tras registro del pedido de ventas.',
        updatedAt: new Date().toISOString().split('T')[0],
        progress: 0,
        dimensions: matchingFicha?.dimensions || 'N/A',
        pdfName: matchingFicha?.pdfName || 'plano.pdf',
        instruccionesTrabajo: JSON.parse(JSON.stringify(initialSteps)), // Deep copy
        referenceImages: matchingFicha?.referenceImages,
        referenceImageNames: matchingFicha?.referenceImageNames
      });
    }

    setProductionTasks(prev => [...autoTasks, ...prev]);

    // Auto update OKR progress on closing sales orders if applicable
    setOkrs(prev => prev.map(okr => {
      if (okr.id === 'okr-3') { // Closed sales orders count
        return { ...okr, current: okr.current + 1 };
      }
      return okr;
    }));

    // Post an auto alert notice
    handleAddAlert(
      'info',
      `Pedido Recibido: ${newOrder.id}`,
      `Cliente "${newOrder.clientName}" ordenó x${newOrder.quantity} ${newOrder.productName}. Se enviaron ${newOrder.quantity} piezas a producción.`
    );
  };

  const handleAddTaskToQueue = (ficha: FichaTecnica, clientName: string, quantity: number, assignedTo?: string) => {
    const autoTasks: ProductionTask[] = [];
    const orderId = `MAN-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Build initial task instruction steps
    const initialSteps = (ficha.instruccionesTrabajo || []).map((ins, idx) => ({
      id: `step-${Date.now()}-${idx}`,
      instruction: ins,
      status: 'Pendiente' as const,
      timeSpentMinutes: 0
    }));

    for (let i = 1; i <= quantity; i++) {
      autoTasks.push({
        id: `TSK-${Date.now()}-${i}`,
        orderId: orderId,
        productName: quantity > 1 ? `${ficha.name} (Pieza ${i} de ${quantity})` : ficha.name,
        clientName: clientName.trim() || 'Público General',
        status: 'Pendiente',
        assignedTo: assignedTo || users.filter(u => u.role === 'Operador')[0]?.username || 'Oficina Central',
        notes: 'Envío manual desde Diseño e Ingeniería.',
        updatedAt: new Date().toISOString().split('T')[0],
        progress: 0,
        dimensions: ficha.dimensions || 'N/A',
        pdfName: ficha.pdfName || 'plano_diseno.pdf',
        instruccionesTrabajo: JSON.parse(JSON.stringify(initialSteps)), // Deep copy
        referenceImages: ficha.referenceImages,
        referenceImageNames: ficha.referenceImageNames
      });
    }

    setProductionTasks(prev => [...autoTasks, ...prev]);

    handleAddAlert(
      'success',
      'Diseño en Fila de Taller',
      `Se agregó "${ficha.name}" x${quantity} asignado a ${assignedTo || users.filter(u => u.role === 'Operador')[0]?.username || 'Oficina Central'} con ${initialSteps.length} instrucciones de trabajo.`
    );
  };

  const handleUpdateOrderStatus = (id: string, status: 'Pendiente' | 'En Producción' | 'Completado' | 'Entregado') => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    
    // Auto-update matched production tasks if order status gets overridden or completed
    if (status === 'Entregado' || status === 'Completado') {
      setProductionTasks(prev => prev.map(t => t.orderId === id ? { ...t, status: 'Terminado', progress: 100 } : t));
    } else if (status === 'En Producción') {
      setProductionTasks(prev => prev.map(t => {
        if (t.orderId === id && t.status === 'Terminado') {
          return { ...t, status: 'Calidad', progress: 95 };
        }
        return t;
      }));
    } else if (status === 'Pendiente') {
      setProductionTasks(prev => prev.map(t => {
        if (t.orderId === id) {
          return { ...t, status: 'Pendiente', progress: 0 };
        }
        return t;
      }));
    }
  };

  const handleUpdateTaskStatus = (id: string, newStatus: ProductionStatus) => {
    setProductionTasks(prev => {
      const nextTasks = prev.map(t => {
        if (t.id === id) {
          const nextProg = newStatus === 'Terminado' ? 100 : t.progress;
          return { 
            ...t, 
            status: newStatus, 
            progress: nextProg,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      });

      // Find the updated task to identify its orderId
      const updatedTask = nextTasks.find(t => t.id === id);
      if (updatedTask && updatedTask.orderId) {
        const relatedTasks = nextTasks.filter(t => t.orderId === updatedTask.orderId);
        if (relatedTasks.length > 0) {
          const allCompleted = relatedTasks.every(t => t.status === 'Terminado');
          const allPending = relatedTasks.every(t => t.status === 'Pendiente');
          let newOrderStatus: 'Pendiente' | 'En Producción' | 'Completado' | 'Entregado' = 'En Producción';
          
          if (allCompleted) {
            newOrderStatus = 'Completado';
          } else if (allPending) {
            newOrderStatus = 'Pendiente';
          }

          setOrders(prevOrders => prevOrders.map(o => {
            if (o.id === updatedTask.orderId) {
              if (o.status === 'Entregado' && !allCompleted) {
                return { ...o, status: 'En Producción' };
              }
              return { ...o, status: newOrderStatus };
            }
            return o;
          }));
        }
      }

      return nextTasks;
    });
  };

  const handleUpdateTaskProgress = (id: string, progress: number, notes: string, assignedTo: string, instruccionesTrabajo?: any[]) => {
    setProductionTasks(prev => {
      const nextTasks = prev.map(t => {
        if (t.id === id) {
          return {
            ...t,
            progress,
            notes,
            assignedTo,
            instruccionesTrabajo: instruccionesTrabajo || t.instruccionesTrabajo,
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return t;
      });

      // Synchronize with sales order state
      const updatedTask = nextTasks.find(t => t.id === id);
      if (updatedTask && updatedTask.orderId) {
        const relatedTasks = nextTasks.filter(t => t.orderId === updatedTask.orderId);
        if (relatedTasks.length > 0) {
          const allCompleted = relatedTasks.every(t => t.status === 'Terminado' || t.progress === 100);
          const allPending = relatedTasks.every(t => t.status === 'Pendiente' && t.progress === 0);
          let newOrderStatus: 'Pendiente' | 'En Producción' | 'Completado' | 'Entregado' = 'En Producción';
          
          if (allCompleted) {
            newOrderStatus = 'Completado';
          } else if (allPending) {
            newOrderStatus = 'Pendiente';
          }

          setOrders(prevOrders => prevOrders.map(o => {
            if (o.id === updatedTask.orderId) {
              if (o.status === 'Entregado' && !allCompleted) {
                return { ...o, status: 'En Producción' };
              }
              return { ...o, status: newOrderStatus };
            }
            return o;
          }));
        }
      }

      return nextTasks;
    });
  };

  const handleAddTransaction = (newTx: FinancialTransaction) => {
    setTransactions(prev => [newTx, ...prev]);
    syncToGoogleSheets('ADD_TRANSACTION', newTx);
    
    // Auto sync OKR tracker with profit levels if applicable
    if (newTx.type === 'income') {
      handleAddAlert('success', 'Pago Conciliado', `Se registró ingreso de $${newTx.amount.toLocaleString()} MXN por concepto: "${newTx.concept}".`);
    } else {
      handleAddAlert('info', 'Egreso Registrado', `Se autorizó gasto de $${newTx.amount.toLocaleString()} MXN por concepto: "${newTx.concept}".`);
    }
  };

  const handleAddAlert = (type: AlertType, title: string, desc: string) => {
    const newAlert: SystemAlert = {
      id: `alt-${Date.now()}`,
      type,
      title,
      desc,
      sender: userRole === 'Admin' ? 'Dirección (Admin)' : 'Taller (Operador)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      acknowledged: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: !a.acknowledged } : a));
  };

  const handleAddOKR = (objective: string, keyResult: string, target: number, unit: string) => {
    const newOkr: OKR = {
      id: `okr-${Date.now()}`,
      objective,
      keyResult,
      target,
      current: 0,
      unit
    };
    setOkrs(prev => [...prev, newOkr]);
  };

  const handleUpdateOKR = (id: string, current: number) => {
    setOkrs(prev => prev.map(o => o.id === id ? { ...o, current } : o));
  };

  // Unread Alerts Count for Notification Badge
  
  const handleAddUser = (user: Omit<AppUser, 'id'>) => {
    const newUser: AppUser = { ...user, id: `usr-${Date.now()}` };
    setUsers(prev => [...prev, newUser]);
    syncToGoogleSheets('ADD_USER', newUser);
    handleAddAlert('success', 'Usuario Creado', `Se ha creado el usuario ${user.username}.`);
  };

  const handleUpdateUser = (id: string, updates: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    handleAddAlert('info', 'Usuario Actualizado', 'Se han actualizado los datos del usuario.');
  };

  const handleResetSystem = async () => {
    setFichasTecnicas(initialFichasTecnicas);
    setOrders(initialSalesOrders);
    setProductionTasks(initialProductionTasks);
    setTransactions(initialFinancialTransactions);
    setAlerts(initialSystemAlerts);
    setOkrs(initialOKRs);
    setUsers(initialUsers);
    handleAddAlert('success', 'Sistema Restaurado', 'Se han restaurado los datos de fábrica del ERP.');
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    handleAddAlert('info', 'Usuario Eliminado', 'Se ha eliminado el usuario del sistema.');
  };

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  if (!isAppLoaded) return <div className="h-screen bg-[#080f1e] flex items-center justify-center text-white font-bold">Cargando ERP...</div>;

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  // Header Title mapping based on active module view
  const moduleTitles: Record<string, string> = {
    'direccion': '1. Dirección General y Estrategia',
    'ingenieria': '2. Diseño e Ingeniería de Producto',
    'operaciones': '3. Operaciones y Taller (Producción)',
    'administracion': '4. Administración y Finanzas',
    'marketing': '5. Marketing y Comercialización (Ventas)',
    'configuracion': '6. Configuración'
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-100 font-sans" id="erp-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeModule={activeModule} 
        onModuleChange={setActiveModule} 
        userRole={userRole}
        activeUsername={activeUsername}
        onLogout={handleLogout} 
      />

      {/* Main Panel */}
      <div className="flex-grow flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 flex-shrink-0 z-10 shadow-sm" id="top-navbar">
          {/* Active view name */}
          <h1 className="text-base md:text-lg font-bold text-slate-850 truncate leading-tight flex items-center gap-2">
            <span className="text-slate-400 font-light">Módulo</span>
            <span>{moduleTitles[activeModule] || 'F. Estudio'}</span>
          </h1>

          {/* Quick controls */}
          <div className="flex items-center gap-6">
            {/* Notification Bell with animated Badge */}
            <button 
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="relative p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-full transition-all duration-200 cursor-pointer"
              aria-label="Ver avisos"
              id="btn-toggle-alerts"
            >
              <Bell size={20} />
              {unreadAlertsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Profile Avatar Badge */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {userRole === 'Admin' ? 'Admin Dirección' : 'Operador Taller'}
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  F. Estudio
                </span>
              </div>
              <div className="w-9 h-9 bg-slate-900 text-white border border-slate-700/50 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
                {userRole === 'Admin' ? 'AD' : 'OP'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <main className="flex-grow p-6 md:p-10 overflow-y-auto bg-slate-50 pb-16">
          {activeModule === 'direccion' && (
            <ModuleDireccion 
              productionTasks={productionTasks}
              transactions={transactions}
              okrs={okrs}
              onUpdateOKR={handleUpdateOKR}
              onAddOKR={handleAddOKR}
              onNavigateToModule={setActiveModule}
              orders={orders}
              fichasTecnicas={fichasTecnicas}
            />
          )}

          {activeModule === 'ingenieria' && (
            <ModuleIngenieria 
              users={users}
              fichasTecnicas={fichasTecnicas}
              onAddFicha={handleAddFicha}
              onDeleteFicha={handleDeleteFicha}
              userRole={userRole}
              onAddTaskToQueue={handleAddTaskToQueue}
            />
          )}

          {activeModule === 'operaciones' && (
            <ModuleOperaciones 
              productionTasks={productionTasks}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onUpdateTaskProgress={handleUpdateTaskProgress}
              userRole={userRole}
              users={users}
              activeUsername={activeUsername}
              onPublishAlert={handleAddAlert}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeModule === 'administracion' && (
            <ModuleAdministracion 
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeModule === 'marketing' && (
            <ModuleMarketing />
          )}
          {activeModule === 'configuracion' && (
            <ModuleConfiguracion 
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onResetSystem={handleResetSystem}
            />
          )}
        </main>

        {/* Sliding System Alerts Drawer Overlay */}
        <AlertsDrawer 
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
          alerts={alerts}
          onAddAlert={handleAddAlert}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          activeUsername={userRole === 'Admin' ? 'Admin' : 'Operador'}
        />
      </div>
    </div>
  );
}
