const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace(
  "    setTimeout(() => {",
  "    // setTimeout(() => {"
);
code = code.replace(
  "    }, 600);",
  "    // }, 600);"
);

fs.writeFileSync('src/components/Login.tsx', code);
