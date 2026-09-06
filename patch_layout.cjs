const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Hide header and nav in print mode
code = code.replace(
  '<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-30">',
  '<header className="print:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-30">'
);
code = code.replace(
  '<nav className="hidden sm:flex w-64 bg-white border-r border-slate-200 shrink-0 flex-col">',
  '<nav className="print:hidden hidden sm:flex w-64 bg-white border-r border-slate-200 shrink-0 flex-col">'
);

// Enhance title in Layout
code = code.replace(
  '<h1 className="text-lg font-bold text-slate-800 tracking-tight leading-none">AgriVision AI</h1>',
  '<h1 className="text-xl font-serif font-bold text-slate-900 tracking-tight leading-none">AgriVision AI</h1>'
);

fs.writeFileSync('src/components/Layout.tsx', code);
console.log("Patched Layout.tsx");
