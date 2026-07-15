/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Target, 
  TrendingUp, 
  Sparkles, 
  Plus, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar, 
  DollarSign, 
  Copy, 
  Check, 
  ExternalLink, 
  Database, 
  Search, 
  Filter, 
  Activity, 
  Briefcase, 
  Award, 
  Package, 
  X,
  RefreshCw,
  CloudLightning
} from 'lucide-react';
import { OKR, ProductionTask, FinancialTransaction, SalesOrder, FichaTecnica } from '../types';

interface ModuleDireccionProps {
  productionTasks: ProductionTask[];
  transactions: FinancialTransaction[];
  okrs: OKR[];
  onUpdateOKR: (id: string, current: number) => void;
  onAddOKR: (objective: string, keyResult: string, target: number, unit: string) => void;
  onNavigateToModule: (moduleId: string) => void;
  orders: SalesOrder[];
  fichasTecnicas: FichaTecnica[];
}

export default function ModuleDireccion({
  productionTasks,
  transactions,
  okrs,
  onUpdateOKR,
  onAddOKR,
  onNavigateToModule,
  orders,
  fichasTecnicas
}: ModuleDireccionProps) {

  // Helper to parse date string into human Spanish month-year
  const getMonthName = (dateStr: string) => {
    if (!dateStr) return 'Julio 2026';
    const parts = dateStr.split('-');
    if (parts.length < 2) return 'Julio 2026';
    const year = parts[0];
    const month = parts[1];
    const monthNames: Record<string, string> = {
      '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
      '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
      '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
    };
    return `${monthNames[month] || 'Julio'} ${year}`;
  };



  // Filters for active pipeline
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('Todos');

  // Month selector for dashboard view
  const [selectedMonth, setSelectedMonth] = useState<string>('Julio 2026');

  // History modal states
  const [activeHistoryModal, setActiveHistoryModal] = useState<'gross' | 'expenses' | 'net' | null>(null);

  // Active chart view state: 'all' | 'gross' | 'expenses' | 'net'
  const [activeChartView, setActiveChartView] = useState<'all' | 'gross' | 'expenses' | 'net'>('all');

  // OKR creation state
  const [showOkrForm, setShowOkrForm] = useState(false);
  const [newObjective, setNewObjective] = useState('');
  const [newKeyResult, setNewKeyResult] = useState('');
  const [newTarget, setNewTarget] = useState<number>(100);
  const [newUnit, setNewUnit] = useState('%');
  const [okrError, setOkrError] = useState('');
  const [editingOkrId, setEditingOkrId] = useState<string | null>(null);
  const [editOkrValue, setEditOkrValue] = useState<number>(0);

  // Generate dynamic monthly aggregations
  const monthlyAggregates = useMemo(() => {
    const aggregates: Record<string, { gross: number; expenses: number; net: number; transactionList: FinancialTransaction[] }> = {};
    
    // Populate with real live financial transactions dynamically entered in Module 4
    transactions.forEach(tx => {
      const monthLabel = getMonthName(tx.date);
      if (!aggregates[monthLabel]) {
        aggregates[monthLabel] = { gross: 0, expenses: 0, net: 0, transactionList: [] };
      }
      if (tx.type === 'income') {
        aggregates[monthLabel].gross += tx.amount;
      } else {
        aggregates[monthLabel].expenses += tx.amount;
      }
      aggregates[monthLabel].transactionList.push(tx);
    });

    // Recompute Net Profit for each period
    Object.keys(aggregates).forEach(m => {
      aggregates[m].net = aggregates[m].gross - aggregates[m].expenses;
    });

    return aggregates;
  }, [transactions]);

  // Months sorted sequentially for lists and charts
  const orderedMonths = useMemo(() => {
    const months = Object.keys(monthlyAggregates);
    // Sort logic to make sure chronological order: Abril -> Mayo -> Junio -> Julio
    const monthOrder: Record<string, number> = {
      'Enero': 1, 'Febrero': 2, 'Marzo': 3, 'Abril': 4, 'Mayo': 5, 'Junio': 6,
      'Julio': 7, 'Agosto': 8, 'Septiembre': 9, 'Octubre': 10, 'Noviembre': 11, 'Diciembre': 12
    };
    
    return months.sort((a, b) => {
      const [nameA, yearA] = a.split(' ');
      const [nameB, yearB] = b.split(' ');
      if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
      return (monthOrder[nameA] || 0) - (monthOrder[nameB] || 0);
    });
  }, [monthlyAggregates]);

  // Current selected month performance statistics
  const currentStats = useMemo(() => {
    const stats = monthlyAggregates[selectedMonth];
    if (stats) return stats;
    return { gross: 0, expenses: 0, net: 0, transactionList: [] };
  }, [monthlyAggregates, selectedMonth]);

  // Calculate percentage differences vs previous month
  const growthStats = useMemo(() => {
    const currentIdx = orderedMonths.indexOf(selectedMonth);
    if (currentIdx <= 0) {
      return { grossChange: 0, expensesChange: 0, netChange: 0 };
    }
    const prevMonth = orderedMonths[currentIdx - 1];
    const prevData = monthlyAggregates[prevMonth];
    const currentData = monthlyAggregates[selectedMonth];

    if (!prevData || !currentData) {
      return { grossChange: 0, expensesChange: 0, netChange: 0 };
    }

    const calcPercent = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      grossChange: calcPercent(currentData.gross, prevData.gross),
      expensesChange: calcPercent(currentData.expenses, prevData.expenses),
      netChange: calcPercent(currentData.net, prevData.net)
    };
  }, [orderedMonths, monthlyAggregates, selectedMonth]);

  // 1. TOP DE PRODUCTOS MÁS VENDIDOS (Dynamic aggregation from sales orders)
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number; ordersCount: number }> = {};
    
    orders.forEach(order => {
      if (!productSales[order.productName]) {
        productSales[order.productName] = {
          name: order.productName,
          quantity: 0,
          revenue: 0,
          ordersCount: 0
        };
      }
      productSales[order.productName].quantity += order.quantity;
      productSales[order.productName].revenue += order.total;
      productSales[order.productName].ordersCount += 1;
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  // 2. TOP DE ACTIVIDADES MÁS TARDADAS (Dynamic from Fichas Técnicas hours and active work complexity)
  const topActivities = useMemo(() => {
    // Agrupar por nombre de producto base (removiendo sufijos de "Pieza X de Y")
    const groupedTasks: Record<string, { code: string; name: string; totalMinutes: number; taskCount: number; progressSum: number }> = {};
    
    productionTasks.forEach(task => {
      const baseName = task.productName.replace(/\s*\(Pieza\s+\d+\s+de\s+\d+\)\s*$/i, '');
      const taskMinutes = task.instruccionesTrabajo?.reduce((sum, step) => sum + (step.timeSpentMinutes || 0), 0) || 0;
      
      if (!groupedTasks[baseName]) {
        groupedTasks[baseName] = { 
          code: task.orderId || task.id, 
          name: baseName, 
          totalMinutes: 0,
          taskCount: 0,
          progressSum: 0
        };
      }
      groupedTasks[baseName].totalMinutes += taskMinutes;
      groupedTasks[baseName].taskCount += 1;
      groupedTasks[baseName].progressSum += task.progress;
    });

    const items = Object.values(groupedTasks)
      .map(g => ({
        code: g.code,
        name: g.name,
        actualHours: Math.round(g.totalMinutes / 60 * 10) / 10,
        avgProgress: Math.round(g.progressSum / g.taskCount)
      }))
      .filter(item => item.actualHours > 0)
      .sort((a, b) => b.actualHours - a.actualHours)
      .slice(0, 5);
    
    return items;
  }, [productionTasks]);

  // 3. PROYECTOS EN FILA (Pipeline of active projects in progress/production)
  const projectsInQueue = useMemo(() => {
    // Group active production tasks by orderId
    const grouped: Record<string, ProductionTask[]> = {};
    productionTasks.forEach(task => {
      grouped[task.orderId] = grouped[task.orderId] || [];
      grouped[task.orderId].push(task);
    });

    return Object.entries(grouped)
      .map(([orderId, tasks]) => {
        const matchingOrder = orders.find(o => o.id === orderId);
        
        // Clean product name from parts like "(Pieza 1 de 2)"
        const rawName = tasks[0]?.productName || matchingOrder?.productName || 'Producto Desconocido';
        const cleanedName = rawName.replace(/\s*\(Pieza\s+\d+\s+de\s+\d+\)\s*$/i, '');
        
        const clientName = tasks[0]?.clientName || matchingOrder?.clientName || 'Cliente General';
        const deliveryDate = matchingOrder?.deliveryDate || 'Bajo Demanda';
        
        // Calculate average progress
        const totalProgress = tasks.reduce((sum, t) => sum + t.progress, 0);
        const progress = tasks.length > 0 ? Math.round(totalProgress / tasks.length) : 0;
        
        // Dynamic status mapping based on tasks
        let status: 'Pendiente' | 'En Producción' | 'Completado' = 'En Producción';
        const allCompleted = tasks.every(t => t.status === 'Terminado');
        const allPending = tasks.every(t => t.status === 'Pendiente');
        
        if (allCompleted) {
          status = 'Completado';
        } else if (allPending) {
          status = 'Pendiente';
        }

        return {
          id: orderId,
          clientName,
          productName: cleanedName,
          quantity: tasks.length,
          progress,
          status,
          deliveryDate,
          orderStatus: matchingOrder?.status || (allCompleted ? 'Completado' : 'En Producción')
        };
      })
      .filter(proj => {
        // Exclude completely finished/delivered projects to focus purely on active pipeline
        const matchStatus = proj.orderStatus !== 'Entregado';
        
        // Apply text searches
        const matchSearch = 
          proj.clientName.toLowerCase().includes(projectSearch.toLowerCase()) ||
          proj.productName.toLowerCase().includes(projectSearch.toLowerCase()) ||
          proj.id.toLowerCase().includes(projectSearch.toLowerCase());
        
        // Status filter
        const matchStatusFilter = projectStatusFilter === 'Todos' || proj.status === projectStatusFilter;

        return matchStatus && matchSearch && matchStatusFilter;
      });
  }, [orders, productionTasks, projectSearch, projectStatusFilter]);

  // Handle saving the Sheets URL in configuration
  // Helper values for dynamic SVG mapping
  const chartMaxVal = useMemo(() => {
    const values = orderedMonths.flatMap(m => {
      const d = monthlyAggregates[m];
      return [d.gross, d.expenses, d.net];
    });
    return Math.max(...values, 200000) * 1.15; // padding top
  }, [orderedMonths, monthlyAggregates]);

  // Handle OKR creation
  const handleAddOkr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newObjective.trim() || !newKeyResult.trim() || newTarget <= 0) {
      setOkrError('Por favor completa todos los campos con valores válidos.');
      return;
    }
    onAddOKR(newObjective.trim(), newKeyResult.trim(), newTarget, newUnit.trim());
    setNewObjective('');
    setNewKeyResult('');
    setNewTarget(100);
    setNewUnit('%');
    setShowOkrForm(false);
    setOkrError('');
  };

  const startEditOkr = (okr: OKR) => {
    setEditingOkrId(okr.id);
    setEditOkrValue(okr.current);
  };

  const saveOkrValue = (id: string) => {
    onUpdateOKR(id, editOkrValue);
    setEditingOkrId(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn" id="module-direccion-view">
      
      {/* 2. Top Controls & Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp size={22} className="text-indigo-600" />
            <span>Rendimiento y Contabilidad Directiva</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas estratégicas extraídas y consolidadas de la contabilidad de la empresa.
          </p>
        </div>
        
        {/* Month Selector for simulation */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 pl-2">Filtrar Periodo:</span>
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-xs font-extrabold text-slate-800 bg-slate-50 border-0 rounded-lg px-3.5 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
            id="direccion-month-select"
          >
            {orderedMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. KPI FINANCIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="kpi-grid">
        
        {/* CARD A: UTILIDAD BRUTA */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between" id="card-utilidad-bruta">
          <div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Utilidad Bruta (Ventas)
                </span>
              </div>
              <button 
                onClick={() => setActiveHistoryModal('gross')}
                className="text-[10px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                id="btn-historial-bruta"
              >
                Ver Historial
              </button>
            </div>
            
            <div className="text-2xl font-black text-slate-900 mt-4">
              ${currentStats.gross.toLocaleString('es-MX')} <span className="text-xs font-bold text-slate-400">MXN</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400">vs mes anterior:</span>
            {growthStats.grossChange >= 0 ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight size={14} />
                <span>+{growthStats.grossChange}%</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-red-600 flex items-center gap-0.5">
                <ArrowDownRight size={14} />
                <span>{growthStats.grossChange}%</span>
              </span>
            )}
          </div>
        </div>

        {/* CARD B: SUMA DE GASTOS */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between" id="card-suma-gastos">
          <div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Suma de Gastos
                </span>
              </div>
              <button 
                onClick={() => setActiveHistoryModal('expenses')}
                className="text-[10px] font-extrabold text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded-md hover:bg-red-100 transition-colors"
                id="btn-historial-gastos"
              >
                Ver Historial
              </button>
            </div>
            
            <div className="text-2xl font-black text-slate-900 mt-4">
              ${currentStats.expenses.toLocaleString('es-MX')} <span className="text-xs font-bold text-slate-400">MXN</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400">vs mes anterior:</span>
            {growthStats.expensesChange <= 0 ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowDownRight size={14} />
                <span>{growthStats.expensesChange}% (Menos)</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-red-600 flex items-center gap-0.5">
                <ArrowUpRight size={14} />
                <span>+{growthStats.expensesChange}% (Más)</span>
              </span>
            )}
          </div>
        </div>

        {/* CARD C: UTILIDAD NETA */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between" id="card-utilidad-neta">
          <div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Utilidad Neta Real
                </span>
              </div>
              <button 
                onClick={() => setActiveHistoryModal('net')}
                className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md hover:bg-emerald-100 transition-colors"
                id="btn-historial-neta"
              >
                Ver Historial
              </button>
            </div>
            
            <div className="text-2xl font-black text-slate-900 mt-4">
              ${currentStats.net.toLocaleString('es-MX')} <span className="text-xs font-bold text-slate-400">MXN</span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400">vs mes anterior:</span>
            {growthStats.netChange >= 0 ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight size={14} />
                <span>+{growthStats.netChange}%</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-red-600 flex items-center gap-0.5">
                <ArrowDownRight size={14} />
                <span>{growthStats.netChange}%</span>
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 4. MAIN CHARTS (GRAPH FOR EACH / COMBINED GRAPH OPTION) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="finance-chart-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Evolución de Rendimiento Financiero</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Gráfica analítica de cada una de las variables clave</p>
          </div>

          {/* Tab buttons to view each individual graph or all combined */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[10px] font-bold" id="chart-tab-selectors">
            <button 
              onClick={() => setActiveChartView('all')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeChartView === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Todos
            </button>
            <button 
              onClick={() => setActiveChartView('gross')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeChartView === 'gross' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              U. Bruta
            </button>
            <button 
              onClick={() => setActiveChartView('expenses')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeChartView === 'expenses' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Gastos
            </button>
            <button 
              onClick={() => setActiveChartView('net')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeChartView === 'net' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              U. Neta
            </button>
          </div>
        </div>

        {/* Dynamic SVG Line and Area Chart */}
        <div className="relative h-64 w-full" id="svg-analytics-container">
          <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="50" y1="20" x2="570" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="65" x2="570" y2="65" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="110" x2="570" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="155" x2="570" y2="155" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50" y1="200" x2="570" y2="200" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Axes Labels (Y) */}
            <text x="40" y="24" className="text-[9px] font-bold text-slate-400 text-right" textAnchor="end">${Math.round(chartMaxVal).toLocaleString()}</text>
            <text x="40" y="114" className="text-[9px] font-bold text-slate-400 text-right" textAnchor="end">${Math.round(chartMaxVal / 2).toLocaleString()}</text>
            <text x="40" y="204" className="text-[9px] font-bold text-slate-400 text-right" textAnchor="end">$0</text>

            {/* Months mapping (X axis coordinates) */}
            {orderedMonths.map((m, idx) => {
              const totalItems = orderedMonths.length;
              // Distribute evenly along the line
              const xCoord = 50 + (idx * (520 / (totalItems - 1)));
              const data = monthlyAggregates[m];

              // Y scale mapping helper
              const getY = (val: number) => {
                return 200 - ((val / chartMaxVal) * 180);
              };

              return (
                <g key={m}>
                  {/* Vertical dashed timeline */}
                  <line x1={xCoord} y1="20" x2={xCoord} y2="200" stroke="#f8fafc" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x={xCoord} y="215" className="text-[9px] font-bold text-slate-500" textAnchor="middle">{m.split(' ')[0]}</text>

                  {/* Draw points for selected line view */}
                  {(activeChartView === 'all' || activeChartView === 'gross') && (
                    <circle cx={xCoord} cy={getY(data.gross)} r="4.5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                  )}
                  {(activeChartView === 'all' || activeChartView === 'expenses') && (
                    <circle cx={xCoord} cy={getY(data.expenses)} r="4.5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  )}
                  {(activeChartView === 'all' || activeChartView === 'net') && (
                    <circle cx={xCoord} cy={getY(data.net)} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}

            {/* SVG Lines */}
            {/* 1. Gross Profit (Blue) */}
            {(activeChartView === 'all' || activeChartView === 'gross') && (
              <path
                d={orderedMonths.map((m, idx) => {
                  const x = 50 + (idx * (520 / (orderedMonths.length - 1)));
                  const y = 200 - ((monthlyAggregates[m].gross / chartMaxVal) * 180);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* 2. Expenses (Red) */}
            {(activeChartView === 'all' || activeChartView === 'expenses') && (
              <path
                d={orderedMonths.map((m, idx) => {
                  const x = 50 + (idx * (520 / (orderedMonths.length - 1)));
                  const y = 200 - ((monthlyAggregates[m].expenses / chartMaxVal) * 180);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* 3. Net Profit (Green) */}
            {(activeChartView === 'all' || activeChartView === 'net') && (
              <path
                d={orderedMonths.map((m, idx) => {
                  const x = 50 + (idx * (520 / (orderedMonths.length - 1)));
                  const y = 200 - ((monthlyAggregates[m].net / chartMaxVal) * 180);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </svg>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span>Utilidad Bruta (Ingresos)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500"></span>
            <span>Gastos Consolidados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span>Utilidad Neta Real</span>
          </div>
        </div>
      </div>

      {/* 5. TOP ANALYSIS DECK (Longest activities & Best sellers) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARD 1: TOP ACTIVIDADES MÁS TARDADAS (Fichas Técnicas hours) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="top-longest-activities-card">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-amber-500" />
                <span>Top de Actividades más Tardadas</span>
              </h3>
              <span className="text-[10px] bg-amber-50 text-amber-700 font-extrabold px-2.5 py-1 rounded-full">
                Diseños y Esfuerzo
              </span>
            </div>
            
            <div className="space-y-4">
              {topActivities.map((act, index) => {
                const maxHrs = Math.max(...topActivities.map(a => a.actualHours), 1);
                const percent = Math.min(100, Math.round((act.actualHours / maxHrs) * 100));

                return (
                  <div key={act.code} className="flex flex-col space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-800 leading-tight block">{act.name}</span>
                          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide">Código: {act.code}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-slate-950">{act.actualHours} hrs</span>
                        <span className={`block text-[8px] font-extrabold uppercase mt-0.5 ${
                          act.avgProgress === 100 ? 'text-emerald-500' : 'text-amber-500'
                        }`}>Avance {act.avgProgress}%</span>
                      </div>
                    </div>
                    {/* Progress representation */}
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-amber-400' : 'bg-amber-300'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-400">Estadísticas obtenidas del módulo de Operaciones (Módulo 3)</span>
            <button
              onClick={() => onNavigateToModule('operaciones')}
              className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
            >
              <span>Ver Taller</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* CARD 2: TOP PRODUCTOS MÁS VENDIDOS (Orders quantity) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" id="top-best-sellers-card">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5 mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Package size={16} className="text-blue-500" />
                <span>Top de Productos más Vendidos</span>
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-extrabold px-2.5 py-1 rounded-full">
                Volumen Comercial
              </span>
            </div>

            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  Aún no se han registrado pedidos en el Módulo de Ventas (Módulo 5).
                </div>
              ) : (
                topProducts.map((prod, index) => {
                  const maxQty = Math.max(...topProducts.map(p => p.quantity), 1);
                  const percent = Math.min(100, Math.round((prod.quantity / maxQty) * 100));

                  return (
                    <div key={prod.name} className="flex flex-col space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                            {index + 1}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 leading-tight block">{prod.name}</span>
                            <span className="text-[9px] font-semibold text-slate-400 mt-0.5 block">{prod.ordersCount} pedidos recibidos</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-950">{prod.quantity} unidades</span>
                          <span className="block text-[8px] font-bold text-slate-400 mt-0.5">Ingresos: ${prod.revenue.toLocaleString()} MXN</span>
                        </div>
                      </div>

                      {/* Progress representation */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-blue-400' : 'bg-blue-300'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center">
            <span className="text-[10px] text-slate-400">Estadísticas obtenidas del módulo de Marketing (Módulo 5)</span>
            <button
              onClick={() => onNavigateToModule('marketing')}
              className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5"
            >
              <span>Ver Pedidos</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* 6. PROYECTOS EN FILA (ACTIVE QUEUE PIPELINE IN WORKSHOP) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="active-pipeline-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Briefcase size={16} className="text-indigo-500" />
              <span>Proyectos en Fila de Producción</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Piezas y pedidos activos bajo desarrollo en el taller</p>
          </div>

          {/* Pipeline controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cliente, pieza o ID..."
                value={projectSearch}
                onChange={(e) => setProjectSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={projectStatusFilter}
              onChange={(e) => setProjectStatusFilter(e.target.value)}
              className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none cursor-pointer"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="Pendiente">Pendientes</option>
              <option value="En Producción">En Taller</option>
              <option value="Completado">Completados</option>
            </select>
          </div>
        </div>

        {/* Projects pipeline table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-100">
                <th className="py-2.5 px-3">Código / ID</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Producto / Pieza</th>
                <th className="py-2.5 px-3">Cantidad</th>
                <th className="py-2.5 px-3">Progreso del Proyecto</th>
                <th className="py-2.5 px-3">Estado Operativo</th>
                <th className="py-2.5 px-3 text-right">Entrega Planificada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectsInQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                    No se encontraron proyectos activos en la fila con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                projectsInQueue.map((proj) => {
                  const statusColors: Record<string, string> = {
                    'Pendiente': 'bg-rose-50 text-rose-600 border-rose-100',
                    'En Producción': 'bg-amber-50 text-amber-700 border-amber-100',
                    'Completado': 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  };

                  return (
                    <tr key={proj.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">{proj.id}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{proj.clientName}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{proj.productName}</td>
                      <td className="py-3 px-3 font-semibold text-slate-500">x{proj.quantity} piezas</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                proj.progress >= 90 ? 'bg-emerald-500' : proj.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${proj.progress}%` }}
                            ></div>
                          </div>
                          <span className="font-extrabold text-slate-700">{proj.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase ${statusColors[proj.status] || 'bg-slate-100 text-slate-500'}`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-500">{proj.deliveryDate}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. STRATEGIC OKRS TRACKER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" id="okr-card-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Target size={18} className="text-indigo-500" />
              <span>Objetivos Estratégicos y OKRs (Trimestre actual)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Control de metas de crecimiento de la empresa</p>
          </div>
          <button
            onClick={() => setShowOkrForm(!showOkrForm)}
            className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            id="btn-add-okr"
          >
            <Plus size={14} />
            <span>Nuevo OKR</span>
          </button>
        </div>

        {/* OKR Add Form */}
        {showOkrForm && (
          <form onSubmit={handleAddOkr} className="bg-slate-50 p-5 rounded-lg border border-slate-200 mb-6 space-y-4 animate-fadeIn">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Registrar Objetivo Estratégico</h4>
            {okrError && <p className="text-xs text-red-500 font-medium">{okrError}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Objetivo General</label>
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Ej. Incrementar la satisfacción del cliente"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Resultado Clave (KR)</label>
                <input
                  type="text"
                  value={newKeyResult}
                  onChange={(e) => setNewKeyResult(e.target.value)}
                  placeholder="Ej. Alcanzar un porcentaje del taller de"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Meta a Alcanzar</label>
                <input
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Unidad de Medida</label>
                <input
                  type="text"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  placeholder="Ej. %, clientes, pedidos, hrs"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-md shadow cursor-pointer transition-colors"
                >
                  Guardar Objetivo
                </button>
              </div>
            </div>
          </form>
        )}

        {/* OKRs List */}
        <div className="space-y-4" id="okrs-container">
          {okrs.map((okr) => {
            const percentage = Math.min(100, Math.round((okr.current / okr.target) * 100));
            const isEditing = editingOkrId === okr.id;

            return (
              <div key={okr.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Objetivo</span>
                    <h4 className="text-xs font-bold text-slate-850 leading-tight">{okr.objective}</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      <strong>KR:</strong> {okr.keyResult}
                    </p>
                  </div>

                  {/* Progress Metrics & Action */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-md shadow-sm">
                        <input
                          type="number"
                          value={editOkrValue}
                          onChange={(e) => setEditOkrValue(parseFloat(e.target.value) || 0)}
                          className="w-16 p-1 text-xs font-bold text-center border-0 outline-none"
                        />
                        <span className="text-xs text-slate-400 pr-1">{okr.unit}</span>
                        <button
                          type="button"
                          onClick={() => saveOkrValue(okr.id)}
                          className="bg-emerald-500 text-white rounded p-1 hover:bg-emerald-600 cursor-pointer"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="text-xs font-extrabold text-slate-800">
                          {okr.current} / {okr.target} <span className="text-[10px] text-slate-400 font-bold">{okr.unit}</span>
                        </div>
                        <button
                          onClick={() => startEditOkr(okr)}
                          className="text-[10px] text-indigo-500 hover:text-indigo-600 font-bold underline cursor-pointer mt-0.5 block"
                        >
                          Actualizar avance
                        </button>
                      </div>
                    )}
                    
                    <div className="w-11 h-11 rounded-full border-2 border-indigo-100 flex items-center justify-center text-xs font-extrabold text-indigo-600 bg-white shadow-inner">
                      {percentage}%
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-3.5">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. LEDGER INTERACTIVE MONTHLY HISTORY MODAL (DRAWER POPUP) */}
      {activeHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" id="monthly-history-ledger-modal">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold flex items-center gap-2">
                  <Calendar size={18} className="text-indigo-400" />
                  <span>
                    {activeHistoryModal === 'gross' ? 'Historial Mensual de Utilidad Bruta (Ventas)' :
                     activeHistoryModal === 'expenses' ? 'Historial Mensual de Gastos de Operación' :
                     'Historial Mensual de Utilidad Neta Real'}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-1">
                  Desglose contable histórico por periodo mensual
                </p>
              </div>
              <button 
                onClick={() => setActiveHistoryModal(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-900 p-1.5 rounded-lg border border-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Aggregated table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200">
                      <th className="py-2.5 px-3">Mes del Periodo</th>
                      <th className="py-2.5 px-3 text-right">
                        {activeHistoryModal === 'gross' ? 'Utilidad Bruta' :
                         activeHistoryModal === 'expenses' ? 'Suma de Gastos' :
                         'Utilidad Neta'}
                      </th>
                      <th className="py-2.5 px-3 text-right">Avance vs Mes Anterior</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {orderedMonths.map((m, idx) => {
                      const data = monthlyAggregates[m];
                      const val = activeHistoryModal === 'gross' ? data.gross :
                                  activeHistoryModal === 'expenses' ? data.expenses :
                                  data.net;

                      // Percent calculation
                      let growthStr = 'N/A';
                      let isPositive = true;
                      if (idx > 0) {
                        const prevM = orderedMonths[idx - 1];
                        const prevData = monthlyAggregates[prevM];
                        const prevVal = activeHistoryModal === 'gross' ? prevData.gross :
                                        activeHistoryModal === 'expenses' ? prevData.expenses :
                                        prevData.net;
                        if (prevVal !== 0) {
                          const pct = Math.round(((val - prevVal) / prevVal) * 100);
                          growthStr = `${pct >= 0 ? '+' : ''}${pct}%`;
                          isPositive = pct >= 0;
                        }
                      }

                      return (
                        <tr key={m} className={`hover:bg-slate-50/50 ${m === selectedMonth ? 'bg-indigo-50/40' : ''}`}>
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900">{m}</span>
                            {m === selectedMonth && <span className="ml-2.5 text-[8px] bg-indigo-100 text-indigo-700 font-black px-1.5 py-0.5 rounded uppercase">Seleccionado</span>}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-slate-900">
                            ${val.toLocaleString('es-MX')} MXN
                          </td>
                          <td className={`py-3 px-3 text-right font-bold ${
                            growthStr === 'N/A' ? 'text-slate-400' :
                            isPositive ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {growthStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Transactions details list of selected month */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <Activity size={14} className="text-slate-400" />
                  <span>Transacciones de {selectedMonth}</span>
                </h4>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {currentStats.transactionList.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No hay transacciones registradas por el usuario en este periodo todavía.
                    </div>
                  ) : (
                    currentStats.transactionList
                      .filter(tx => {
                        if (activeHistoryModal === 'gross') return tx.type === 'income';
                        if (activeHistoryModal === 'expenses') return tx.type === 'expense';
                        return true;
                      })
                      .map((tx) => (
                        <div key={tx.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs hover:bg-slate-100/50 transition-colors">
                          <div>
                            <span className="font-bold text-slate-800">{tx.concept}</span>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>Ref: {tx.id}</span>
                              <span>•</span>
                              <span>Cat: {tx.category}</span>
                              <span>•</span>
                              <span>Fecha: {tx.date}</span>
                            </div>
                          </div>
                          <span className={`font-extrabold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveHistoryModal(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
