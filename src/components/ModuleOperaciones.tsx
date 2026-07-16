/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Hammer, Users, Calendar, ArrowRight, CheckSquare, MessageSquare, 
  ClipboardList, PenTool, Plus, AlertTriangle, ShieldAlert, Clock, 
  CheckCircle2, Play, Pause, ChevronRight, Minimize2, FileText, Sliders,
  Trash2, Search, Coffee, LogIn, LogOut, RefreshCw, Timer, BookOpen, Info, CheckCircle
} from 'lucide-react';
import { ProductionTask, ProductionStatus, TaskInstructionStep, FinancialTransaction, AppUser } from '../types';

interface ModuleOperacionesProps {
  productionTasks: ProductionTask[];
  onUpdateTaskStatus: (id: string, newStatus: ProductionStatus) => void;
  onUpdateTaskProgress: (id: string, progress: number, notes: string, assignedTo: string, instruccionesTrabajo?: TaskInstructionStep[]) => void;
  userRole: 'Admin' | 'Operador';
  activeUsername?: string;
  onPublishAlert: (type: 'urgent' | 'info' | 'success', title: string, desc: string) => void;
  onAddTransaction?: (transaction: FinancialTransaction) => void;
  users?: AppUser[];
}

interface CheckRecord {
  id: string;
  artisan: string;
  date: string; // "YYYY-MM-DD"
  type: 'Entrada' | 'Salida Comer' | 'Entrada Comer' | 'Salida';
  time: string; // "HH:MM:SS AM/PM"
  timestamp: number;
}


// Safe local storage helper
const safeGetItem = (key: string) => {
  try { return safeGetItem(key); } catch (e) { return null; }
};
const safeSetItem = (key: string, value: string) => {
  try { safeSetItem(key, value); } catch (e) { console.warn('LocalStorage disabled'); }
};

