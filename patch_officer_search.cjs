const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/OfficerDashboard.tsx', 'utf8');

// Add search state
code = code.replace(
  'const [isSyncing, setIsSyncing] = useState(false);',
  'const [isSyncing, setIsSyncing] = useState(false);\n  const [searchQuery, setSearchQuery] = useState("");'
);

// Filter lots
code = code.replace(
  'const pendingSyncCount = lots.filter(l => l.status === \'pending_sync\').length;',
  'const pendingSyncCount = lots.filter(l => l.status === \'pending_sync\').length;\n\n  const filteredLots = lots.filter(l => {\n    if (!searchQuery) return true;\n    const q = searchQuery.toLowerCase();\n    return l.id.toLowerCase().includes(q) || l.farmerId.toLowerCase().includes(q);\n  });'
);

// Update input to use state
code = code.replace(
  '<input\n              type="text"\n              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-400 font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm transition-shadow"\n              placeholder="Search by Lot ID or Farmer ID"\n            />',
  `<input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-800 placeholder-slate-400 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm transition-shadow"
              placeholder="Search by Lot ID or Farmer ID"
            />`
);

// Map over filteredLots instead of lots
code = code.replace(
  /\{lots\.length === 0 \? \(/g,
  '{filteredLots.length === 0 ? ('
);

code = code.replace(
  /\{lots\.map\(\(lot\) => \(/g,
  '{filteredLots.map((lot) => ('
);

// Update dark mode classes for Dashboard boxes
code = code.replace(
  /className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden"/g,
  'className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"'
);
code = code.replace(
  /className="bg-white shadow-sm rounded-xl border border-slate-200 p-6"/g,
  'className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-6"'
);
code = code.replace(
  /className="text-2xl font-bold text-slate-800 tracking-tight"/g,
  'className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight"'
);
code = code.replace(
  /className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50"/g,
  'className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50"'
);
code = code.replace(
  /hover:bg-slate-50/g,
  'hover:bg-slate-50 dark:hover:bg-slate-800/50'
);
code = code.replace(
  /divide-slate-100/g,
  'divide-slate-100 dark:divide-slate-800'
);
code = code.replace(
  /text-slate-800/g,
  'text-slate-800 dark:text-slate-200'
);
code = code.replace(
  /bg-white/g,
  'bg-white dark:bg-slate-900'
);

fs.writeFileSync('src/pages/officer/OfficerDashboard.tsx', code);
console.log("Patched officer search & dark mode");
