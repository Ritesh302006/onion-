const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');

code = code.replace(
  '<h2 className="mt-6 text-center text-3xl font-bold text-slate-800 tracking-tight">',
  '<h2 className="mt-6 text-center text-4xl font-serif font-bold text-slate-900">'
);

fs.writeFileSync('src/pages/Login.tsx', code);
console.log("Patched Login styling");
