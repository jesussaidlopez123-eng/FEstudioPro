const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleIngenieria.tsx', 'utf-8');

code = code.replace(
  "<form onSubmit={confirmQueueSubmission} className=\"bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[440px] w-full overflow-hidden\" id=\"queue-conf-modal\">",
  "<form onSubmit={(e) => { e.preventDefault(); confirmQueueSubmission(e); }} className=\"bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[440px] w-full overflow-hidden\" id=\"queue-conf-modal\">"
);

code = code.replace(
  "                  <button\n                    type=\"submit\"\n                    className=\"px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-emerald-500/15\"\n                  >\n                    Confirmar Envío\n                  </button>",
  "                  <button\n                    type=\"button\"\n                    onClick={confirmQueueSubmission}\n                    className=\"px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-emerald-500/15\"\n                  >\n                    Confirmar Envío\n                  </button>"
);

code = code.replace(
  "<form onSubmit={handleDirectQueueSubmit} className=\"bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[500px] w-full overflow-hidden\">",
  "<form onSubmit={(e) => { e.preventDefault(); handleDirectQueueSubmit(e); }} className=\"bg-white rounded-xl shadow-2xl border border-slate-200 max-w-[500px] w-full overflow-hidden\">"
);

code = code.replace(
  "                  <button\n                    type=\"submit\"\n                    className=\"px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-blue-500/15\"\n                  >\n                    Mandar a Fila de Trabajo\n                  </button>",
  "                  <button\n                    type=\"button\"\n                    onClick={handleDirectQueueSubmit}\n                    className=\"px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs rounded-lg shadow cursor-pointer shadow-blue-500/15\"\n                  >\n                    Mandar a Fila de Trabajo\n                  </button>"
);

fs.writeFileSync('src/components/ModuleIngenieria.tsx', code);
