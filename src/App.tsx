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

export default function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('f_estudio_is_logged_in') === 'true';
  });
  const [activeUsername, setActiveUsername] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('f_estudio_user_role') as UserRole) || 'Admin';
  });

  // ERP Core Databases States (Lazy loaded from localStorage with default initial fallback)
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnica[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_fichas');
    return data ? JSON.parse(data) : initialFichasTecnicas;
  });

  const [orders, setOrders] = useState<SalesOrder[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_orders');
    return data ? JSON.parse(data) : initialSalesOrders;
  });

  const [productionTasks, setProductionTasks] = useState<ProductionTask[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_tasks');
    return data ? JSON.parse(data) : initialProductionTasks;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_transactions');
    return data ? JSON.parse(data) : initialFinancialTransactions;
  });

  const [alerts, setAlerts] = useState<SystemAlert[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_alerts');
    return data ? JSON.parse(data) : initialSystemAlerts;
  });

  
  const [users, setUsers] = useState<AppUser[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_users');
    return data ? JSON.parse(data) : initialUsers;
  });
const [okrs, setOkrs] = useState<OKR[]>(() => {
    const data = localStorage.getItem('f_estudio_db_v2_okrs');
    return data ? JSON.parse(data) : initialOKRs;
  });

  // Navigation & Drawer UI states
  const [activeModule, setActiveModule] = useState<string>('direccion');
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  // Synchronize States to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_is_logged_in', isLoggedIn.toString());
      localStorage.setItem('f_estudio_user_role', userRole);
    } catch (e) {
      console.error('Failed to save auth state to localStorage', e);
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_v2_fichas', JSON.stringify(fichasTecnicas));
    } catch (e) {
      console.error('Failed to save fichas to localStorage. Might be exceeding quota.', e);
      alert('Error: No se pudo guardar en el almacenamiento local. Posible límite de memoria alcanzado por imágenes muy grandes.');
    }
  }, [fichasTecnicas]);

  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_v2_orders', JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_v2_tasks', JSON.stringify(productionTasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }, [productionTasks]);

  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_v2_transactions', JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_v2_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error('Failed to save alerts', e);
    }
  }, [alerts]);

  
  useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_v2_users', JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }, [users]);
useEffect(() => {
    try {
      localStorage.setItem('f_estudio_db_v2_okrs', JSON.stringify(okrs));
    } catch (e) {
      console.error('Failed to save okrs', e);
    }
  }, [okrs]);

  // Handle Login / Logout Actions
  const handleLogin = (role: UserRole, username: string) => {
    setActiveUsername(username);
    setUserRole(role);
    setIsLoggedIn(true);
    // Operators are immediately focused on Module 3 (Production) as it represents their main workspace
    if (role === 'Operador') {
      setActiveModule('operaciones');
    } else {
      setActiveModule('direccion');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('f_estudio_is_logged_in');
    localStorage.removeItem('f_estudio_user_role');
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
        assignedTo: 'Oficina Central',
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
        assignedTo: assignedTo || 'Jorge Salmero',
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
      `Se agregó "${ficha.name}" x${quantity} asignado a ${assignedTo || 'Jorge Salmero'} con ${initialSteps.length} instrucciones de trabajo.`
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

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    handleAddAlert('info', 'Usuario Eliminado', 'Se ha eliminado el usuario del sistema.');
  };

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin as any} users={users} />;
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
