const fs = require('fs');
let code = fs.readFileSync('src/lib/store.ts', 'utf8');

code = code.replace(
  'isOnline: boolean;',
  'isOnline: boolean;\n  darkMode: boolean;\n  toggleDarkMode: () => void;'
);

code = code.replace(
  'isOnline: navigator.onLine,',
  'isOnline: navigator.onLine,\n  darkMode: false,\n  toggleDarkMode: () => set((state) => {\n    const newMode = !state.darkMode;\n    if (newMode) {\n      document.documentElement.classList.add("dark");\n    } else {\n      document.documentElement.classList.remove("dark");\n    }\n    return { darkMode: newMode };\n  }),'
);

fs.writeFileSync('src/lib/store.ts', code);
console.log("Patched store.ts");
