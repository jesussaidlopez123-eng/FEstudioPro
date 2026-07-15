import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, EyeOff, KeyRound, AlertCircle } from 'lucide-react';
import { UserRole, AppUser } from '../types';

interface LoginProps {
  onLogin: (role: UserRole) => void;
  users?: AppUser[];
}

export default function Login({ onLogin, users = [] }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      const user = users.find(u => u.username === username);
      if (!user) {
        setError('Usuario no encontrado');
        setLoading(false);
        return;
      }
      
      if (user.passwordHash !== password) {
        setError('Contraseña incorrecta');
        setLoading(false);
        return;
      }

      onLogin(user.role);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-radial from-[#111a2f] to-[#080f1e] z-50 overflow-y-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[420px] p-8 md:p-10 bg-[#111a2f] border border-[#1e293b] rounded-xl shadow-2xl shadow-black/60 text-center text-white"
        id="login-card"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-14 h-14 border-2 border-slate-300 text-slate-300 font-sans text-3xl font-light mb-4 select-none
            after:content-[''] after:absolute after:-bottom-1.5 after:-right-1.5 after:w-3 after:h-3 after:bg-[#111a2f] after:border-t-2 after:border-l-2 after:border-blue-500">
            F.
          </div>
          <h1 className="font-sans text-xl font-semibold tracking-[6px] uppercase text-slate-300">
            Estudio
          </h1>
          <span className="text-[10px] text-blue-400 tracking-[3px] mt-2 uppercase font-semibold">
            Centro de Comando ERP
          </span>
        </div>

        <form onSubmit={handleSubmit} className="text-left space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Usuario de Acceso
            </label>
            <div className="relative">
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-3 px-4 pr-10 bg-[#080f1e]/80 border border-[#1e293b] rounded-lg text-white text-sm outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer font-medium"
                id="login-role-select"
                required
              >
                <option value="" disabled>Selecciona un usuario</option>
                {users.map(u => (
                  <option key={u.id} value={u.username}>{u.username} ({u.role})</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Contraseña de Seguridad
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <KeyRound size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña de acceso"
                className="w-full py-3 pl-10 pr-10 bg-[#080f1e]/80 border border-[#1e293b] rounded-lg text-white text-sm outline-none focus:border-blue-500 transition-colors"
                id="login-password-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center text-xs text-slate-500 gap-1.5 py-1">
            <Shield size={14} className="text-blue-500/80" />
            <span>Acceso restringido para personal autorizado de F. Estudio.</span>
          </div>

          {error && (
            <div className="text-red-400 text-xs flex items-center gap-1.5 bg-red-500/10 p-2 rounded border border-red-500/20">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-semibold text-sm rounded-lg shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
            id="login-submit-button"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sincronizando ERP...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
