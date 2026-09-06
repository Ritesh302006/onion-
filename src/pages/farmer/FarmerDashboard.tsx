import { useAppStore } from '@/lib/store';
import { Link } from 'react-router-dom';
import { FileText, AlertTriangle, ShieldCheck, Download, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';

export default function FarmerDashboard() {
  const { lots, currentUser } = useAppStore();
  
  // Filter lots by the current farmer
  const myLots = lots.filter(l => l.farmerId === currentUser?.id);

  const handleExportCSV = () => {
    if (myLots.length === 0) return;
    const headers = ['Lot ID', 'Date', 'Total Count', 'Grade A %', 'URS %', 'Rejected %', 'Final Grade'];
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
    ].join('\n');
    
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


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Quality Reports</h1>
          <p className="text-sm text-slate-500 mt-1">View your official onion assessments and Digital Quality Passports.</p>
        </div>
        {myLots.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-xs font-bold uppercase tracking-wide rounded-md text-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export CSV
          </button>
        )}
      </div>
      
      {myLots.length > 0 && (
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Your Harvest Quality Trend</h3>
          </div>
          <div className="h-64 w-full text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={myLots.slice(0, 10).reverse().map(l => ({
                name: new Date(l.timestamp).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
                'Grade A': l.result.gradeAPercentage,
                'URS': l.result.ursPercentage,
                'Rejected': l.result.rejectedPercentage
              }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'}}
                  cursor={{fill: '#F1F5F9'}}
                />
                <Bar dataKey="Grade A" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
                <Bar dataKey="URS" stackId="a" fill="#F59E0B" />
                <Bar dataKey="Rejected" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}


      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        {myLots.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No reports found</h3>
            <p className="mt-1 text-sm text-slate-500">You don't have any quality assessments yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {myLots.map((lot) => (
              <li key={lot.id}>
                <Link to={`/report/${lot.id}`} className="block hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:bg-slate-800/50 p-4 sm:p-6 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{lot.id}</span>
                           <span className={cn(
                             "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                             lot.result.finalGrade === 'Grade A' ? "bg-emerald-100 text-emerald-800" :
                             lot.result.finalGrade === 'URS' ? "bg-yellow-100 text-yellow-800" :
                             "bg-red-100 text-red-800"
                           )}>
                             {lot.result.finalGrade}
                           </span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4" />
                          Center: {lot.centerId} &bull; {new Date(lot.timestamp).toLocaleDateString()}
                        </p>
                     </div>
                     
                     <div className="flex flex-col items-start sm:items-end gap-2">
                        <div className="text-sm">
                           <span className="font-medium text-slate-900 dark:text-slate-100">{lot.result.gradeAPercentage.toFixed(1)}%</span>
                           <span className="text-slate-500 ml-1">Acceptable</span>
                        </div>
                        {lot.disputeStatus === 'disputed' && (
                           <span className="inline-flex items-center text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                             <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Dispute Under Review
                           </span>
                        )}
                        {lot.disputeStatus === 'resolved' && (
                           <span className="inline-flex items-center text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                             <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Dispute Resolved
                           </span>
                        )}
                     </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
