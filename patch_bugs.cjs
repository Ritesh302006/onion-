const fs = require('fs');

// Fix 1: index.css Tailwind v4 dark mode
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('@custom-variant dark')) {
  css = css.replace('@import "tailwindcss";', '@import "tailwindcss";\n@custom-variant dark (&:where(.dark, .dark *));');
  fs.writeFileSync('src/index.css', css);
  console.log("Patched index.css for dark mode");
}

// Fix 2: server.ts Gemini API history validation
let server = fs.readFileSync('server.ts', 'utf8');
const oldHistoryCode = `      // We will pass the system instructions and history
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));`;

const newHistoryCode = `      // We will pass the system instructions and history
      let validHistory = [...history];
      while (validHistory.length > 0 && validHistory[0].role !== 'user') {
        validHistory.shift();
      }
      
      const formattedHistory = validHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));`;

if (server.includes(oldHistoryCode)) {
  server = server.replace(oldHistoryCode, newHistoryCode);
  fs.writeFileSync('server.ts', server);
  console.log("Patched server.ts for chatbot history");
}

