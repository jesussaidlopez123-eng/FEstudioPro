/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Plus, X, Check } from 'lucide-react';
import { SystemAlert, AlertType } from '../types';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: SystemAlert[];
  onAddAlert: (type: AlertType, title: string, desc: string) => void;
  onAcknowledgeAlert: (id: string) => void;
  activeUsername: string;
}

export default function AlertsDrawer({ 
  isOpen, 
  onClose, 
  alerts, 
  onAddAlert, 
  onAcknowledgeAlert,
  activeUsername
}: AlertsDrawerProps) {
  const [showForm, setShowForm] = useState(false);
  const [alertType, setAlertType] = useState<AlertType>('urgent');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertDesc, setAlertDesc] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle.trim() || !alertDesc.trim()) {
      setError('Por favor, ingresa el título y la descripción del aviso.');
      return;
    }

    onAddAlert(alertType, alertTitle.trim(), alertDesc.trim());
    
    // Reset form
    setAlertTitle('');
    setAlertDesc('');
    setShowForm(false);
    setError('');
  };

  return (
    <div 
      className={`fixed top-0 bottom-0 right-0 w-[400px] max-w-full bg-white shadow-2xl flex flex-col z-[100] border-l border-slate-200 transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      id="alerts-drawer-container"
    >
      {/* Header */}
      <div className="p-5 border-b border-slate-800 bg-[#080f1e] text-white flex justify-between items-center">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Bell size={18} className="text-yellow-500 animate-pulse" />
          <span>🔔 Avisos del Sistema</span>
        </h3>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-blue-500 hover:bg-blue-600 text-white w-7 h-7 rounded-md text-base font-bold flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer"
            title="Crear nuevo aviso"
            id="btn-add-alert-drawer"
          >
            <Plus size={16} />
          </button>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white text-xl p-1 cursor-pointer transition-colors"
            aria-label="Cerrar avisos"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* New Alert Expandable Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-5 border-b border-slate-200 space-y-4 animate-fadeIn">
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tipo de Aviso
            </label>
            <select 
              value={alertType}
              onChange={(e) => setAlertType(e.target.value as AlertType)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs font-semibold outline-none focus:border-blue-500 transition-colors"
              id="alert-type-select"
            >
              <option value="urgent">🔴 Urgente (Rojo)</option>
              <option value="info">🔵 Información (Azul)</option>
              <option value="success">🟢 Confirmación (Verde)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Título del Aviso
            </label>
            <input 
              type="text" 
              value={alertTitle}
              onChange={(e) => setAlertTitle(e.target.value)}
              placeholder="Ej. Material Faltante o Retraso"
              className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500 transition-colors"
              id="alert-title-input"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Descripción
            </label>
            <textarea 
              value={alertDesc}
              onChange={(e) => setAlertDesc(e.target.value)}
              placeholder="Detalles sobre el aviso..."
              rows={2}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs outline-none focus:border-blue-500 transition-colors resize-none"
              id="alert-desc-textarea"
              required
            ></textarea>
          </div>

          <button 
            type="submit"
            className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-xs rounded-md shadow transition-colors cursor-pointer"
          >
            Publicar Aviso
          </button>
        </form>
      )}

      {/* Alerts Body */}
      <div className="flex-grow p-5 overflow-y-auto space-y-4 bg-slate-100" id="alerts-drawer-body">
        {alerts.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No hay avisos registrados en el sistema.
          </div>
        ) : (
          alerts.map((alert) => {
            const borderColors = {
              urgent: 'border-l-red-500',
              info: 'border-l-blue-500',
              success: 'border-l-emerald-500'
            };

            return (
              <div 
                key={alert.id}
                className={`bg-white border border-slate-200 border-l-4 ${borderColors[alert.type]} p-4 pr-12 rounded-lg shadow-sm transition-all duration-300 relative
                  ${alert.acknowledged ? 'opacity-50 grayscale-50 bg-slate-50 border-l-slate-300' : ''}`}
                id={`alert-card-${alert.id}`}
              >
                {/* Acknowledge Check Circle */}
                <button 
                  onClick={() => onAcknowledgeAlert(alert.id)}
                  className={`absolute top-4 right-4 w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer
                    ${alert.acknowledged 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-400'}`}
                  title={alert.acknowledged ? "Marcar como pendiente" : "Marcar como enterado"}
                >
                  {alert.acknowledged && <Check size={12} strokeWidth={3} />}
                </button>

                <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-semibold">
                  <span className="truncate max-w-[150px]">{alert.sender}</span>
                  <span>{alert.timestamp}</span>
                </div>
                
                <h4 className="text-xs font-bold text-slate-850 mb-1 leading-tight">
                  {alert.title}
                </h4>
                <p className="text-xs text-slate-500 leading-normal">
                  {alert.desc}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
