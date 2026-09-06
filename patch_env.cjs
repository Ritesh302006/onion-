const fs = require('fs');
let code = fs.readFileSync('.env.example', 'utf8');

if (!code.includes('GEMINI_API_KEY')) {
  code += '\\nGEMINI_API_KEY=\\n';
  fs.writeFileSync('.env.example', code);
}
console.log("Updated .env.example");