export default function ModuleOperaciones({
  productionTasks,
  onUpdateTaskStatus,
  onUpdateTaskProgress,
  userRole,
  onPublishAlert,
  onAddTransaction,
  activeUsername = 'Operador',
  users = []
}: ModuleOperacionesProps) {
  const columns: { id: ProductionStatus; label: string; color: string }[] = [
    { id: 'Pendiente', label: '1. En Espera', color: 'border-t-slate-400 bg-slate-50' },
    { id: 'Corte', label: '2. Habilitado/Corte', color: 'border-t-amber-500 bg-amber-50/10' },
    { id: 'Soldadura', label: '3. Soldadura/Ensamble', color: 'border-t-indigo-500 bg-indigo-50/10' },
    { id: 'Pintura', label: '4. Pintura Electrostática', color: 'border-t-purple-500 bg-purple-50/10' },
    { id: 'Calidad', label: '5. Calidad y Detalle', color: 'border-t-blue-500 bg-blue-50/10' },
    { id: 'Terminado', label: '6. Finalizado', color: 'border-t-emerald-500 bg-emerald-50/10' }
  ];


  // Global UI Tabs
  const [activeAdminTab, setActiveAdminTab] = useState<'checador' | 'observaciones_muebles'>('checador');
  const [activeOperatorTab, setActiveOperatorTab] = useState<'checador' | 'tareas' | 'gastos'>('checador');

  // Real-time ticking Clock for Checador
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time Clock records (Checador) loaded from LocalStorage
  const [checkRecords, setCheckRecords] = useState<CheckRecord[]>(() => {
    const saved = safeGetItem('taller_checador_records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading check records', e);
      }
    }
    
    // Seed records for demonstration with previous day data
    const dStr = (offsetDays = 0) => {
      const d = new Date();
      d.setDate(d.getDate() - offsetDays);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return [
      { id: 'c-1', artisan: 'Carlos Ruiz', date: dStr(1), type: 'Entrada', time: '08:02:15 AM', timestamp: Date.now() - 90000000 },
      { id: 'c-2', artisan: 'Carlos Ruiz', date: dStr(1), type: 'Salida Comer', time: '02:05:40 PM', timestamp: Date.now() - 60000000 },
      { id: 'c-3', artisan: 'Carlos Ruiz', date: dStr(1), type: 'Entrada Comer', time: '03:01:10 PM', timestamp: Date.now() - 50000000 },
      { id: 'c-4', artisan: 'Carlos Ruiz', date: dStr(1), type: 'Salida', time: '06:15:22 PM', timestamp: Date.now() - 30000000 },
      
      { id: 'c-5', artisan: 'Martín Gómez', date: dStr(1), type: 'Entrada', time: '07:55:00 AM', timestamp: Date.now() - 90000000 },
      { id: 'c-6', artisan: 'Martín Gómez', date: dStr(1), type: 'Salida Comer', time: '02:00:15 PM', timestamp: Date.now() - 60000000 },
      { id: 'c-7', artisan: 'Martín Gómez', date: dStr(1), type: 'Entrada Comer', time: '02:58:30 PM', timestamp: Date.now() - 50000000 },
      { id: 'c-8', artisan: 'Martín Gómez', date: dStr(1), type: 'Salida', time: '06:05:45 PM', timestamp: Date.now() - 30000000 },

      { id: 'c-9', artisan: 'Roberto Sosa', date: dStr(1), type: 'Entrada', time: '08:10:00 AM', timestamp: Date.now() - 90000000 },
      { id: 'c-10', artisan: 'Roberto Sosa', date: dStr(1), type: 'Salida Comer', time: '02:10:00 PM', timestamp: Date.now() - 60000000 },
      { id: 'c-11', artisan: 'Roberto Sosa', date: dStr(1), type: 'Entrada Comer', time: '03:05:00 PM', timestamp: Date.now() - 50000000 },
      { id: 'c-12', artisan: 'Roberto Sosa', date: dStr(1), type: 'Salida', time: '06:30:15 PM', timestamp: Date.now() - 30000000 },
    ];
  });

  // Save check records to LocalStorage
  useEffect(() => {
    safeSetItem('taller_checador_records', JSON.stringify(checkRecords));
  }, [checkRecords]);

  // Selected Task and Modal state
  const [selectedTask, setSelectedTask] = useState<ProductionTask | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editProgress, setEditProgress] = useState(0);
  const [editAssignedTo, setEditAssignedTo] = useState('');
  const [modalSteps, setModalSteps] = useState<TaskInstructionStep[]>([]);
  
  // Interactive Stopwatch states inside Modal / Session Workspace
  const [activeStepTimerIndex, setActiveStepTimerIndex] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // NEW INLINE ACTIVE SESSION TASK STATE (muebles en fila & recuadro)
  const [selectedSessionTaskId, setSelectedSessionTaskId] = useState<string | null>(null);
  const [activeSessionTimerTaskId, setActiveSessionTimerTaskId] = useState<string | null>(null);
  const [activeBlueprintHotspot, setActiveBlueprintHotspot] = useState<string>('wood');

  // NEW ACTIVE SESSION REFERENCE IMAGES WORKSPACE STATES
  const [operatorPreviewTab, setOperatorPreviewTab] = useState<'blueprint' | 'images'>('blueprint');
  const [operatorPhotoIdx, setOperatorPhotoIdx] = useState(0);
  const [selectedStepImageForModal, setSelectedStepImageForModal] = useState<{ img: string; title: string; stepIdx: number } | null>(null);

  // Auto switch operator view to photos if available on task change
  useEffect(() => {
    const activeTask = productionTasks.find(t => t.id === selectedSessionTaskId);
    if (activeTask) {
      setOperatorPreviewTab(activeTask.referenceImages && activeTask.referenceImages.length > 0 ? 'images' : 'blueprint');
      setOperatorPhotoIdx(0);
    }
  }, [selectedSessionTaskId]);

  // Operator Workshop Quick Alert State
    const [operatorAlertTitle, setOperatorAlertTitle] = useState('');
  const [operatorAlertDesc, setOperatorAlertDesc] = useState('');
  
  // Expenses state
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseConcept, setExpenseConcept] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Materia Prima');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseSuccessMsg, setExpenseSuccessMsg] = useState('');
  const [showOperatorAlertForm, setShowOperatorAlertForm] = useState(false);

  // Filter criteria for Admin Attendance View
  const [adminSearchArtisan, setAdminSearchArtisan] = useState('');
  const [adminSearchDate, setAdminSearchDate] = useState('');

  // Auto initialize selectedSessionTaskId to the first assigned piece of the operator (non-Terminado)
  useEffect(() => {
    const operatorTasks = productionTasks.filter(t => t.assignedTo === activeUsername && t.status !== 'Terminado');
    if (operatorTasks.length > 0) {
      if (!selectedSessionTaskId || !operatorTasks.some(t => t.id === selectedSessionTaskId && t.status !== 'Terminado')) {
        setSelectedSessionTaskId(operatorTasks[0].id);
      }
    } else {
      setSelectedSessionTaskId(null);
    }
  }, [activeUsername, productionTasks]);

  // Step Stopwatch Live Tick Effect
  useEffect(() => {
    let interval: any = null;
    if (activeStepTimerIndex !== null) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    } else {
      setTimerSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeStepTimerIndex]);

  // NEW INLINE WORKSPACE TIMER AND OBSERVATIONS HANDLERS
  const handleToggleSessionTimer = (task: ProductionTask, stepIdx: number) => {
    const isTimerRunningOnThis = activeStepTimerIndex === stepIdx && activeSessionTimerTaskId === task.id;

    if (isTimerRunningOnThis) {
      // STOP TIMER: Add accumulated minutes
      const elapsedMins = timerSeconds / 60;
      const addedMins = timerSeconds > 5 ? Math.max(1, Math.round(elapsedMins)) : 0;
      
      const currentSteps = task.instruccionesTrabajo || [];
      const updatedSteps = currentSteps.map((step, idx) => {
        if (idx === stepIdx) {
          return {
            ...step,
            timeSpentMinutes: (step.timeSpentMinutes || 0) + addedMins,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'Completado' as const
          };
        }
        return step;
      });

      // Recalculate progress based on steps
      const totalSteps = updatedSteps.length;
      const completedSteps = updatedSteps.filter(s => s.status === 'Completado').length;
      const inProcessSteps = updatedSteps.filter(s => s.status === 'En Proceso').length;
      let calculatedProgress = task.progress;
      if (totalSteps > 0) {
        calculatedProgress = Math.round(((completedSteps + inProcessSteps * 0.5) / totalSteps) * 100);
      }

      onUpdateTaskProgress(task.id, calculatedProgress, task.notes, task.assignedTo, updatedSteps);
      
      setActiveStepTimerIndex(null);
      setActiveSessionTimerTaskId(null);
      setTimerSeconds(0);
    } else {
      // START TIMER
      // Pause any active timer running elsewhere
      if (activeStepTimerIndex !== null && activeSessionTimerTaskId !== null) {
        const runningTask = productionTasks.find(t => t.id === activeSessionTimerTaskId);
        if (runningTask) {
          const elapsedMins = timerSeconds / 60;
          const addedMins = timerSeconds > 5 ? Math.max(1, Math.round(elapsedMins)) : 0;
          const prevIdx = activeStepTimerIndex;
          
          const updatedSteps = (runningTask.instruccionesTrabajo || []).map((step, idx) => {
            if (idx === prevIdx) {
              return {
                ...step,
                timeSpentMinutes: (step.timeSpentMinutes || 0) + addedMins
              };
            }
            return step;
          });
          onUpdateTaskProgress(runningTask.id, runningTask.progress, runningTask.notes, runningTask.assignedTo, updatedSteps);
        }
      }

      // Activate new stopwatch
      setActiveStepTimerIndex(stepIdx);
      setActiveSessionTimerTaskId(task.id);
      setTimerSeconds(0);

      // Automatically change status to 'En Proceso'
      const currentSteps = task.instruccionesTrabajo || [];
      const updatedSteps = currentSteps.map((step, idx) => {
        if (idx === stepIdx) {
          return {
            ...step,
            status: 'En Proceso' as const,
            startedAt: step.startedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return step;
      });
      onUpdateTaskProgress(task.id, task.progress, task.notes, task.assignedTo, updatedSteps);
    }
  };

  const handleSessionStepUpdateStatusDirectly = (taskId: string, stepIdx: number, newStatus: 'Pendiente' | 'En Proceso' | 'Completado') => {
    const task = productionTasks.find(t => t.id === taskId);
    if (!task) return;

    const currentSteps = task.instruccionesTrabajo || [];
    const updatedSteps = currentSteps.map((step, idx) => {
      if (idx === stepIdx) {
        return {
          ...step,
          status: newStatus,
          startedAt: newStatus === 'En Proceso' ? (step.startedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : step.startedAt,
          completedAt: newStatus === 'Completado' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : step.completedAt
        };
      }
      return step;
    });

    const totalSteps = updatedSteps.length;
    const completedSteps = updatedSteps.filter(s => s.status === 'Completado').length;
    const inProcessSteps = updatedSteps.filter(s => s.status === 'En Proceso').length;
    let calculatedProgress = task.progress;
    if (totalSteps > 0) {
      calculatedProgress = Math.round(((completedSteps + inProcessSteps * 0.5) / totalSteps) * 100);
    }

    onUpdateTaskProgress(task.id, calculatedProgress, task.notes, task.assignedTo, updatedSteps);
  };

  const handleSessionStepUpdateObservations = (taskId: string, stepIdx: number, observations: string) => {
    const task = productionTasks.find(t => t.id === taskId);
    if (!task) return;

    const currentSteps = task.instruccionesTrabajo || [];
    const updatedSteps = currentSteps.map((step, idx) => {
      if (idx === stepIdx) {
        return { ...step, observations };
      }
      return step;
    });

    onUpdateTaskProgress(task.id, task.progress, task.notes, task.assignedTo, updatedSteps);
  };

  const handleSessionStepTimeManualSet = (task: ProductionTask, stepIdx: number, mins: number) => {
    const currentSteps = task.instruccionesTrabajo || [];
    const updatedSteps = currentSteps.map((step, idx) => {
      if (idx === stepIdx) {
        return { ...step, timeSpentMinutes: Math.max(0, mins) };
      }
      return step;
    });
    onUpdateTaskProgress(task.id, task.progress, task.notes, task.assignedTo, updatedSteps);
  };

  const handleSessionStepTimeManualDelta = (task: ProductionTask, stepIdx: number, delta: number) => {
    const currentSteps = task.instruccionesTrabajo || [];
    const updatedSteps = currentSteps.map((step, idx) => {
      if (idx === stepIdx) {
        return { ...step, timeSpentMinutes: Math.max(0, (step.timeSpentMinutes || 0) + delta) };
      }
      return step;
    });
    onUpdateTaskProgress(task.id, task.progress, task.notes, task.assignedTo, updatedSteps);
  };

  const handleSessionUpdateNotesOnly = (taskId: string, notes: string) => {
    const task = productionTasks.find(t => t.id === taskId);
    if (!task) return;
    onUpdateTaskProgress(taskId, task.progress, notes, task.assignedTo, task.instruccionesTrabajo);
  };

  const handleSessionUpdateTaskProgressOnly = (taskId: string, progress: number) => {
    const task = productionTasks.find(t => t.id === taskId);
    if (!task) return;
    onUpdateTaskProgress(taskId, progress, task.notes, task.assignedTo, task.instruccionesTrabajo);
  };

  const handleSessionUpdateTaskStatus = (taskId: string, newStatus: ProductionStatus) => {
    onUpdateTaskStatus(taskId, newStatus);
  };

  const handleFinalizeProject = (taskId: string) => {
    const task = productionTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Finalize: progress to 100%, status to 'Terminado'
    onUpdateTaskProgress(taskId, 100, task.notes || 'Completado con registro de tiempos.', task.assignedTo, task.instruccionesTrabajo);
    onUpdateTaskStatus(taskId, 'Terminado');

    onPublishAlert(
      'success',
      'Proyecto Finalizado 🎉',
      `El operario ${task.assignedTo} ha terminado con éxito la fabricación de "${task.productName}" (ID: ${task.id}).`
    );

    // Auto-select next active task in line if any
    const activeTasks = productionTasks.filter(t => t.assignedTo === activeUsername && t.id !== taskId && t.status !== 'Terminado');
    if (activeTasks.length > 0) {
      setSelectedSessionTaskId(activeTasks[0].id);
    } else {
      setSelectedSessionTaskId(null);
    }
  };

  // Helper: YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper: clock in the operator
  const handleClockIn = (type: 'Entrada' | 'Salida Comer' | 'Entrada Comer' | 'Salida') => {
    const now = new Date();
    const todayStr = getTodayString();
    
    // Check if they already clocked this today
    const exists = checkRecords.some(
      r => r.artisan === activeUsername && r.date === todayStr && r.type === type
    );
    if (exists) {
      alert(`Ya has registrado tu "${type}" para el día de hoy.`);
      return;
    }

    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const newRecord: CheckRecord = {
      id: `check-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      artisan: activeUsername,
      date: todayStr,
      type: type,
      time: timeStr,
      timestamp: now.getTime()
    };

    const updated = [newRecord, ...checkRecords];
    setCheckRecords(updated);
    
    // Publish notice to alerts system
    onPublishAlert(
      'info',
      `Checador: ${activeUsername}`,
      `Registró su ${type} de hoy a las ${timeStr}`
    );
  };

  // Helper: delete a check record (Admin Only)
  const handleDeleteRecord = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de asistencia?')) {
      setCheckRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // Helper: Add custom seed records manually (for demo/convenience)
  const handleAddDemoRecord = () => {
    const types: ('Entrada' | 'Salida Comer' | 'Entrada Comer' | 'Salida')[] = ['Entrada', 'Salida Comer', 'Entrada Comer', 'Salida'];
    const operatorUsers = users.filter(u => u.role === 'Operador');
    const randomArtisan = operatorUsers.length > 0 ? operatorUsers[Math.floor(Math.random() * operatorUsers.length)].username : 'Oficina Central';
    const randomType = types[Math.floor(Math.random() * 4)];
    
    const now = new Date();
    const dStr = getTodayString();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

    const newRecord: CheckRecord = {
      id: `check-${Date.now()}`,
      artisan: randomArtisan,
      date: dStr,
      type: randomType,
      time: timeStr,
      timestamp: now.getTime()
    };
    setCheckRecords(prev => [newRecord, ...prev]);
  };

  const openTaskInspector = (task: ProductionTask) => {
    setSelectedTask(task);
    setEditNotes(task.notes);
    setEditProgress(task.progress);
    setEditAssignedTo(task.assignedTo);
    setActiveStepTimerIndex(null);
    setTimerSeconds(0);

    // Generate fallback steps if not defined (Extracted from metadata or Module 2)
    let steps = task.instruccionesTrabajo;
    if (!steps || steps.length === 0) {
      const defaultStepsMap: { [key: string]: string[] } = {
        'Escritorio': [
          'Habilitar y cortar PTR 1.5" según planos de ingeniería',
          'Soldar estructura tubular en escuadra de ensamble',
          'Preparar y cepillar tablas de madera de parota',
          'Lijar y aplicar laca poliuretano sobre cubierta',
          'Aplicar recubrimiento electrostático negro en metal',
          'Ensamble final de niveladores y herrajes'
        ],
        'Mesa': [
          'Cortar perfiles PTR masivos de 3" a 45 grados',
          'Soldar celosía central con microalambre MIG',
          'Encolar y machihembrar tablas de encino americano',
          'Aplicar base tapaporos y lijar con grano 220',
          'Dar 3 capas de barniz transparente mate de alto impacto',
          'Anclar bridas metálicas inferiores de soporte'
        ],
        'Credenza': [
          'Cortar marcos de ángulo metálico de 1"',
          'Soldar chasis exterior e instalar rejilla de metal desplegado',
          'Lijar estantes interiores de pino y teñir con tinta nogal',
          'Perforar e instalar bisagras autocierre en puertas',
          'Pintar estructura completa con esmalte negro anticorrosivo',
          'Nivelar puertas y verificar cierre magnético'
        ],
        'Silla': [
          'Doblado en frío de tubos de acero de 7/8"',
          'Soldar chasis ergonómico soporte con técnica TIG',
          'Termoformar asiento y respaldo de triplay de nogal',
          'Aplicar laca selladora sobre la madera de nogal',
          'Pintura electrostática gris acero texturizado',
          'Fijar con tornillería Allen de seguridad'
        ]
      };

      let matchedSteps = defaultStepsMap['Silla']; // fallback
      for (const key of Object.keys(defaultStepsMap)) {
        if (task.productName.toLowerCase().includes(key.toLowerCase())) {
          matchedSteps = defaultStepsMap[key];
          break;
        }
      }

      steps = matchedSteps.map((inst, index) => ({
        id: `step-${task.id}-${index}`,
        instruction: inst,
        status: 'Pendiente',
        timeSpentMinutes: 0,
        observations: ''
      }));
    }

    setModalSteps(JSON.parse(JSON.stringify(steps)));
  };

  const handleToggleTimer = (stepIdx: number) => {
    if (activeStepTimerIndex === stepIdx) {
      // PAUSE TIMER: Add accumulated minutes
      const elapsedMins = timerSeconds / 60;
      // Guarantee at least 1 minute if it ran for more than 5 seconds, or keep precision
      const addedMins = timerSeconds > 5 ? Math.max(1, Math.round(elapsedMins)) : 0;
      
      setModalSteps(prev => prev.map((step, idx) => {
        if (idx === stepIdx) {
          return {
            ...step,
            timeSpentMinutes: (step.timeSpentMinutes || 0) + addedMins,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return step;
      }));
      setActiveStepTimerIndex(null);
      setTimerSeconds(0);
    } else {
      // START TIMER
      // Stop another active timer first if there is one
      if (activeStepTimerIndex !== null) {
        const prevIdx = activeStepTimerIndex;
        const elapsedMins = timerSeconds / 60;
        const addedMins = timerSeconds > 5 ? Math.max(1, Math.round(elapsedMins)) : 0;
        setModalSteps(prev => prev.map((step, idx) => {
          if (idx === prevIdx) {
            return {
              ...step,
              timeSpentMinutes: (step.timeSpentMinutes || 0) + addedMins
            };
          }
          return step;
        }));
      }

      // Activate new stopwatch
      setActiveStepTimerIndex(stepIdx);
      setTimerSeconds(0);

      // Automatically change status to 'En Proceso' and set start timestamp
      setModalSteps(prev => prev.map((step, idx) => {
        if (idx === stepIdx) {
          return {
            ...step,
            status: 'En Proceso',
            startedAt: step.startedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return step;
      }));
    }
  };

  const saveTaskDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    let finalSteps = [...modalSteps];
    if (activeStepTimerIndex !== null) {
      // Flush currently running timer
      const elapsedMins = timerSeconds / 60;
      const addedMins = timerSeconds > 5 ? Math.max(1, Math.round(elapsedMins)) : 0;
      finalSteps = finalSteps.map((step, idx) => {
        if (idx === activeStepTimerIndex) {
          return {
            ...step,
            timeSpentMinutes: (step.timeSpentMinutes || 0) + addedMins,
            completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
        return step;
      });
      setActiveStepTimerIndex(null);
      setTimerSeconds(0);
    }

    // Auto calculate progress
    const totalSteps = finalSteps.length;
    const completedSteps = finalSteps.filter(s => s.status === 'Completado').length;
    const inProcessSteps = finalSteps.filter(s => s.status === 'En Proceso').length;
    
    let calculatedProgress = editProgress;
    if (totalSteps > 0) {
      calculatedProgress = Math.round(((completedSteps + inProcessSteps * 0.5) / totalSteps) * 100);
    }

    let autoStatus = selectedTask.status;
    if (calculatedProgress === 100 && selectedTask.status !== 'Terminado') {
      autoStatus = 'Calidad';
    }

    onUpdateTaskProgress(selectedTask.id, calculatedProgress, editNotes.trim(), editAssignedTo, finalSteps);
    onUpdateTaskStatus(selectedTask.id, autoStatus);
    setSelectedTask(null);
  };

  const handleQuickMove = (id: string, currentStatus: ProductionStatus, direction: 'forward' | 'backward') => {
    const statusOrder: ProductionStatus[] = ['Pendiente', 'Corte', 'Soldadura', 'Pintura', 'Calidad', 'Terminado'];
    const idx = statusOrder.indexOf(currentStatus);
    
    if (direction === 'forward' && idx < statusOrder.length - 1) {
      const nextStatus = statusOrder[idx + 1];
      const matchedTask = productionTasks.find(t => t.id === id);
      const nextProgress = nextStatus === 'Terminado' ? 100 : Math.max(matchedTask?.progress || 0, (idx + 1) * 18);
      onUpdateTaskStatus(id, nextStatus);
      onUpdateTaskProgress(id, nextProgress, matchedTask?.notes || 'Avance rápido de estación.', matchedTask?.assignedTo || 'Oficina Central', matchedTask?.instruccionesTrabajo);
    } else if (direction === 'backward' && idx > 0) {
      onUpdateTaskStatus(id, statusOrder[idx - 1]);
    }
  };

  const handleUpdateStepStatus = (stepIdx: number, newStatus: 'Pendiente' | 'En Proceso' | 'Completado') => {
    setModalSteps(prev => prev.map((step, idx) => {
      if (idx === stepIdx) {
        return { 
          ...step, 
          status: newStatus,
          startedAt: newStatus === 'En Proceso' ? (step.startedAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : step.startedAt,
          completedAt: newStatus === 'Completado' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : step.completedAt
        };
      }
      return step;
    }));
  };

  const handleStepTimeDelta = (stepIdx: number, deltaMinutes: number) => {
    setModalSteps(prev => prev.map((step, idx) => {
      if (idx === stepIdx) {
        return { ...step, timeSpentMinutes: Math.max(0, (step.timeSpentMinutes || 0) + deltaMinutes) };
      }
      return step;
    }));
  };

  const handleStepTimeManual = (stepIdx: number, rawMinutes: number) => {
    setModalSteps(prev => prev.map((step, idx) => {
      if (idx === stepIdx) {
        return { ...step, timeSpentMinutes: Math.max(0, rawMinutes) };
      }
      return step;
    }));
  };

  const submitOperatorAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operatorAlertTitle.trim() || !operatorAlertDesc.trim()) return;

    onPublishAlert(
      'urgent',
      `Taller (${activeUsername}): ${operatorAlertTitle.trim()}`,
      operatorAlertDesc.trim()
    );

    setOperatorAlertTitle('');
    setOperatorAlertDesc('');
    setShowOperatorAlertForm(false);
  };

  // Filter tasks for active Operator
  const filteredTasksForOperator = productionTasks.filter(
    task => task.assignedTo === activeUsername
  );

  // Filter attendance logs for Admin view
  const filteredCheckRecords = checkRecords.filter(r => {
    const matchArtisan = adminSearchArtisan ? r.artisan.toLowerCase().includes(adminSearchArtisan.toLowerCase()) : true;
    const matchDate = adminSearchDate ? r.date === adminSearchDate : true;
    return matchArtisan && matchDate;
  });

  // Calculate daily compliance and stamps for each artisan
  const getDailyAttendanceMatrix = () => {
    const matrix: { [key: string]: { [artisan: string]: { Entrada?: string; 'Salida Comer'?: string; 'Entrada Comer'?: string; Salida?: string } } } = {};
    
    checkRecords.forEach(r => {
      if (!matrix[r.date]) {
        matrix[r.date] = {};
      }
      if (!matrix[r.date][r.artisan]) {
        matrix[r.date][r.artisan] = {};
      }
      matrix[r.date][r.artisan][r.type] = r.time;
    });

    const flatList: { date: string; artisan: string; Entrada?: string; SalidaComer?: string; EntradaComer?: string; Salida?: string; count: number }[] = [];
    
    Object.keys(matrix).sort((a, b) => b.localeCompare(a)).forEach(date => {
      Object.keys(matrix[date]).forEach(artisan => {
        const entries = matrix[date][artisan];
        const count = Object.keys(entries).length;
        flatList.push({
          date,
          artisan,
          Entrada: entries['Entrada'],
          SalidaComer: entries['Salida Comer'],
          EntradaComer: entries['Entrada Comer'],
          Salida: entries['Salida'],
          count
        });
      });
    });

    return flatList.filter(row => {
      const matchArt = adminSearchArtisan ? row.artisan.toLowerCase().includes(adminSearchArtisan.toLowerCase()) : true;
      const matchDt = adminSearchDate ? row.date === adminSearchDate : true;
      return matchArt && matchDt;
    });
  };

  const todayStr = getTodayString();
  const todayRecordsForActiveArtisan = checkRecords.filter(
    r => r.artisan === activeUsername && r.date === todayStr
  );

  const getCheckTime = (type: 'Entrada' | 'Salida Comer' | 'Entrada Comer' | 'Salida') => {
    const found = todayRecordsForActiveArtisan.find(r => r.type === type);
    return found ? found.time : null;
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="module-operaciones-view">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Hammer size={22} className="text-blue-500" />
            <span>Control de Operaciones y Taller</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión y monitoreo de la línea de producción metal-mecánica, ensamble y checador de operarios.
          </p>
        </div>

        
      </div>

      {/* ROLE CONTROLS & NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        {userRole === 'Admin' ? (
          /* Admin View Tabs */
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveAdminTab('checador')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5
                ${activeAdminTab === 'checador' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              id="admin-attendance-tab"
            >
              <Clock size={14} />
              <span>Historial Asistencia</span>
              {checkRecords.filter(r => r.date === todayStr).length > 0 && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              )}
            </button>
            <button
              onClick={() => setActiveAdminTab('observaciones_muebles')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center gap-1.5
                ${activeAdminTab === 'observaciones_muebles' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <BookOpen size={14} />
              <span>Tiempos y Notas por Mueble</span>
            </button>
          </div>
        ) : (
          /* Operator View Tabs (Minimum 44px height targets) */
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setActiveOperatorTab('checador')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 h-11
                ${activeOperatorTab === 'checador' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              id="operator-checador-tab"
            >
              <Clock size={15} />
              <span>⏱️ Mi Checador Diario</span>
            </button>
            <button
              onClick={() => setActiveOperatorTab('tareas')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 h-11
                ${activeOperatorTab === 'tareas' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              id="operator-tasks-tab"
            >
              <CheckSquare size={15} />
              <span>🔧 Mis Trabajos ({filteredTasksForOperator.length})</span>
            </button>
            <button
              onClick={() => setActiveOperatorTab('gastos')}
              className={`flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 h-11
                ${activeOperatorTab === 'gastos' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              id="operator-gastos-tab"
            >
              <ClipboardList size={15} />
              <span>💸 Registrar Gastos</span>
            </button>
          </div>
        )}

        <div className="text-[10px] bg-slate-100 font-extrabold text-slate-500 border border-slate-200 rounded px-2.5 py-1.5 uppercase font-mono tracking-wider">
          Rol: {userRole}
        </div>
      </div>

      {/* ==================== OPERATOR MODULE VIEWS ==================== */}
      {userRole === 'Operador' && (
        <div className="space-y-6">
          
          {/* TAB 1: OPERATOR DAILY PUNCH CLOCK (Checador) */}
          {activeOperatorTab === 'checador' && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-6" id="operator-punchcard">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest block font-mono">Consola de Asistencia</span>
                  <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 mt-1">
                    <Users size={18} className="text-amber-400" />
                    <span>Registro Diario de Entrada y Salida: {activeUsername}</span>
                  </h3>
                </div>

                {/* Nice ticking digital clock widget */}
                <div className="bg-[#0c1322] border border-blue-900/30 rounded-xl px-4 py-2 text-right">
                  <div className="text-xs text-blue-400 font-mono tracking-widest uppercase font-bold">HORA OFICIAL TALLER</div>
                  <div className="text-lg font-mono font-extrabold text-white tracking-widest mt-0.5">
                    {liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                    {liveTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Informational notification banner */}
              <div className="bg-blue-950/30 border border-blue-900/40 p-4 rounded-xl flex gap-3 text-xs text-blue-200 leading-relaxed items-start">
                <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-blue-300 font-bold mb-0.5">Lineamiento de Asistencia (4 veces al día)</strong>
                  De acuerdo con el reglamento de ingeniería y taller, debes registrar tu asistencia cuatro veces al día: 
                  <strong> 1. Entrada de Jornada</strong>, <strong>2. Salida a Comer</strong>, <strong>3. Entrada de Comer</strong> y <strong>4. Salida Final de Jornada</strong>. 
                  Por favor, registra el evento respectivo al iniciar/finalizar cada período.
                </div>
              </div>

              {/* 4 STAMPS CONTROL PANEL GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="checador-buttons-grid">
                
                {/* 1. Entrada de Jornada */}
                <div className="bg-[#080f1e] border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">1. Entrada</span>
                    <LogIn size={16} className="text-emerald-500" />
                  </div>
                  
                  {getCheckTime('Entrada') ? (
                    <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-3.5 text-center">
                      <span className="text-[10px] font-extrabold text-emerald-400 block uppercase font-mono">REGISTRADO</span>
                      <strong className="text-lg font-mono text-white tracking-wider block mt-1">⏰ {getCheckTime('Entrada')}</strong>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClockIn('Entrada')}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 uppercase font-mono"
                    >
                      <CheckCircle size={15} />
                      <span>Checar Entrada</span>
                    </button>
                  )}
                </div>

                {/* 2. Salida a Comer */}
                <div className="bg-[#080f1e] border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">2. Salida Comer</span>
                    <Coffee size={16} className="text-amber-500" />
                  </div>
                  
                  {getCheckTime('Salida Comer') ? (
                    <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl p-3.5 text-center">
                      <span className="text-[10px] font-extrabold text-amber-400 block uppercase font-mono">REGISTRADO</span>
                      <strong className="text-lg font-mono text-white tracking-wider block mt-1">⏰ {getCheckTime('Salida Comer')}</strong>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClockIn('Salida Comer')}
                      className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 uppercase font-mono"
                    >
                      <Coffee size={15} />
                      <span>Salida Comer</span>
                    </button>
                  )}
                </div>

                {/* 3. Entrada de Comer */}
                <div className="bg-[#080f1e] border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">3. Regreso Comer</span>
                    <LogIn size={16} className="text-sky-500" />
                  </div>
                  
                  {getCheckTime('Entrada Comer') ? (
                    <div className="bg-sky-950/30 border border-sky-900/40 rounded-xl p-3.5 text-center">
                      <span className="text-[10px] font-extrabold text-sky-400 block uppercase font-mono">REGISTRADO</span>
                      <strong className="text-lg font-mono text-white tracking-wider block mt-1">⏰ {getCheckTime('Entrada Comer')}</strong>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClockIn('Entrada Comer')}
                      className="w-full h-12 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 uppercase font-mono"
                    >
                      <LogIn size={15} />
                      <span>Regreso Comer</span>
                    </button>
                  )}
                </div>

                {/* 4. Salida de Jornada */}
                <div className="bg-[#080f1e] border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">4. Salida Final</span>
                    <LogOut size={16} className="text-rose-500" />
                  </div>
                  
                  {getCheckTime('Salida') ? (
                    <div className="bg-rose-950/30 border border-rose-900/40 rounded-xl p-3.5 text-center">
                      <span className="text-[10px] font-extrabold text-rose-400 block uppercase font-mono">REGISTRADO</span>
                      <strong className="text-lg font-mono text-white tracking-wider block mt-1">⏰ {getCheckTime('Salida')}</strong>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleClockIn('Salida')}
                      className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 uppercase font-mono"
                    >
                      <LogOut size={15} />
                      <span>Checar Salida</span>
                    </button>
                  )}
                </div>

              </div>

              {/* Personal daily history logs */}
              <div className="space-y-3 pt-4 border-t border-slate-850">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tus marcas recientes registradas hoy</h4>
                {todayRecordsForActiveArtisan.length === 0 ? (
                  <div className="text-slate-500 text-xs italic">Aún no registras ningún evento el día de hoy ({todayStr}).</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {todayRecordsForActiveArtisan.map(record => (
                      <div key={record.id} className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono">
                        <span className="text-[10px] text-blue-400 block">{record.type}</span>
                        <strong className="text-white text-xs mt-0.5 block">{record.time}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE ASSIGNED PIECES & TASK WORK instruccionesTrabajo (WITH TIMER) */}
          {activeOperatorTab === 'tareas' && (
            <div className="space-y-6">
              
              {/* TOP HEADER BLOCK WITH ALERTS ACTION */}
              <div className="bg-[#111a2f] border border-blue-900/40 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <CheckSquare size={18} className="text-blue-400" />
                    <span>Registro de Tiempos y Taller: {activeUsername}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Monitorea operaciones en tiempo real. Selecciona una estructura para iniciar cronómetros e instructivos técnicos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOperatorAlertForm(!showOperatorAlertForm)}
                  className="text-xs font-bold bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-900/30 px-3.5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer h-10"
                >
                  <AlertTriangle size={14} className="animate-pulse" />
                  <span>Reportar Alerta de Taller</span>
                </button>
              </div>

              {/* Alert Form toggle */}
              {showOperatorAlertForm && (
                <form onSubmit={submitOperatorAlert} className="bg-slate-900 border border-red-900/40 p-4 rounded-xl space-y-4 animate-fadeIn">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    <span>Reportar Alerta Crítica (Material, Máquina, Herraje)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Título corto de la alerta (Ej. PTR oxidado / Faltan niveladores)"
                      value={operatorAlertTitle}
                      onChange={(e) => setOperatorAlertTitle(e.target.value)}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-red-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Explica a detalle el problema y qué pieza de mueble detiene..."
                      value={operatorAlertDesc}
                      onChange={(e) => setOperatorAlertDesc(e.target.value)}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white outline-none focus:border-red-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowOperatorAlertForm(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded shadow"
                    >
                      Publicar Alerta General
                    </button>
                  </div>
                </form>
              )}

              {/* Task list matching the artisan */}
              {filteredTasksForOperator.length === 0 ? (
                <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
                  💤 No tienes muebles asignados en este momento. Revisa con el Administrador.
                </div>
              ) : (
                (() => {
                  const activeTasksForOperator = filteredTasksForOperator.filter(task => task.status !== 'Terminado');
                  const completedTasksForOperator = filteredTasksForOperator.filter(task => task.status === 'Terminado');

                  return (
                    <div className="space-y-6">
                      
                      {/* APARTADO CENTRAL: MUEBLES EN FILA (Horizontal list representation) */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 shadow-xs space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                            <ClipboardList size={14} className="text-blue-500" />
                            <span>Muebles Activos en tu Estación ({activeTasksForOperator.length})</span>
                          </h4>
                          <span className="text-[10px] text-slate-400 font-bold">Selecciona una pieza para trabajar</span>
                        </div>
                        
                        {activeTasksForOperator.length === 0 ? (
                          <div className="text-center py-8 bg-white border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-medium">
                            🎉 ¡Excelente trabajo! No tienes más muebles pendientes en tu fila de armado.
                          </div>
                        ) : (
                          <div className="flex gap-4 overflow-x-auto pb-2.5 scrollbar-thin scrollbar-thumb-slate-200">
                            {activeTasksForOperator.map((task) => {
                              const isSelected = selectedSessionTaskId === task.id;
                              const totalSteps = task.instruccionesTrabajo?.length || 6;
                              const completedSteps = task.instruccionesTrabajo?.filter(s => s.status === 'Completado').length || 0;
                              const isTimerRunningOnThisTask = activeSessionTimerTaskId === task.id;

                              return (
                                <button
                                  key={task.id}
                                  type="button"
                                  onClick={() => setSelectedSessionTaskId(task.id)}
                                  className={`flex-shrink-0 w-64 p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 hover:border-blue-400 hover:shadow-sm
                                    ${isSelected 
                                      ? 'border-blue-500 bg-blue-50/15 ring-2 ring-blue-500/10' 
                                      : 'border-slate-200 bg-white'}`}
                                >
                                  <div className="w-full">
                                    <div className="flex justify-between items-center w-full">
                                      <span className="text-[9px] font-mono font-extrabold text-slate-400">{task.id}</span>
                                      <div className="flex items-center gap-1">
                                        {isTimerRunningOnThisTask && (
                                          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse mr-0.5" title="Cronómetro corriendo"></span>
                                        )}
                                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border bg-blue-50 text-blue-600 border-blue-100`}>
                                          {task.status}
                                        </span>
                                      </div>
                                    </div>
                                    <h5 className="text-xs font-extrabold text-slate-800 mt-2 truncate">{task.productName}</h5>
                                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Cliente: <strong className="text-slate-700">{task.clientName}</strong></p>
                                  </div>
                                  
                                  <div className="w-full space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400">
                                      <span>Pasos: {completedSteps}/{totalSteps} Listos</span>
                                      <span className="font-mono text-blue-600">{task.progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* RECUADRO CON EL NOMBRE DEL PROYECTO Y SUS INSTRUCCIONES EN LISTA HACIA ABAJO */}
                      {(() => {
                        const activeTask = productionTasks.find(t => t.id === selectedSessionTaskId);
                        if (!activeTask || activeTask.status === 'Terminado') {
                          return (
                            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs italic">
                              💡 Selecciona una pieza activa de la fila superior para iniciar el registro.
                            </div>
                          );
                        }

                        return (
                          <div className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeIn" id="active-project-timer-box">
                            
                            {/* Box Header: Name of the project & general stats */}
                            <div className="bg-slate-900 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-extrabold bg-blue-500 text-white px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider">Mueble Seleccionado</span>
                                  <span className="text-[9px] font-mono font-bold text-slate-400">{activeTask.id}</span>
                                </div>
                                <h3 className="text-base md:text-lg font-extrabold text-white mt-1">Proyecto: {activeTask.productName}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  Cliente: <strong className="text-slate-200">{activeTask.clientName}</strong> | Planilla Técnica: <strong className="text-slate-200">{activeTask.dimensions || 'Ver en Plano'}</strong>
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                {/* Cumulative time statistic badge */}
                                <div className="bg-[#0e1726] border border-blue-900/30 rounded-xl px-4 py-2.5 text-right">
                                  <div className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">TIEMPO ACUMULADO</div>
                                  <div className="text-sm font-mono font-extrabold text-white tracking-wider mt-0.5 flex items-center justify-end gap-1.5">
                                    <Timer size={14} className="text-blue-400" />
                                    <span>
                                      {(activeTask.instruccionesTrabajo || []).reduce((sum, s) => sum + (s.timeSpentMinutes || 0), 0)} min
                                    </span>
                                  </div>
                                </div>

                                {/* BOTÓN FINALIZAR PROYECTO */}
                                <button
                                  type="button"
                                  onClick={() => handleFinalizeProject(activeTask.id)}
                                  className="px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all flex items-center gap-2 shadow shadow-emerald-500/15 border border-emerald-500 active:scale-98"
                                >
                                  <CheckSquare size={14} />
                                  <span>Finalizar Proyecto</span>
                                </button>
                              </div>
                            </div>

                            {/* Box Workspace Body (Full Width Layout with Instructions at top) */}
                            <div className="p-5 space-y-6 text-left">
                              
                              {/* Main area: LISTA HACIA ABAJO DE LAS INSTRUCCIONES (Full Width!) */}
                              <div className="space-y-3.5">
                                <div className="flex justify-between items-center">
                                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                                    Secuencia de Pasos de Fabricación
                                  </h4>
                                  <span className="text-[9px] text-slate-400 font-extrabold uppercase bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded">
                                    Extraídos de la Ficha Técnica
                                  </span>
                                </div>

                                <div className="space-y-2 max-h-[580px] overflow-y-auto pr-0.5">
                              {(activeTask.instruccionesTrabajo || []).map((step, idx) => {
                                const isTimerRunning = activeStepTimerIndex === idx && activeSessionTimerTaskId === activeTask.id;

                                return (
                                  <div
                                    key={step.id || idx}
                                    className={`p-3 rounded-xl border text-xs grid grid-cols-1 md:grid-cols-12 gap-3 transition-all
                                      ${step.status === 'Completado' 
                                        ? 'border-emerald-200 bg-emerald-50/10' 
                                        : step.status === 'En Proceso' 
                                          ? 'border-blue-300 bg-blue-50/20 ring-1 ring-blue-500/10 shadow-xs' 
                                          : 'border-slate-200 bg-slate-50/30'}`}
                                  >
                                    {/* Left 8 columns: Instruction Step Information */}
                                    <div className="md:col-span-8 flex gap-2.5 text-left w-full">
                                      {/* Visual separation of instructions by number as indicated in the PDF */}
                                      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center border shrink-0 shadow-xs
                                        ${step.status === 'Completado' 
                                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                          : step.status === 'En Proceso' 
                                            ? 'bg-blue-100 text-blue-800 border-blue-200 font-extrabold' 
                                            : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                        <span className="text-[7.5px] uppercase tracking-tighter text-slate-400 font-extrabold leading-none">PASO</span>
                                        <strong className="text-xs font-mono leading-none mt-0.5">{String(idx + 1).padStart(2, '0')}</strong>
                                      </div>
                                      
                                      <div className="space-y-1.5 flex-grow">
                                        {(() => {
                                          let title = step.instruction;
                                          let detail = '';
                                          let stepMaterials = '';
                                          let stepImage = '';
  
                                          try {
                                            const parsed = JSON.parse(step.instruction);
                                            if (parsed && typeof parsed === 'object' && 'title' in parsed) {
                                              title = parsed.title || '';
                                              detail = parsed.description || '';
                                              stepMaterials = parsed.materials || '';
                                              stepImage = parsed.image || '';
                                            }
                                          } catch (e) {
                                            const newlineIndex = step.instruction.indexOf('\n');
                                            const hasDetail = newlineIndex !== -1;
                                            title = hasDetail ? step.instruction.substring(0, newlineIndex) : step.instruction;
                                            detail = hasDetail ? step.instruction.substring(newlineIndex + 1) : '';
                                          }
                                          
                                          return (
                                            <div className="flex flex-col text-left w-full space-y-1.5">
                                              <p className="font-extrabold text-slate-800 leading-tight text-xs">{title}</p>
                                              {detail && (
                                                <p className="text-[10px] font-medium text-slate-500 leading-normal whitespace-pre-wrap bg-slate-100 p-2 rounded-md border border-slate-200/60 font-mono">
                                                  {detail}
                                                </p>
                                              )}
                                              {stepMaterials && (
                                                <div className="bg-indigo-50/65 border border-indigo-100 rounded-lg p-1.5 flex items-center gap-1.5">
                                                  <span className="text-xs shrink-0">🛠️</span>
                                                  <div className="text-[9px] font-semibold text-indigo-950 leading-snug">
                                                    <span className="text-[8px] font-extrabold text-indigo-500 uppercase tracking-wider mr-1 border-r border-indigo-200/40 pr-1">Materia Prima</span>
                                                    {stepMaterials}
                                                  </div>
                                                </div>
                                              )}

                                            </div>
                                          );
                                        })()}
                                      </div>
                                    </div>

                                    {/* Right 4 columns: Time Tracking Controls (Toma de tiempo) */}
                                    <div className="md:col-span-4 flex flex-col justify-between gap-1.5 border-t md:border-t-0 md:border-l border-slate-200/60 pt-2 md:pt-0 md:pl-2.5">
                                      
                                      {/* Status Metrics Line */}
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border
                                          ${step.status === 'Completado' 
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                            : step.status === 'En Proceso' 
                                              ? 'bg-blue-50 border-blue-100 text-blue-700' 
                                              : 'bg-slate-100 border-slate-150 text-slate-500'}`}>
                                          {step.status}
                                        </span>

                                        {step.timeSpentMinutes > 0 && (
                                          <span className="text-[8px] font-mono font-extrabold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-150">
                                            ⏱️ {step.timeSpentMinutes} min
                                          </span>
                                        )}

                                        {step.completedAt && (
                                          <span className="text-[8px] font-mono text-slate-400">
                                            {step.completedAt}
                                          </span>
                                        )}
                                      </div>

                                      {/* Digital Stopwatch */}
                                      {isTimerRunning && (
                                        <div className="px-2 py-1 bg-slate-950 text-emerald-400 font-mono font-extrabold text-[10px] rounded border border-slate-800 shadow-xs flex items-center justify-center gap-1.5 animate-pulse w-full">
                                          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping"></span>
                                          <span>⏱️ {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')}</span>
                                        </div>
                                      )}

                                      {/* Action Buttons side-by-side */}
                                      <div className="grid grid-cols-2 gap-1.5">
                                        {/* INICIAR BUTTON */}
                                        <button
                                          type="button"
                                          disabled={isTimerRunning}
                                          onClick={() => handleToggleSessionTimer(activeTask, idx)}
                                          className={`h-7 text-[9px] font-extrabold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 border shadow-xs
                                            ${isTimerRunning 
                                              ? 'bg-emerald-50 border-emerald-100 text-emerald-400 opacity-50 cursor-not-allowed' 
                                              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'}`}
                                        >
                                          <Play size={8} />
                                          <span>INICIAR</span>
                                        </button>

                                        {/* TERMINAR BUTTON */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (isTimerRunning) {
                                              handleToggleSessionTimer(activeTask, idx);
                                            } else {
                                              handleSessionStepUpdateStatusDirectly(activeTask.id, idx, 'Completado');
                                            }
                                          }}
                                          className={`h-7 text-[9px] font-extrabold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 border shadow-xs
                                            ${isTimerRunning 
                                              ? 'bg-red-600 hover:bg-red-700 text-white border-red-500 animate-pulse' 
                                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300'}`}
                                        >
                                          <Pause size={8} />
                                          <span>TERMINAR</span>
                                        </button>
                                      </div>

                                      {/* Observations box */}
                                      <div className="pt-0.5">
                                        <input
                                          type="text"
                                          value={step.observations || ''}
                                          onChange={(e) => handleSessionStepUpdateObservations(activeTask.id, idx, e.target.value)}
                                          placeholder="📝 Observaciones..."
                                          className="w-full bg-white border border-slate-200 rounded-md px-2 py-1 text-[9.5px] font-medium text-slate-600 outline-none focus:border-blue-400 placeholder-slate-400"
                                        />
                                      </div>

                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Bottom Details (Notes, Designations, Photo Guides) */}
                          <div className="border-t border-slate-200/80 pt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* 1. Bitácora / Notas de Ensamble */}
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Bitácora / Notas de Ensamble</span>
                                <textarea
                                  value={activeTask.notes || ''}
                                  onChange={(e) => handleSessionUpdateNotesOnly(activeTask.id, e.target.value)}
                                  placeholder="Indica detalles del PTR, tolerancias o problemas encontrados en esta pieza..."
                                  rows={3}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500 resize-none font-medium text-slate-700 leading-relaxed"
                                />
                                <p className="text-[9px] text-slate-400 italic">
                                  * Se guarda automáticamente al escribir.
                                </p>
                              </div>

                              {activeTask.pdfName && activeTask.pdfName !== 'Carga Manual' && (
                                <div className="p-2.5 bg-blue-50 border border-blue-150 rounded-xl flex items-center gap-2 text-xs text-blue-700">
                                  <FileText size={14} className="text-blue-500 flex-shrink-0" />
                                  <div className="truncate">
                                    <span className="font-extrabold block text-[8px] text-blue-500 uppercase tracking-widest leading-none">PDF TÉCNICO DETALLE</span>
                                    <span className="font-bold block truncate text-[10px] mt-1">{activeTask.pdfName}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* 2. Operario Designado & Fotos Adicionales */}
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Operario Designado</span>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex items-center gap-2">
                                  <Users size={14} className="text-slate-400" />
                                  <span>{activeTask.assignedTo}</span>
                                </div>
                              </div>

                              {activeTask.referenceImages && activeTask.referenceImages.length > 0 && (
                                <div className="space-y-2">
                                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Guía Fotográfica ({activeTask.referenceImages.length})</span>
                                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                    {activeTask.referenceImages.map((img, idx) => {
                                      const imgTitle = activeTask.referenceImageNames && activeTask.referenceImageNames[idx]
                                        ? activeTask.referenceImageNames[idx]
                                        : `Imagen de Referencia ${idx + 1}`;
                                      return (
                                        <button
                                          key={idx}
                                          type="button"
                                          onClick={() => setSelectedStepImageForModal({ img: img, title: imgTitle, stepIdx: -2 })}
                                          className="relative h-12 w-12 rounded border border-slate-200 overflow-hidden flex-shrink-0 cursor-pointer hover:border-blue-400 transition-all shadow-xs group"
                                          title={imgTitle}
                                        >
                                          <img 
                                            src={img} 
                                            alt={imgTitle} 
                                            className="h-full w-full object-cover"
                                            referrerPolicy="no-referrer"
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <p className="text-[9px] text-slate-400">
                                    * Haz clic en una miniatura para ampliar la guía.
                                  </p>
                                </div>
                              )}
                            </div>

                          </div>

                        </div>
                      </div>
                    );
                  })()}

                      {/* APARTADO 3: HISTORIAL DE PROYECTOS CONCLUIDOS */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500 animate-pulse" size={18} />
                            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                              Historial de Proyectos Concluidos ({completedTasksForOperator.length})
                            </h4>
                          </div>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-extrabold">
                            Estación: {activeUsername}
                          </span>
                        </div>

                        {completedTasksForOperator.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 text-xs italic">
                            No hay proyectos concluidos en esta sesión de trabajo. ¡Finaliza un proyecto activo para registrarlo aquí!
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedTasksForOperator.map((task) => {
                              const totalMinutes = (task.instruccionesTrabajo || []).reduce((sum, s) => sum + (s.timeSpentMinutes || 0), 0);
                              const totalHours = (totalMinutes / 60).toFixed(1);

                              return (
                                <div key={task.id} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex flex-col justify-between gap-3 shadow-xs">
                                  <div>
                                    <div className="flex justify-between items-start">
                                      <span className="text-[9px] font-mono font-bold text-slate-400">{task.id}</span>
                                      <span className="text-[8px] font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                        Terminado
                                      </span>
                                    </div>
                                    <h5 className="text-xs font-extrabold text-slate-800 mt-1 truncate">{task.productName}</h5>
                                    <p className="text-[10px] text-slate-500">Cliente: <strong className="text-slate-700">{task.clientName}</strong></p>
                                  </div>

                                  <div className="bg-white border border-slate-150 rounded-lg p-2 flex items-center justify-between text-[10px] text-slate-600">
                                    <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-[9px] text-slate-400">
                                      <Clock size={11} className="text-emerald-500" />
                                      <span>Tiempo Total:</span>
                                    </span>
                                    <span className="font-extrabold text-emerald-700 font-mono">
                                      {totalMinutes} min ({totalHours} hrs)
                                    </span>
                                  </div>

                                  {task.notes && (
                                    <div className="text-[9px] text-slate-500 italic bg-white p-2 rounded border border-slate-150 leading-relaxed truncate" title={task.notes}>
                                      Nota: "{task.notes}"
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })())}
            </div>
          )}

          {/* TAB 3: OPERATOR GASTOS REGISTRATION */}
          {activeOperatorTab === 'gastos' && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn" id="operator-gastos-panel">
              <div className="border-b border-slate-800 pb-5">
                <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest block font-mono">Control de Caja</span>
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 mt-1">
                  <ClipboardList size={18} className="text-emerald-400" />
                  <span>Registro de Gastos del Taller</span>
                </h3>
                <p className="text-xs text-slate-400 mt-2">
                  Registra compras de insumos, consumibles o gastos imprevistos del taller.
                </p>
              </div>

              {expenseSuccessMsg && (
                <div className="bg-emerald-900/30 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle size={18} />
                  <span className="text-sm font-bold">{expenseSuccessMsg}</span>
                </div>
              )}

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (onAddTransaction) {
                    onAddTransaction({
                      id: `tx-${Date.now()}`,
                      type: 'expense',
                      amount: expenseAmount,
                      concept: expenseConcept,
                      category: expenseCategory,
                      date: expenseDate
                    });
                    setExpenseSuccessMsg('Gasto registrado exitosamente en la contabilidad general.');
                    setExpenseAmount(0);
                    setExpenseConcept('');
                    setTimeout(() => setExpenseSuccessMsg(''), 5000);
                  } else {
                    alert("Error: onAddTransaction no está definido");
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concepto / Descripción</label>
                    <input
                      type="text"
                      required
                      value={expenseConcept}
                      onChange={(e) => setExpenseConcept(e.target.value)}
                      placeholder="Ej. Compra de discos de corte..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monto (MXN)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      value={expenseAmount || ''}
                      onChange={(e) => setExpenseAmount(parseFloat(e.target.value) || 0)}
                      placeholder="Ej. 150.00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</label>
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Materia Prima">Materia Prima / Insumos</option>
                      <option value="Herramientas">Herramientas / Equipo</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Logística">Transporte / Logística</option>
                      <option value="Otros Gastos">Otros Gastos Taller</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha</label>
                    <input
                      type="date"
                      required
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer w-full sm:w-auto"
                  >
                    <Plus size={16} />
                    <span>Registrar Gasto</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ==================== ADMIN MODULE VIEWS ==================== */}
      {userRole === 'Admin' && (
        <div className="space-y-6">
          
          {/* TAB 1: ADMIN ATTENDANCE LOG VIEW (Checador Historial) */}
          {activeAdminTab === 'checador' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fadeIn" id="admin-attendance-log-panel">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" />
                    <span>Control de Asistencia del Taller (Checador 4 Veces al Día)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Historial de entradas, salidas a comer, regresos y salidas de jornada de los operarios de carpintería y herrería.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddDemoRecord}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Simular Registro Rápido</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas vaciar por completo el historial de asistencia en local?')) {
                        setCheckRecords([]);
                      }
                    }}
                    className="border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Vaciar Todo</span>
                  </button>
                </div>
              </div>

              {/* FILTERS PANEL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Buscar por Artesano</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={adminSearchArtisan}
                      onChange={(e) => setAdminSearchArtisan(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 font-semibold appearance-none cursor-pointer"
                    >
                      <option value="">Todos los operadores</option>
                      {users.filter(u => u.role === 'Operador').map(u => (
                        <option key={u.id} value={u.username}>{u.username}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Filtrar por Fecha</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      value={adminSearchDate}
                      onChange={(e) => setAdminSearchDate(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 font-semibold font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setAdminSearchArtisan('');
                      setAdminSearchDate('');
                    }}
                    className="text-xs text-blue-500 font-bold hover:underline py-2.5 px-1 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Limpiar Filtros de Asistencia</span>
                  </button>
                </div>
              </div>

              {/* Attendance Matrix Grouped Layout */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matriz Diaria de Cumplimiento</h4>
                {getDailyAttendanceMatrix().length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 text-xs">
                    No hay registros de asistencia coincidentes con los filtros especificados.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-slate-400 border-b border-slate-200 text-[10px] font-extrabold uppercase font-mono">
                          <th className="py-3 px-4">Fecha</th>
                          <th className="py-3 px-4">Artesano</th>
                          <th className="py-3 px-4">1. Entrada</th>
                          <th className="py-3 px-4">2. Salida Comer</th>
                          <th className="py-3 px-4">3. Regreso Comer</th>
                          <th className="py-3 px-4">4. Salida</th>
                          <th className="py-3 px-4">Cumplimiento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {getDailyAttendanceMatrix().map((row, idx) => {
                          const percent = Math.round((row.count / 4) * 100);
                          let complianceColor = 'bg-rose-50 text-rose-700 border-rose-100';
                          if (row.count === 4) complianceColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          else if (row.count >= 2) complianceColor = 'bg-amber-50 text-amber-700 border-amber-100';

                          return (
                            <tr key={`${row.date}-${row.artisan}-${idx}`} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-slate-500 whitespace-nowrap">{row.date}</td>
                              <td className="py-3.5 px-4 font-extrabold text-slate-800">{row.artisan}</td>
                              
                              {/* 1. Entrada */}
                              <td className="py-3.5 px-4">
                                {row.Entrada ? (
                                  <span className="font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                                    {row.Entrada}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 italic font-mono">-</span>
                                )}
                              </td>

                              {/* 2. Salida Comer */}
                              <td className="py-3.5 px-4">
                                {row.SalidaComer ? (
                                  <span className="font-mono text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                                    {row.SalidaComer}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 italic font-mono">-</span>
                                )}
                              </td>

                              {/* 3. Regreso Comer */}
                              <td className="py-3.5 px-4">
                                {row.EntradaComer ? (
                                  <span className="font-mono text-sky-600 font-bold bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                                    {row.EntradaComer}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 italic font-mono">-</span>
                                )}
                              </td>

                              {/* 4. Salida */}
                              <td className="py-3.5 px-4">
                                {row.Salida ? (
                                  <span className="font-mono text-rose-600 font-bold bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                                    {row.Salida}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 italic font-mono">-</span>
                                )}
                              </td>

                              {/* Compliance pill */}
                              <td className="py-3.5 px-4">
                                <span className={`font-mono text-[10px] font-bold px-2 py-1 rounded-full border ${complianceColor}`}>
                                  {row.count}/4 ({percent}%)
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Raw Chronological Logs */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bitácora Cronológica de Eventos ({filteredCheckRecords.length})</h4>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1" id="attendance-raw-log">
                  {filteredCheckRecords.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-slate-50 hover:bg-slate-100 p-3 rounded-lg border border-slate-200/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-md bg-white border border-slate-200">
                          {r.type === 'Entrada' && <LogIn size={14} className="text-emerald-500" />}
                          {r.type === 'Salida Comer' && <Coffee size={14} className="text-amber-500" />}
                          {r.type === 'Entrada Comer' && <LogIn size={14} className="text-sky-500" />}
                          {r.type === 'Salida' && <LogOut size={14} className="text-rose-500" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800">{r.artisan}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-2">({r.date})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <strong className="text-xs font-mono text-slate-600 font-extrabold uppercase">{r.type}: {r.time}</strong>
                        <button
                          onClick={() => handleDeleteRecord(r.id)}
                          className="text-slate-300 hover:text-red-500 p-1 cursor-pointer transition-colors"
                          title="Eliminar Registro"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: DETAILED STEP OBSERVATIONS AUDIT (Admin Observations Panel) */}
          {activeAdminTab === 'observaciones_muebles' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-fadeIn" id="admin-mueble-notes-panel">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-500" />
                  <span>Bitácora de Observaciones y Tiempos por Mueble en Taller</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Revisa el desglose de minutos acumulados y observaciones específicas que registraron los artesanos para cada paso de fabricación.
                </p>
              </div>

              <div className="space-y-6">
                {productionTasks.map(task => {
                  const steps = task.instruccionesTrabajo || [];
                  const totalMins = steps.reduce((sum, s) => sum + (s.timeSpentMinutes || 0), 0);
                  const stepWithObservations = steps.filter(s => s.observations && s.observations.trim() !== '');

                  return (
                    <div key={task.id} className="border border-slate-200 rounded-2xl p-5 bg-white space-y-4">
                      
                      {/* Task header summary */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">{task.id}</span>
                            <span className="text-[9px] font-extrabold uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">
                              {task.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-slate-800 mt-1">{task.productName}</h4>
                          <span className="text-[11px] text-slate-500 block">Cliente: <strong>{task.clientName}</strong> | Artesano asignado: <strong>{task.assignedTo}</strong></span>
                        </div>

                        {/* Total times statistics */}
                        <div className="text-right bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5">
                          <div className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Tiempo acumulado</div>
                          <strong className="text-sm text-slate-800 font-mono block mt-0.5">⏱️ {totalMins} min ({(totalMins/60).toFixed(1)} hrs)</strong>
                        </div>
                      </div>

                      {/* Steps detail grid */}
                      <div className="space-y-3">
                        <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Desglose de Pasos y Comentarios de Operario</h5>
                        {steps.length === 0 ? (
                          <div className="text-[11px] text-slate-400 italic">No hay pasos definidos o cargados para este mueble.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {steps.map((step, sIdx) => (
                              <div key={step.id || sIdx} className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-200/60 text-xs flex flex-col justify-between gap-2.5">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-start gap-2">
                                    {(() => {
                                      let title = step.instruction;
                                      let stepMaterials = '';
                                      let stepImage = '';

                                      try {
                                        const parsed = JSON.parse(step.instruction);
                                        if (parsed && typeof parsed === 'object' && 'title' in parsed) {
                                          title = parsed.title || '';
                                          stepMaterials = parsed.materials || '';
                                          stepImage = parsed.image || '';
                                        }
                                      } catch (e) {
                                        const newlineIndex = step.instruction.indexOf('\n');
                                        title = newlineIndex !== -1 ? step.instruction.substring(0, newlineIndex) : step.instruction;
                                      }

                                      return (
                                        <div className="flex flex-col text-left">
                                          <span className="font-extrabold text-slate-700 leading-tight">
                                            {sIdx + 1}. {title}
                                          </span>
                                          {stepMaterials && (
                                            <span className="text-[10px] text-indigo-500 font-semibold mt-0.5">
                                              🛠️ {stepMaterials}
                                            </span>
                                          )}

                                        </div>
                                      );
                                    })()}
                                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full border shrink-0
                                      ${step.status === 'Completado' 
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                        : step.status === 'En Proceso' 
                                          ? 'bg-blue-50 border-blue-100 text-blue-700' 
                                          : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                                      {step.status}
                                    </span>
                                  </div>
                                  
                                  {/* Step observations balloon */}
                                  {step.observations && step.observations.trim() !== '' ? (
                                    <div className="bg-white border border-blue-100 p-2.5 rounded-lg text-[10px] text-blue-700 italic font-medium leading-relaxed mt-1.5">
                                      💬 "{step.observations}"
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400 italic mt-1.5">
                                      Sin observaciones asentadas
                                    </div>
                                  )}
                                </div>

                                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-t border-slate-200/50 pt-2">
                                  <span>Invertido: <strong className="text-slate-600 font-extrabold">{step.timeSpentMinutes || 0} min</strong></span>
                                  {step.completedAt && (
                                    <span>Terminado: <strong>{step.completedAt}</strong></span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* TASK INSPECTOR MODAL WITH TIMER & OBSERVATIONS LOG */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-[110] p-4">
          <form 
            onSubmit={saveTaskDetails} 
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[820px] w-full max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn" 
            id="task-inspector-modal"
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
              <div className="text-left">
                <span className="text-[9px] font-mono font-bold text-slate-400">{selectedTask.id}</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100 mt-0.5">Inspector de Pieza de Manufactura</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Modal Body Container with Split Columns */}
            <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              
              {/* LEFT COLUMN: GENERAL SUMMARY & PROGRESS LOGS */}
              <div className="space-y-4">
                
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Sliders size={14} className="text-blue-500" />
                  <span>Configuración de la Pieza</span>
                </h4>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-2 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-400 block uppercase text-[9px] tracking-wide">Mueble / Estructura:</span>
                    <strong className="text-slate-800 text-xs font-bold">{selectedTask.productName}</strong>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-2 border-t border-slate-200/50 pt-2">
                    <div>
                      <span className="font-semibold text-slate-400 block uppercase text-[9px]">Cliente:</span>
                      <strong className="text-slate-800">{selectedTask.clientName}</strong>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 block uppercase text-[9px]">Estación Actual:</span>
                      <strong className="text-blue-600">{selectedTask.status}</strong>
                    </div>
                  </div>
                </div>

                {/* Manual override of progress if needed */}
                <div className="space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Avance Físico del Mueble:</span>
                    <span className="text-blue-500">{editProgress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editProgress}
                    onChange={(e) => setEditProgress(parseInt(e.target.value))}
                    className="w-full cursor-pointer accent-blue-500 h-2 bg-slate-200 rounded-lg appearance-none"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                    <span>0% (Habilitado)</span>
                    <span>50% (Soldado/Base)</span>
                    <span>100% (Terminado)</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Nota: El avance se recalculará automáticamente de acuerdo al porcentaje de pasos completados si los editas a la derecha.
                  </p>
                </div>

                {/* Artisan Assignment */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Artesano de Soldadura / Carpintería</label>
                  <select
                    value={editAssignedTo}
                    onChange={(e) => setEditAssignedTo(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none"
                    required
                  >
                    {users.filter(u => u.role === 'Operador').map(u => (
                      <option key={u.id} value={u.username}>{u.username}</option>
                    ))}
                    {users.filter(u => u.role === 'Operador').length === 0 && (
                      <option value="Sin Operadores" disabled>No hay operadores</option>
                    )}
                  </select>
                </div>

                {/* Log Notes */}
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Bitácora / Observaciones de Taller</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Registrar uniones, estado del material, avances específicos..."
                    rows={2}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-none font-medium leading-normal"
                    required
                  ></textarea>
                </div>
              </div>

              {/* RIGHT COLUMN: DIVIDED WORK INSTRUCTIONS & TIME LOGGER */}
              <div className="space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock size={14} className="text-emerald-500" />
                    <span>Registro de Tiempos y Observaciones</span>
                  </h4>

                  {/* Cumulative execution badge */}
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 font-extrabold font-mono text-[10px] px-2.5 py-1 rounded-full">
                    Total: {modalSteps.reduce((sum, s) => sum + (s.timeSpentMinutes || 0), 0)} min ({(modalSteps.reduce((sum, s) => sum + (s.timeSpentMinutes || 0), 0) / 60).toFixed(1)} hrs)
                  </div>
                </div>

                {/* Scrollable list of steps */}
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {modalSteps.map((step, idx) => {
                    const isTimerRunning = activeStepTimerIndex === idx;

                    return (
                      <div 
                        key={step.id || idx} 
                        className={`p-3 rounded-xl border text-xs space-y-2.5 transition-all
                          ${step.status === 'Completado' 
                            ? 'border-emerald-100 bg-emerald-50/20' 
                            : step.status === 'En Proceso' 
                              ? 'border-blue-200 bg-blue-50/25 ring-1 ring-blue-100' 
                              : 'border-slate-200 bg-slate-50/40'}`}
                      >
                        {/* Step title and status pill */}
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex gap-2">
                            <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-extrabold font-mono flex-shrink-0 mt-0.5 border
                              ${step.status === 'Completado' 
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200' 
                                : step.status === 'En Proceso' 
                                  ? 'bg-blue-100 text-blue-800 border-blue-200' 
                                  : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {idx + 1}
                            </span>
                            {(() => {
                              let title = step.instruction;
                              let stepMaterials = '';
                              let stepImage = '';

                              try {
                                const parsed = JSON.parse(step.instruction);
                                if (parsed && typeof parsed === 'object' && 'title' in parsed) {
                                  title = parsed.title || '';
                                  stepMaterials = parsed.materials || '';
                                  stepImage = parsed.image || '';
                                }
                              } catch (e) {
                                const newlineIndex = step.instruction.indexOf('\n');
                                title = newlineIndex !== -1 ? step.instruction.substring(0, newlineIndex) : step.instruction;
                              }

                              return (
                                <div className="flex flex-col text-left">
                                  <span className="font-bold text-slate-700 leading-tight">{title}</span>
                                  {stepMaterials && (
                                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded mt-1 max-w-max">
                                      🛠️ {stepMaterials}
                                    </span>
                                  )}

                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* STEP CHRONOMETER (Play/Pause) & MANUAL ENTRY */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 bg-slate-100/50 p-2.5 rounded-lg border border-slate-200/40">
                          
                          {/* Play / Pause Interactive Cronómetro button (touch targets over 44px) */}
                          <div className="flex items-center gap-1.5">
                            {isTimerRunning ? (
                              <button
                                type="button"
                                onClick={() => handleToggleTimer(idx)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-1 animate-pulse border border-rose-500 shadow-sm"
                                title="Pausar y Registrar tiempo"
                              >
                                <Pause size={11} className="animate-spin" />
                                <span>{String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:{String(timerSeconds % 60).padStart(2, '0')} Pausar</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleTimer(idx)}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer flex items-center gap-1 border border-blue-400 shadow-sm"
                                title="Iniciar Cronómetro para este paso"
                              >
                                <Play size={11} />
                                <span>Iniciar</span>
                              </button>
                            )}
                          </div>

                          {/* Manual overrides */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 font-mono">Invertido:</span>
                            <button
                              type="button"
                              onClick={() => handleStepTimeDelta(idx, -5)}
                              className="w-6 h-6 border border-slate-200 rounded bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-500 flex items-center justify-center transition-colors shadow-xs"
                              title="Restar 5 minutos"
                            >
                              -5
                            </button>
                            
                            <input
                              type="number"
                              min="0"
                              value={step.timeSpentMinutes || 0}
                              onChange={(e) => handleStepTimeManual(idx, parseInt(e.target.value) || 0)}
                              className="w-10 p-1 border border-slate-200 rounded text-center text-[10px] font-extrabold text-blue-600 font-mono"
                              title="Minutos invertidos"
                            />

                            <button
                              type="button"
                              onClick={() => handleStepTimeDelta(idx, 5)}
                              className="w-6 h-6 border border-slate-200 rounded bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-500 flex items-center justify-center transition-colors shadow-xs"
                              title="Sumar 5 minutos"
                            >
                              +5
                            </button>
                            <span className="text-[9px] font-bold text-slate-400 font-mono">min</span>
                          </div>
                        </div>

                        {/* TEXT AREA FOR OPERATOR OBSERVATIONS */}
                        <div className="space-y-1">
                          <label className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Observaciones del Operador (Paso {idx+1})</label>
                          <textarea
                            value={step.observations || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setModalSteps(prev => prev.map((s, sIdx) => {
                                if (sIdx === idx) {
                                  return { ...s, observations: val };
                                }
                                return s;
                              }));
                            }}
                            placeholder="Ej:PTR requirió limado extra. Herrajes completos..."
                            rows={1.5}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-[11px] font-medium leading-relaxed outline-none focus:border-blue-500 resize-none"
                          />
                        </div>

                        {/* Status toggle buttons (Touch targets 44px) */}
                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200/30">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Estado:</span>
                          <div className="flex items-center gap-1 bg-slate-150 p-0.5 rounded-lg border border-slate-200/55">
                            <button
                              type="button"
                              onClick={() => handleUpdateStepStatus(idx, 'Pendiente')}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer h-7 flex items-center
                                ${step.status === 'Pendiente' 
                                  ? 'bg-white text-slate-700 shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              💤 Espera
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStepStatus(idx, 'En Proceso')}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer h-7 flex items-center
                                ${step.status === 'En Proceso' 
                                  ? 'bg-blue-500 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              ⚙️ Proceso
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStepStatus(idx, 'Completado')}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer h-7 flex items-center
                                ${step.status === 'Completado' 
                                  ? 'bg-emerald-500 text-white shadow-sm' 
                                  : 'text-slate-500 hover:text-slate-700'}`}
                            >
                              ✅ Listo
                            </button>
                          </div>
                        </div>

                        {/* Timestamp indicators if set */}
                        {(step.startedAt || step.completedAt) && (
                          <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono italic pt-1 border-dashed border-t border-slate-200/30">
                            <span>{step.startedAt ? `Inicio: ${step.startedAt}` : ''}</span>
                            <span>{step.completedAt ? `Fin: ${step.completedAt}` : ''}</span>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-blue-500/15"
              >
                Guardar Avance de Taller
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ZOOMED STEP IMAGE MODAL */}
      {selectedStepImageForModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-[200] p-4">
          <div 
            className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[620px] w-full max-h-[85vh] overflow-hidden flex flex-col animate-fadeIn"
            id="step-image-zoom-modal"
          >
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
              <div className="text-left">
                <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest font-mono">
                  {selectedStepImageForModal.stepIdx === -2 ? 'GUÍA VISUAL' : `PASO ${String(selectedStepImageForModal.stepIdx + 1).padStart(2, '0')}`}
                </span>
                <h3 className="text-xs font-bold text-slate-100 mt-0.5 truncate max-w-[450px]">{selectedStepImageForModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStepImageForModal(null)}
                className="text-slate-400 hover:text-white text-xl p-1 cursor-pointer font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body: Image Zoom */}
            <div className="p-6 bg-slate-950 flex-grow flex items-center justify-center overflow-auto min-h-[300px]">
              <img 
                src={selectedStepImageForModal.img} 
                alt={selectedStepImageForModal.title} 
                className="max-h-[50vh] max-w-full object-contain rounded-lg shadow-md border border-slate-800"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-150 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={() => setSelectedStepImageForModal(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-lg cursor-pointer transition-all"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
