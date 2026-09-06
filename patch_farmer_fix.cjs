const fs = require('fs');
let code = fs.readFileSync('src/pages/farmer/FarmerDashboard.tsx', 'utf8');

// Fix handleExportCSV
const oldExport = `    const headers = ['Lot ID', 'Date', 'Total Count', 'Grade A %', 'Grade B %', 'Grade C %', 'Rotten %', 'Final Grade'];
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
    ].join('\\n');`;

const newExport = `    const headers = ['Lot ID', 'Date', 'Total Count', 'Grade A %', 'URS %', 'Rejected %', 'Final Grade'];
    const csvContent = [
      headers.join(','),
      ...myLots.map(l => [
        l.id,
        new Date(l.timestamp).toLocaleDateString(),
        l.result.totalCount,
        l.result.gradeAPercentage,
        l.result.ursPercentage,
        l.result.rejectedPercentage,
        l.result.finalGrade
      ].join(','))
    ].join('\\n');`;

code = code.replace(oldExport, newExport);

// Fix BarChart data
const oldChart = `              <BarChart data={myLots.slice(0, 10).reverse().map(l => ({
                name: new Date(l.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
                'Grade A': l.result.categoryPercentages['Grade A'],
                'Grade B': l.result.categoryPercentages['Grade B'],
                'Rotten': l.result.categoryPercentages['Rotten']
              }))}>`;

const newChart = `              <BarChart data={myLots.slice(0, 10).reverse().map(l => ({
                name: new Date(l.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
                'Grade A': l.result.gradeAPercentage,
                'URS': l.result.ursPercentage,
                'Rejected': l.result.rejectedPercentage
              }))}>`;

code = code.replace(oldChart, newChart);

// Also fix the bars
code = code.replace('<Bar dataKey="Grade B" stackId="a" fill="#F59E0B" />', '<Bar dataKey="URS" stackId="a" fill="#F59E0B" />');
code = code.replace('<Bar dataKey="Rotten" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />', '<Bar dataKey="Rejected" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />');

fs.writeFileSync('src/pages/farmer/FarmerDashboard.tsx', code);
console.log("Patched farmer dashboard");
