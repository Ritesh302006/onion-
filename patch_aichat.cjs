const fs = require('fs');
let code = fs.readFileSync('src/components/AIChat.tsx', 'utf8');

code = code.replace(
  "setMessages([...newMessages, { role: 'model', text: 'Sorry, I encountered an error. Please try again later.' }]);",
  "setMessages([...newMessages, { role: 'model', text: data.error || 'Sorry, I encountered an error. Please try again later.' }]);"
);

fs.writeFileSync('src/components/AIChat.tsx', code);
console.log("Patched AIChat error handling");
