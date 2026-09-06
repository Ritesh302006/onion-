const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportView.tsx', 'utf8');

code = code.replace(
  '<button className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-bold tracking-wide uppercase rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">',
  '<button onClick={() => window.print()} className="print:hidden flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-bold tracking-wide uppercase rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">'
);

// Hide other UI elements during print
code = code.replace(
  '<div className="bg-[#F8FAFC] p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">',
  '<div className="print:hidden bg-[#F8FAFC] p-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">'
);

code = code.replace(
  '<div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-end">',
  '<div className="print:hidden bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-end">'
);

fs.writeFileSync('src/pages/ReportView.tsx', code);
console.log("Patched ReportView for printing");
