const fs = require('fs');
let code = fs.readFileSync('src/pages/farmer/FarmerDashboard.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { FileText, AlertTriangle, ShieldCheck } from 'lucide-react';",
  "import { FileText, AlertTriangle, ShieldCheck, Download, BarChart2 } from 'lucide-react';\nimport { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';"
);

// 2. Add Export function
const exportFunc = `
  const handleExportCSV = () => {
    if (myLots.length === 0) return;
    const headers = ['Lot ID', 'Date', 'Total Count', 'Grade A %', 'Grade B %', 'Grade C %', 'Rotten %', 'Final Grade'];
    const csvContent = [
      headers.join(','),
      ...myLots.map(l => [
        l.id,
        new Date(l.timestamp).toLocaleDateString(),
        l.result.totalCount,
        l.result.categoryPercentages['Grade A'],
        l.result.categoryPercentages['Grade B'],
        l.result.categoryPercentages['Grade C'],
        l.result.categoryPercentages['Rotten'],
        l.result.finalGrade
      ].join(','))
    ].join('\\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'my_reports.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;
code = code.replace(
  "const myLots = lots.filter(l => l.farmerId === currentUser?.id);",
  "const myLots = lots.filter(l => l.farmerId === currentUser?.id);\n" + exportFunc
);

// 3. Add Export Button & Chart
const headerReplacement = `
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Quality Reports</h1>
          <p className="text-sm text-slate-500 mt-1">View your official onion assessments and Digital Quality Passports.</p>
        </div>
        {myLots.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-xs font-bold uppercase tracking-wide rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export CSV
          </button>
        )}
      </div>
      
      {myLots.length > 0 && (
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight">Your Harvest Quality Trend</h3>
          </div>
          <div className="h-64 w-full text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={myLots.slice(0, 10).reverse().map(l => ({
                name: new Date(l.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
                'Grade A': l.result.categoryPercentages['Grade A'],
                'Grade B': l.result.categoryPercentages['Grade B'],
                'Rotten': l.result.categoryPercentages['Rotten']
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}}
                  cursor={{fill: '#F1F5F9'}}
                />
                <Bar dataKey="Grade A" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="Grade B" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Rotten" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
`;

code = code.replace(
  `<div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Quality Reports</h1>
        <p className="text-sm text-slate-500 mt-1">View your official onion assessments and Digital Quality Passports.</p>
      </div>`,
  headerReplacement
);

fs.writeFileSync('src/pages/farmer/FarmerDashboard.tsx', code);
console.log("Patched FarmerDashboard");
