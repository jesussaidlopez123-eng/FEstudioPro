import React, { useState, useMemo } from 'react';
import { Megaphone, Calendar, CalendarDays, BarChart2, Plus, Instagram, Facebook, LayoutTemplate, MessageCircle, Eye, ThumbsUp, Smartphone, Edit3, Save, X, Hash, Filter } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface PostMetric {
  reach: number;
  likes: number;
  messagesGenerated: number;
}

interface Post {
  id: string;
  code: string;
  platform: string;
  type: string;
  title: string;
  date: string;
  status: string;
  metrics?: PostMetric;
}

interface PlatformStat {
  platform: string;
  followers: number;
  url: string;
  notes: string;
}

export default function ModuleMarketing() {
  const [showForm, setShowForm] = useState(false);
  const [editingMetricsId, setEditingMetricsId] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformStat | null>(null);
  
  const [editFollowers, setEditFollowers] = useState(0);
  const [editUrl, setEditUrl] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const [platformStats, setPlatformStats] = useState<PlatformStat[]>([
    { platform: 'Facebook', followers: 15200, url: 'facebook.com/taller', notes: 'Audiencia principal: 35-55 años.' },
    { platform: 'Instagram', followers: 8400, url: 'instagram.com/taller', notes: 'Enfoque en diseño e interiores.' },
    { platform: 'TikTok', followers: 2300, url: 'tiktok.com/@taller', notes: 'Procesos de fabricación viral.' },
    { platform: 'WhatsApp', followers: 450, url: 'wa.me/message/...', notes: 'Lista de difusión VIP.' }
  ]);

  const [globalMessages, setGlobalMessages] = useState<number>(342);

  const [posts, setPosts] = useState<Post[]>([
    { id: 'post-1', code: 'INS-452', platform: 'Instagram', type: 'Reel', title: 'Fabricación mesa de parota', date: '2026-07-16', status: 'Programado' },
    { id: 'post-2', code: 'FAC-891', platform: 'Facebook', type: 'Imagen', title: 'Promo Buen Fin', date: '2026-07-20', status: 'Borrador' },
    { id: 'post-3', code: 'TIK-104', platform: 'TikTok', type: 'Video', title: 'Antes y Después', date: '2026-07-14', status: 'Publicado', metrics: { reach: 14500, likes: 1200, messagesGenerated: 45 } }
  ]);

  const [platform, setPlatform] = useState('Instagram');
  const [type, setType] = useState('Imagen');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Borrador');

  const [reach, setReach] = useState(0);
  const [likes, setLikes] = useState(0);
  const [messagesGenerated, setMessagesGenerated] = useState(0);

  const [chartMetric, setChartMetric] = useState('reach');

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;
    const newPost: Post = {
      id: `post-${Date.now()}`,
      code: `${platform.substring(0,3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      platform, type, title, date, status
    };
    setPosts([...posts, newPost]);
    setTitle('');
    setShowForm(false);
  };

  const startEditingMetrics = (post: Post) => {
    setEditingMetricsId(post.id);
    setReach(post.metrics?.reach || 0);
    setLikes(post.metrics?.likes || 0);
    setMessagesGenerated(post.metrics?.messagesGenerated || 0);
  };

  const saveMetrics = (id: string) => {
    const newPosts = posts.map(p => {
      if (p.id === id) {
        const diff = messagesGenerated - (p.metrics?.messagesGenerated || 0);
        if (diff > 0) setGlobalMessages(prev => prev + diff);
        return { ...p, metrics: { reach, likes, messagesGenerated } };
      }
      return p;
    });
    setPosts(newPosts);
    setEditingMetricsId(null);
  };

  const openPlatformModal = (stat: PlatformStat) => {
    setSelectedPlatform(stat);
    setEditFollowers(stat.followers);
    setEditUrl(stat.url);
    setEditNotes(stat.notes);
  };

  const savePlatformInfo = () => {
    if (!selectedPlatform) return;
    const newStats = platformStats.map(s => {
      if (s.platform === selectedPlatform.platform) {
        return { ...s, followers: editFollowers, url: editUrl, notes: editNotes };
      }
      return s;
    });
    setPlatformStats(newStats);
    setSelectedPlatform(null);
  };

  const getPlatformIcon = (plat: string) => {
    switch (plat) {
      case 'Instagram': return <Instagram size={14} className="text-pink-600" />;
      case 'Facebook': return <Facebook size={14} className="text-blue-600" />;
      case 'TikTok': return <span className="font-bold text-slate-800 tracking-tighter text-[10px]">TikTok</span>;
      case 'WhatsApp': return <MessageCircle size={14} className="text-emerald-500" />;
      default: return <Megaphone size={14} className="text-slate-600" />;
    }
  };

  const getStatusStyle = (st: string) => {
    switch (st) {
      case 'Publicado': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Programado': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Borrador': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const renderMetricsBlock = (post: Post) => {
    if (post.status === 'Publicado') {
      return (
        <div className="flex items-center justify-end gap-2">
          {post.metrics ? (
            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
              <span className="flex items-center gap-0.5" title="Alcance"><Eye size={10} className="text-blue-500"/> {post.metrics.reach.toLocaleString()}</span>
              <span className="flex items-center gap-0.5" title="Interacciones"><ThumbsUp size={10} className="text-pink-500"/> {post.metrics.likes.toLocaleString()}</span>
              <span className="flex items-center gap-0.5" title="Mensajes"><MessageCircle size={10} className="text-emerald-500"/> {post.metrics.messagesGenerated.toLocaleString()}</span>
              <button onClick={() => startEditingMetrics(post)} className="ml-1 text-slate-400 hover:text-blue-500 p-0.5"><Edit3 size={10}/></button>
            </div>
          ) : (
            <button
              onClick={() => startEditingMetrics(post)}
              className="text-[9px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded border border-blue-100 transition-colors cursor-pointer"
            >
              + Cargar
            </button>
          )}
        </div>
      );
    }
    return <span className="text-[9px] text-slate-400 italic">Pendiente</span>;
  };

  const renderEditorRow = (post: Post, colSpan: number) => {
    if (editingMetricsId !== post.id) return null;
    return (
      <tr className="bg-blue-50/50 border-b border-blue-100">
        <td colSpan={colSpan} className="py-2 px-3 shadow-inner">
          <div className="flex flex-wrap items-center justify-end gap-3 bg-white p-2 rounded border border-blue-100 shadow-sm">
            <div className="flex items-center gap-1">
              <Eye size={12} className="text-slate-400"/>
              <input type="number" min="0" value={reach} onChange={e => setReach(parseInt(e.target.value) || 0)} className="w-20 p-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono outline-none focus:border-blue-500" placeholder="Alcance" />
            </div>
            <div className="flex items-center gap-1">
              <ThumbsUp size={12} className="text-slate-400"/>
              <input type="number" min="0" value={likes} onChange={e => setLikes(parseInt(e.target.value) || 0)} className="w-20 p-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono outline-none focus:border-blue-500" placeholder="Likes" />
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle size={12} className="text-slate-400"/>
              <input type="number" min="0" value={messagesGenerated} onChange={e => setMessagesGenerated(parseInt(e.target.value) || 0)} className="w-20 p-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono outline-none focus:border-blue-500" placeholder="Mensajes" />
            </div>
            <div className="flex items-center gap-1 border-l border-slate-200 pl-3 ml-1">
              <button onClick={() => setEditingMetricsId(null)} className="text-[10px] font-bold text-slate-500 hover:text-slate-700 px-2 py-1 rounded cursor-pointer">Cancelar</button>
              <button onClick={() => saveMetrics(post.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 cursor-pointer"><Save size={10} /> Guardar</button>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const published = posts.filter(p => p.status === 'Publicado' && p.metrics);
    const dates = Array.from(new Set(published.map(p => p.date))).sort();
    
    return dates.map(date => {
      const dayPosts = published.filter(p => p.date === date);
      const dataPoint: any = { name: date };
      
      platformStats.forEach(stat => {
        const platformPosts = dayPosts.filter(p => p.platform === stat.platform);
        const total = platformPosts.reduce((acc, p) => acc + (p.metrics?.[chartMetric as keyof PostMetric] || 0), 0);
        dataPoint[stat.platform] = total;
      });
      
      return dataPoint;
    });
  }, [posts, chartMetric, platformStats]);

  const COLORS = ['#3b82f6', '#ec4899', '#10b981'];

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-100px)] overflow-y-auto pr-2 pb-6 space-y-4 animate-fadeIn" id="module-marketing-view">
      {/* Header */}
      <div className="flex-none flex items-center justify-between border-b border-slate-200 pb-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Megaphone size={18} className="text-blue-500" />
            <span>Marketing</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg shadow-sm">
            <MessageCircle size={14} className="text-emerald-500" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-emerald-600 tracking-wider leading-none">Mensajes Venta</span>
              <span className="text-xs font-black leading-none mt-0.5">{globalMessages}</span>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            <Plus size={14} /> Nueva Pub.
          </button>
        </div>
      </div>

      {/* Network Categories Grid */}
      <div className="flex-none grid grid-cols-2 md:grid-cols-4 gap-3">
        {platformStats.map(stat => (
          <div 
            key={stat.platform} 
            onClick={() => openPlatformModal(stat)}
            className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm relative overflow-hidden group cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-1.5">
              <div className="flex items-center gap-1.5">
                {getPlatformIcon(stat.platform)}
                <span className="text-xs font-extrabold text-slate-800">{stat.platform}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                {stat.followers.toLocaleString()} Seg.
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-medium truncate mb-2">
              {stat.notes}
            </p>
            <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] font-bold text-blue-500">
              <span className="text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors truncate">
                Abrir Pestaña
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Middle: Content Calendar Table (Expanded) */}
        <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[450px]">
          <div className="flex-none p-2 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays size={12} className="text-blue-500" /> Calendario General
            </h3>
            <span className="text-[8px] text-slate-400 font-bold px-1.5 py-0.5">
              Datos vinculados a cada pestaña de red
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr className="text-slate-400 font-bold uppercase text-[8px] border-b border-slate-100">
                  <th className="py-2 px-3">Código/Fecha</th>
                  <th className="py-2 px-3">Contenido</th>
                  <th className="py-2 px-3 text-center">Estado</th>
                  <th className="py-2 px-3 text-right">Métricas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(post => (
                  <React.Fragment key={post.id}>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 w-[120px]">
                        <div className="font-mono font-bold text-slate-500 text-[9px]">{post.code}</div>
                        <div className="text-slate-400 text-[9px]">{post.date}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-800 text-[10px] truncate max-w-[200px]">{post.title}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {getPlatformIcon(post.platform)}
                          <span className="text-[8px] uppercase font-bold text-slate-400">{post.platform}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center w-[120px]">
                        <select
                          value={post.status}
                          onChange={(e) => {
                            const newPosts = posts.map(p => p.id === post.id ? { ...p, status: e.target.value } : p);
                            setPosts(newPosts);
                          }}
                          className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border outline-none cursor-pointer uppercase ${getStatusStyle(post.status)}`}
                        >
                          <option value="Borrador">Borrador</option>
                          <option value="Programado">Programado</option>
                          <option value="Publicado">Publicado</option>
                        </select>
                      </td>
                      <td className="py-2 px-3 w-[300px]">
                        {renderMetricsBlock(post)}
                      </td>
                    </tr>
                    {renderEditorRow(post, 4)}
                  </React.Fragment>
                ))}
                {posts.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-6 text-slate-400 text-xs">Sin publicaciones.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom: Chart Performance Summary */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col min-h-[400px]">
          <div className="flex-none flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 size={12} className="text-blue-500" /> Rendimiento por Red Social
            </h3>
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-slate-400" />
              <select
                value={chartMetric}
                onChange={(e) => setChartMetric(e.target.value)}
                className="text-[9px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded outline-none px-2 py-0.5 cursor-pointer"
              >
                <option value="reach">Alcance</option>
                <option value="likes">Interacciones</option>
                <option value="messagesGenerated">Mensajes</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 w-full flex items-center justify-center">
            {chartData.length === 0 ? (
              <div className="text-[10px] text-slate-400 italic">No hay datos suficientes para mostrar la gráfica.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #e2e8f0' }} 
                  />
                  <Line type="monotone" dataKey="Instagram" name="Instagram" stroke="#ec4899" strokeWidth={2} dot={{ r: 3, fill: '#ec4899', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="Facebook" name="Facebook" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="TikTok" name="TikTok" stroke="#000000" strokeWidth={2} dot={{ r: 3, fill: '#000000', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="WhatsApp" name="WhatsApp" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* MODAL: Add New Post */}
      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fadeIn overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <LayoutTemplate size={14} className="text-blue-500" /> Programar Contenido
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-full p-1 cursor-pointer">
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleAddPost} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Título</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-blue-500 font-medium" required placeholder="Ej. Promoción especial" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Plataforma</label>
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-blue-500 font-bold text-slate-700 cursor-pointer">
                    <option>Instagram</option><option>Facebook</option><option>TikTok</option><option>WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Formato</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-blue-500 font-bold text-slate-700 cursor-pointer">
                    <option>Imagen</option><option>Carrusel</option><option>Video</option><option>Historia</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Fecha</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-blue-500 cursor-pointer" required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Estado</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-xs outline-none focus:border-blue-500 font-bold text-slate-700 cursor-pointer">
                    <option>Borrador</option><option>Programado</option><option>Publicado</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold text-[11px] rounded-lg cursor-pointer">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 shadow-sm shadow-blue-500/20 text-white font-bold text-[11px] rounded-lg cursor-pointer">Guardar Publicación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Platform Data & Posts */}
      {selectedPlatform && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col animate-fadeIn overflow-hidden">
            
            <div className="flex-none bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getPlatformIcon(selectedPlatform.platform)}
                <h3 className="text-sm font-bold text-slate-800">Pestaña: {selectedPlatform.platform}</h3>
              </div>
              <button onClick={() => setSelectedPlatform(null)} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-full p-1 cursor-pointer">
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">Seguidores</label>
                  <input type="number" value={editFollowers} onChange={e => setEditFollowers(parseInt(e.target.value) || 0)} className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs outline-none focus:border-blue-500 font-mono" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">URL Perfil</label>
                  <input type="text" value={editUrl} onChange={e => setEditUrl(e.target.value)} className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs outline-none focus:border-blue-500 font-medium" />
                </div>
                <div className="flex-[2] min-w-[150px]">
                  <label className="block text-[9px] font-bold text-slate-600 uppercase mb-1">Notas</label>
                  <input type="text" value={editNotes} onChange={e => setEditNotes(e.target.value)} className="w-full p-1.5 bg-white border border-slate-200 rounded text-xs outline-none focus:border-blue-500 font-medium" />
                </div>
                <div>
                  <button onClick={savePlatformInfo} className="h-8 px-3 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold rounded cursor-pointer flex items-center gap-1">
                    <Save size={12} /> Guardar
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs bg-white">
                  <thead className="bg-slate-50">
                    <tr className="text-slate-400 font-bold uppercase text-[8px] border-b border-slate-200">
                      <th className="py-2 px-3">Código/Fecha</th>
                      <th className="py-2 px-3">Título</th>
                      <th className="py-2 px-3 text-center">Estado</th>
                      <th className="py-2 px-3 text-right">Métricas Vinculadas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {posts.filter(p => p.platform === selectedPlatform.platform).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(post => (
                      <React.Fragment key={post.id}>
                        <tr className="hover:bg-slate-50/50">
                          <td className="py-2 px-3">
                            <div className="font-mono font-bold text-slate-700 text-[9px]">{post.code}</div>
                            <div className="text-slate-400 text-[9px]">{post.date}</div>
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-800 text-[10px]">{post.title}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase ${getStatusStyle(post.status)}`}>{post.status}</span>
                          </td>
                          <td className="py-2 px-3 w-[250px]">
                            {renderMetricsBlock(post)}
                          </td>
                        </tr>
                        {renderEditorRow(post, 4)}
                      </React.Fragment>
                    ))}
                    {posts.filter(p => p.platform === selectedPlatform.platform).length === 0 && (
                      <tr><td colSpan={4} className="text-center py-6 text-slate-400 text-[10px]">Sin publicaciones.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
