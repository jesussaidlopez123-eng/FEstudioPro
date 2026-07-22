const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes('const [syncError, setSyncError]')) {
  code = code.replace(
    'const [isAppLoaded, setIsAppLoaded] = useState(false);',
    'const [isAppLoaded, setIsAppLoaded] = useState(false);\n  const [syncError, setSyncError] = useState<string | null>(null);'
  );
  
  code = code.replace(
    /console\.error\("Error saving to Supabase", err\);/g,
    'console.error("Error saving to Supabase", err); setSyncError(err instanceof Error ? err.message : String(err));'
  );
  
  code = code.replace(
    /console\.error\("Error al sincronizar con Supabase:", error\);/g,
    'console.error("Error al sincronizar con Supabase:", error); setSyncError(error.message);'
  );
  
  code = code.replace(
    'if (!error && row && (row as any).data) {',
    'if (error) setSyncError(error.message);\n      if (!error && row && (row as any).data) { setSyncError(null);'
  );
  
  const uiError = `{syncError && <div className="fixed bottom-4 right-4 bg-red-600 text-white text-[10px] px-3 py-2 rounded-lg font-bold shadow-lg z-[9999] max-w-xs break-words">Error Sync: {syncError}</div>}`;
  code = code.replace(
    '<div className="flex h-screen overflow-hidden bg-slate-50 relative">',
    `<div className="flex h-screen overflow-hidden bg-slate-50 relative">\n      ${uiError}`
  );
  
  fs.writeFileSync('src/App.tsx', code);
  console.log('Patched App.tsx for sync error UI');
}
