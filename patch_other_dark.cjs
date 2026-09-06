const fs = require('fs');

function replaceAll(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/text-slate-900/g, 'text-slate-900 dark:text-slate-100');
  code = code.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-200');
  code = code.replace(/bg-white/g, 'bg-white dark:bg-slate-900');
  code = code.replace(/bg-\[\#F8FAFC\]/g, 'bg-[#F8FAFC] dark:bg-slate-950');
  code = code.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-800');
  code = code.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-800/50');
  code = code.replace(/hover:bg-slate-50/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  code = code.replace(/divide-slate-200/g, 'divide-slate-200 dark:divide-slate-800');
  fs.writeFileSync(file, code);
}

replaceAll('src/pages/farmer/FarmerDashboard.tsx');
replaceAll('src/pages/ReportView.tsx');
replaceAll('src/pages/Login.tsx');

console.log("Patched other files for dark mode");
