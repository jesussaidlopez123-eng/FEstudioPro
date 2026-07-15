/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Briefcase, DollarSign, Plus, ArrowUpRight, ArrowDownRight, Filter, FileSpreadsheet, Percent, LayoutList, Calendar, BarChart3, CalendarDays } from 'lucide-react';
import { FinancialTransaction, TransactionType } from '../types';

interface ModuleAdministracionProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (transaction: FinancialTransaction) => void;
}

export default function ModuleAdministracion({
  transactions,
  onAddTransaction
}: ModuleAdministracionProps) {
  const categories = ['Venta', 'Materia Prima', 'Nómina', 'Herramientas', 'Servicios'];

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<number>(0);
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('Materia Prima');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  // Filtering State
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');

  // Month string helper
  const getMonthName = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const name = d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const monthlyAggregates = useMemo(() => {
    const aggregates: Record<string, { income: number; expense: number; net: number }> = {};
    
    // Always include current month to avoid empty select when no data
    const now = new Date();
    const currentMonthName = now.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const capitalizedCurrentMonth = currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1);
    aggregates[capitalizedCurrentMonth] = { income: 0, expense: 0, net: 0 };

    transactions.forEach(tx => {
      if (!tx.date) return;
      const monthLabel = getMonthName(tx.date);
      if (!aggregates[monthLabel]) {
        aggregates[monthLabel] = { income: 0, expense: 0, net: 0 };
      }
      if (tx.type === 'income') {
        aggregates[monthLabel].income += tx.amount;
      } else {
        aggregates[monthLabel].expense += tx.amount;
      }
      aggregates[monthLabel].net = aggregates[monthLabel].income - aggregates[monthLabel].expense;
    });
    return aggregates;
  }, [transactions]);

  const availableMonths = useMemo(() => {
    const monthsMap: Record<string, number> = {
      'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
      'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
    };
    return Object.keys(monthlyAggregates).sort((a, b) => {
      const [mA, yA] = a.split(' ');
      const [mB, yB] = b.split(' ');
      const dateA = new Date(parseInt(yA), monthsMap[mA] || 0, 1);
      const dateB = new Date(parseInt(yB), monthsMap[mB] || 0, 1);
      return dateB.getTime() - dateA.getTime();
    });
  }, [monthlyAggregates]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] || '');

  React.useEffect(() => {
    if (availableMonths.length > 0 && (!selectedMonth || !availableMonths.includes(selectedMonth))) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  const currentMonthData = monthlyAggregates[selectedMonth] || { income: 0, expense: 0, net: 0 };

  // Calculations derived dynamically (All-time)
  const totalIncomes = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netBalance = totalIncomes - totalExpenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim() || amount <= 0 || !date) {
      setError('Por favor, ingresa un concepto válido, fecha y un monto mayor a cero.');
      return;
    }

    const newTx: FinancialTransaction = {
      id: `TX-${Date.now()}`,
      type,
      amount,
      concept: concept.trim(),
      date,
      category: type === 'income' ? 'Venta' : category
    };

    onAddTransaction(newTx);
    
    // Reset Form
    setConcept('');
    setAmount(0);
    setShowForm(false);
    setError('');
  };

  // Filtered Ledger entries
  const filteredTransactions = transactions.filter((tx) => {
    const matchCategory = filterCategory === 'All' || tx.category === filterCategory;
    const matchType = filterType === 'All' || tx.type === filterType;
    return matchCategory && matchType;
  });

  return (
    <div className="space-y-6 animate-fadeIn" id="module-administracion-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Briefcase size={22} className="text-blue-500" />
            <span>Administración y Finanzas Corporativas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de caja chica, pago de nóminas, conciliación de gastos y registros contables del taller.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-500/10"
          id="btn-toggle-transaction-form"
        >
          <Plus size={15} />
          <span>Registrar Movimiento</span>
        </button>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="finances-summary-grid">
        {/* Caja Chica / Liquid Balance */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute right-4 top-4 text-slate-800 opacity-40">
            <DollarSign size={80} />
          </div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">
            Caja Chica / Flujo Disponible
          </span>
          <div className="text-3xl font-black mt-3" id="finances-liquid-balance">
            ${netBalance.toLocaleString('es-MX')} MXN
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium">
            Saldo de capital operativo para compras inmediatas.
          </p>
        </div>

        {/* Total Incomes */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Entradas Totales (Ingresos)
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-3 text-emerald-600 flex items-center gap-1" id="finances-total-incomes">
              <ArrowUpRight size={20} />
              <span>${totalIncomes.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium border-t border-slate-50 pt-2">
            Proveniente de anticipos y cierres de pedidos de ventas.
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow transition-all flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Egresos Totales (Gastos)
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-3 text-red-500 flex items-center gap-1" id="finances-total-expenses">
              <ArrowDownRight size={20} />
              <span>${totalExpenses.toLocaleString('es-MX')} MXN</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-medium border-t border-slate-50 pt-2">
            Nóminas, consumibles, renta y materia prima.
          </p>
        </div>
      </div>

      {/* Monthly Breakdown Widget */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-850 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              <span>Reporte Financiero Mensual</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Desglose de ingresos, egresos y utilidad por mes. Los datos se calculan automáticamente del libro mayor.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ver Mes:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
            >
              {availableMonths.length === 0 && <option value="">Sin datos registrados</option>}
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <ArrowUpRight size={14} className="text-emerald-500" /> Ingresos del Mes
            </span>
            <span className="text-xl font-black text-emerald-600 font-mono">
              ${currentMonthData.income.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1">
              <ArrowDownRight size={14} className="text-red-500" /> Egresos del Mes
            </span>
            <span className="text-xl font-black text-red-600 font-mono">
              ${currentMonthData.expense.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className={`border rounded-xl p-4 flex flex-col justify-center ${currentMonthData.net >= 0 ? 'bg-blue-50/50 border-blue-100' : 'bg-red-50/50 border-red-100'}`}>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 mb-1 ${currentMonthData.net >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
              <DollarSign size={14} /> Utilidad (Neta)
            </span>
            <span className={`text-xl font-black font-mono ${currentMonthData.net >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              ${currentMonthData.net.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid container for Add Form & Ledger table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Transaction Form / Analytics */}
        <div className="lg:col-span-4 space-y-6">
          {showForm ? (
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4 animate-fadeIn" id="transaction-form">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Percent size={14} className="text-blue-500" />
                <span>Registrar Entrada / Salida</span>
              </h3>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Tipo de Movimiento</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer
                      ${type === 'expense' 
                        ? 'bg-red-500 text-white border-red-500' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                  >
                    🔴 Egreso (Gasto)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer
                      ${type === 'income' 
                        ? 'bg-emerald-500 text-white border-emerald-500' 
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                  >
                    🟢 Ingreso (Venta)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Monto en Pesos ($ MXN)</label>
                <input
                  type="number"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Concepto o Descripción</label>
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej. Compra de perfiles o Anticipo de obra"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>

              {type === 'expense' && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Categoría del Gasto</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {categories.filter(cat => cat !== 'Venta').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Fecha del Movimiento</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-grow py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-blue-500/10"
                >
                  Registrar
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Salud Contable Global</h3>
              
              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Materia Prima (Metales / Maderas):</span>
                    <span className="text-slate-800">35% del egreso</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[35%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Nóminas del Personal Taller:</span>
                    <span className="text-slate-800">45% del egreso</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[45%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Mantenimiento e indirectos:</span>
                    <span className="text-slate-800">20% del egreso</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full w-[20%]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3.5 text-[11px] text-blue-800 font-medium flex items-center gap-2 mt-4">
                <FileSpreadsheet size={15} className="text-blue-500 flex-shrink-0" />
                <span>Todos los movimientos concilian al SAT bajo facturación electrónica automática.</span>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Ledger Table */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
            
            {/* Filtering bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <LayoutList size={14} />
                <span>Libro Mayor Contable</span>
              </h3>

              <div className="flex items-center gap-3">
                {/* Category Filter */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                  <Filter size={12} />
                  <span>Filtrar:</span>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-xs text-slate-700 font-bold"
                  >
                    <option value="All">Categorías (Todas)</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none text-xs text-slate-700 font-bold"
                >
                  <option value="All">Tipo (Todos)</option>
                  <option value="income">🟢 Ingreso</option>
                  <option value="expense">🔴 Egreso</option>
                </select>
              </div>
            </div>

            {/* Ledger table */}
            <div className="overflow-x-auto max-h-[420px] overflow-y-auto" id="ledger-table-container">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[9px] border-b border-slate-100">
                    <th className="py-2.5 px-4"><span className="flex items-center gap-1"><Calendar size={11} /> Fecha</span></th>
                    <th className="py-2.5 px-4">Concepto / Movimiento</th>
                    <th className="py-2.5 px-4">Categoría</th>
                    <th className="py-2.5 px-4 text-right">Monto ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/50" id={`ledger-row-${tx.id}`}>
                        <td className="py-2.5 px-4 text-slate-500 font-semibold">{tx.date}</td>
                        <td className="py-2.5 px-4">
                          <div className="font-bold text-slate-800 leading-normal">{tx.concept}</div>
                          <div className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">{tx.id}</div>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border
                            ${isIncome ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : ''}
                            ${tx.category === 'Materia Prima' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                            ${tx.category === 'Nómina' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : ''}
                            ${tx.category === 'Herramientas' ? 'bg-red-50 text-red-700 border-red-100' : ''}
                            ${tx.category === 'Servicios' ? 'bg-slate-100 text-slate-700 border-slate-200' : ''}`}>
                            {tx.category}
                          </span>
                        </td>
                        <td className={`py-2.5 px-4 text-right font-extrabold text-sm
                          ${isIncome ? 'text-emerald-600' : 'text-slate-850'}`}>
                          {isIncome ? '+' : '-'}${tx.amount.toLocaleString('es-MX')}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-400 text-xs">
                        No hay movimientos registrados que cumplan con los filtros seleccionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
