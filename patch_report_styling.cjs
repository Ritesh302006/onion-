const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportView.tsx', 'utf8');

// Improve certificate title
code = code.replace(
  '<h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase mb-2">Certificate of Quality</h2>',
  '<h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">Certificate of Quality</h2>'
);

// Improve standard report title
code = code.replace(
  '<h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Assessment Report</h2>',
  '<h2 className="text-3xl font-serif font-bold text-slate-900">AI Assessment Report</h2>'
);

// More premium spacing/padding for the main container
code = code.replace(
  '<div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 font-sans">',
  '<div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">'
);

fs.writeFileSync('src/pages/ReportView.tsx', code);
console.log("Patched ReportView styling");
