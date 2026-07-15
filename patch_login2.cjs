const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');
code = code.replace("</div>\n            </div>\n          </div>\n          <div>\n            <label", "</div>\n          </div>\n          <div>\n            <label");
fs.writeFileSync('src/components/Login.tsx', code);
