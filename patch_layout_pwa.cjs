const fs = require('fs');
let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Add import
code = code.replace(
  "import AIChat from './AIChat';",
  "import AIChat from './AIChat';\nimport { PWAInstallButton } from './PWAInstallButton';"
);

// Inject PWA button in header
code = code.replace(
  '<div className="text-right hidden sm:block">',
  '<div className="mr-4 hidden sm:block"><PWAInstallButton /></div>\n            <div className="text-right hidden sm:block">'
);

fs.writeFileSync('src/components/Layout.tsx', code);
console.log("Patched Layout with PWA Install Button");
