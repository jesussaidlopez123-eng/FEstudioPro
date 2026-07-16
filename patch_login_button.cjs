const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf-8');

code = code.replace(
  "<form onSubmit={handleSubmit} className=\"text-left space-y-5\">",
  "<form onSubmit={(e) => e.preventDefault()} className=\"text-left space-y-5\">"
);

code = code.replace(
  "type=\"submit\"",
  "type=\"button\"\n            onClick={handleSubmit}"
);

fs.writeFileSync('src/components/Login.tsx', code);
