const fs = require('fs');
let code = fs.readFileSync('src/components/ModuleIngenieria.tsx', 'utf-8');

const replaceUI = /\{referenceImages\.length > 0 \? \`\$\{referenceImages\.length\} fotos adjuntas \(haz clic abajo para editar nombre\)\` : 'Adjuntar fotos de referencia'\}/g;

const newUI = `{isUploading ? 'Subiendo imagen...' : (referenceImages.length > 0 ? \`\$\{referenceImages.length\} fotos adjuntas (haz clic abajo para editar nombre)\` : 'Adjuntar fotos de referencia')}`;

code = code.replace(replaceUI, newUI);

fs.writeFileSync('src/components/ModuleIngenieria.tsx', code);
