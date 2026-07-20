import React, { useState } from 'react';
import { Settings, Shield, UserPlus, Key, Trash2, Edit2, Users } from 'lucide-react';
import { AppUser, UserRole } from '../types';

interface ModuleConfiguracionProps {
  users: AppUser[];
  onAddUser: (user: Omit<AppUser, 'id'>) => void;
  onUpdateUser: (id: string, updates: Partial<AppUser>) => void;
  onDeleteUser: (id: string) => void;
  onResetSystem: () => void;
}

export default function ModuleConfiguracion({ users, onAddUser, onUpdateUser, onDeleteUser, onResetSystem }: ModuleConfiguracionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('Operador');
  const [password, setPassword] = useState('');

  const handleOpenForm = (user?: AppUser) => {
    if (user) {
      setEditingId(user.id);
      setUsername(user.username);
      setRole(user.role);
      setPassword(user.passwordHash);
    } else {
      setEditingId(null);
      setUsername('');
      setRole('Operador');
      setPassword('');
    }
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    if (editingId) {
      onUpdateUser(editingId, { username, role, passwordHash: password });
    } else {
      onAddUser({ username, role, passwordHash: password });
    }
    setShowForm(false);
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn" id="module-configuracion-view">
      {/* Header */}
      <div className="flex-none flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings size={22} className="text-blue-500" />
            <span>Configuración del Sistema</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">Gestión de usuarios y accesos</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if(window.confirm('ADVERTENCIA: Esta acción eliminará permanentemente todos los datos de fichas técnicas, pedidos, tareas, alertas y configuraciones, dejándolo en su estado de fábrica inicial. Se preservarán los usuarios actuales. ¿Estás seguro que deseas continuar?')) {
                onResetSystem();
              }
            }}
            className="text-sm font-bold bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 border border-red-200 transition-all cursor-pointer"
          >
            <Trash2 size={16} /> Restaurar de Fábrica
          </button>
          <button
            onClick={() => handleOpenForm()}
            className="text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
          >
            <UserPlus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
          <Shield size={16} className="text-slate-500" />
          <h3 className="text-sm font-bold text-slate-700">Usuarios Registrados</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4 text-center">Contraseña</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-700">{user.username}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      user.role === 'Admin' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {user.passwordHash}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenForm(user)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Editar">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => onDeleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-5 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                {editingId ? <Edit2 size={18} className="text-blue-500" /> : <UserPlus size={18} className="text-blue-500" />}
                {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Nombre de Usuario</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Users size={14} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full py-2.5 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-medium"
                    required
                    placeholder="Ej. juan_taller"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Rol en el Sistema</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-medium cursor-pointer"
                >
                  <option value="Admin">Administrador (Dirección)</option>
                  <option value="Operador">Operador (Taller)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Contraseña</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Key size={14} />
                  </span>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-2.5 pl-9 pr-3 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 font-medium"
                    required
                    placeholder="Contraseña de acceso"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg cursor-pointer transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-lg shadow-sm shadow-blue-500/20 cursor-pointer transition-all">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
