/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Target, 
  Ruler, 
  Hammer, 
  Briefcase, 
  Megaphone, 
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeModule: string;
  onModuleChange: (moduleId: string) => void;
  userRole: UserRole;
  onLogout: () => void;
}

export default function Sidebar({ activeModule, onModuleChange, userRole, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'direccion', label: '1. Dirección y Estrategia', icon: Target, roles: ['Admin'] },
    { id: 'ingenieria', label: '2. Diseño e Ingeniería', icon: Ruler, roles: ['Admin', 'Operador'] },
    { id: 'operaciones', label: '3. Operaciones y Taller', icon: Hammer, roles: ['Admin', 'Operador'] },
    { id: 'administracion', label: '4. Finanzas y Admin', icon: Briefcase, roles: ['Admin'] },
    { id: 'marketing', label: '5. Ventas y Pedidos', icon: Megaphone, roles: ['Admin'] },
    { id: 'configuracion', label: '6. Configuración', icon: Settings, roles: ['Admin'] },
  ];

  return (
    <nav className="w-72 bg-[#080f1e] text-white flex flex-col flex-shrink-0 shadow-lg border-r border-slate-800/50 overflow-y-auto scrollbar-thin" id="erp-sidebar">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3.5 border-b border-white/5">
        <div className="relative flex items-center justify-center w-10 h-10 border-2 border-slate-300 text-slate-300 font-sans text-xl font-light select-none
          after:content-[''] after:absolute after:-bottom-1 after:-right-1 after:w-2 after:h-2 after:bg-[#080f1e] after:border-t-2 after:border-l-2 after:border-blue-500">
          F.
        </div>
        <div className="flex flex-col">
          <span className="font-sans text-base font-semibold tracking-widest uppercase text-slate-200 leading-none">
            Estudio
          </span>
          <span className="text-[9px] text-blue-400 tracking-[1.5px] mt-1.5 uppercase font-medium">
            ERP Corporativo
          </span>
        </div>
      </div>

      {/* Menu List */}
      <ul className="flex-grow py-6 space-y-1.5">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const hasAccess = item.roles.includes(userRole);
          const isActive = activeModule === item.id;

          return (
            <li key={item.id}>
              <button
                onClick={() => hasAccess && onModuleChange(item.id)}
                disabled={!hasAccess}
                className={`w-full px-6 py-4 flex items-center gap-4 text-sm font-medium transition-all duration-200 text-left border-l-4 relative group
                  ${isActive 
                    ? 'bg-[#111a2f] text-white border-blue-500 font-semibold' 
                    : hasAccess 
                      ? 'text-slate-400 border-transparent hover:bg-[#111a2f]/50 hover:text-white cursor-pointer' 
                      : 'text-slate-600 border-transparent opacity-40 cursor-not-allowed'
                  }`}
                id={`sidebar-item-${item.id}`}
              >
                <IconComponent size={18} className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="flex-grow">{item.label}</span>
                
                {/* Locked Indicator for Operators */}
                {!hasAccess && (
                  <span className="text-[9px] font-semibold bg-red-950/50 text-red-400 px-2 py-0.5 rounded-full border border-red-900/30">
                    🔒 Bloqueado
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer Profile & Logout */}
      <div className="p-4 bg-[#111a2f]/40 border-t border-white/5 space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#111a2f]/60 border border-slate-800/40">
          <div className="w-10 h-10 bg-[#080f1e] text-white border border-slate-700/50 rounded-full flex items-center justify-center font-bold text-sm shadow-inner">
            {userRole === 'Admin' ? 'AD' : 'OP'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-200 truncate leading-tight">
              {userRole === 'Admin' ? 'Administrador' : 'Operador Taller'}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider mt-0.5
              ${userRole === 'Admin' ? 'text-emerald-400' : 'text-amber-400'}`}>
              • {userRole === 'Admin' ? 'Dirección' : 'Taller'}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-red-950/30 hover:text-red-400 text-slate-400 border border-slate-800 hover:border-red-900/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
          id="sidebar-logout-button"
        >
          <LogOut size={14} />
          <span>Cerrar Sesión ERP</span>
        </button>
      </div>
    </nav>
  );
}
