const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("if (!error && row && row.data) {", "if (!error && row && (row as any).data) {");
code = code.replace("const data = row.data;", "const data = (row as any).data;");
code = code.replace("if (payload.new && payload.new.data) {", "if (payload.new && (payload.new as any).data) {");
code = code.replace("const data = payload.new.data;", "const data = (payload.new as any).data;");
fs.writeFileSync('src/App.tsx', code);
