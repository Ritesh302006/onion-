const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const metaTags = `
    <title>AgriVision AI - Onion Storage</title>
    <meta name="description" content="Official AI assessment and quality grading passport for agricultural storage." />
    <meta name="theme-color" content="#059669" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="AgriVision" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
`;

code = code.replace(
  /<title>.*<\/title>\n.*<meta name="description".*\/>/g,
  metaTags
);

fs.writeFileSync('index.html', code);
console.log("Patched index.html for PWA");
