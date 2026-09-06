const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// 1. Imports
code = code.replace(
  "import { LogOut, WifiOff, Menu, X, Home, FileText, Settings, Database, Activity, ScanFace } from 'lucide-react';",
  "import { LogOut, WifiOff, Menu, X, Home, FileText, Settings, Database, Activity, ScanFace, Moon, Sun } from 'lucide-react';\nimport AIChat from './AIChat';"
);

// 2. Destructure darkMode and toggleDarkMode
code = code.replace(
  "const { currentUser, isOnline, setOnlineStatus, setCurrentUser } = useAppStore();",
  "const { currentUser, isOnline, setOnlineStatus, setCurrentUser, darkMode, toggleDarkMode } = useAppStore();"
);

// 3. Dark mode classes for layout wrapper
code = code.replace(
  '<div className="flex flex-col h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">',
  '<div className="flex flex-col h-screen w-full bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans overflow-hidden">'
);

// 4. Header classes
code = code.replace(
  '<header className="print:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-30">',
  '<header className="print:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-30">'
);

// 5. Add Dark Mode toggle next to LogOut
const toggleBtn = `
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-emerald-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
`;
code = code.replace(
  `<button
              onClick={() => {
                setCurrentUser(null);
                navigate('/');
              }}`,
  toggleBtn + `            <button
              onClick={() => {
                setCurrentUser(null);
                navigate('/');
              }}`
);

// 6. Sidebar classes
code = code.replace(
  '<nav className="print:hidden hidden sm:flex w-64 bg-white border-r border-slate-200 shrink-0 flex-col">',
  '<nav className="print:hidden hidden sm:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 flex-col">'
);

// 7. Nav link classes (we'll just append some dark mode variants to the cn string)
// We need to replace exactly this block:
code = code.replace(
  /isActive\n\s+\? "bg-emerald-50 text-emerald-700"\n\s+: "text-slate-600 hover:text-slate-900 hover:bg-slate-50"/g,
  `isActive
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"`
);

// 8. Main area classes
code = code.replace(
  '<main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 flex flex-col">',
  '<main className="flex-1 overflow-y-auto bg-[#F8FAFC] dark:bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col">'
);

// 9. Add AIChat before closing div
code = code.replace(
  '        </main>\n      </div>\n    </div>',
  '        </main>\n      </div>\n      <AIChat />\n    </div>'
);

// Text colors in header
code = code.replace(
  'className="text-xl font-serif font-bold text-slate-900 tracking-tight leading-none"',
  'className="text-xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-none"'
);
code = code.replace(
  'className="text-xs font-bold text-slate-700"',
  'className="text-xs font-bold text-slate-700 dark:text-slate-200"'
);

fs.writeFileSync('src/components/Layout.tsx', code);
console.log("Patched Layout for Dark Mode & AI Chat");
