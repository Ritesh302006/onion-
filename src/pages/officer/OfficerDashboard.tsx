import { useAppStore } from '@/lib/store';
import { Link } from 'react-router-dom';
import { Plus, Search, CheckCircle2, Clock, AlertTriangle, Download, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

export default function OfficerDashboard() {
  const { lots, isOnline, syncLots } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingSyncCount = lots.filter(l => l.status === 'pending_sync').length;
  
  // Calculate Dashboard Metrics
  const totalInspectionsAllTime = lots.length;
  const today = new Date().toDateString();
  const todaysInspectionsCount = lots.filter(l => new Date(l.timestamp).toDateString() === today).length;
  
  // Calculate average quality score (Avg Grade A percentage)
  const avgQualityScore = lots.length > 0 
    ? lots.reduce((sum, lot) => sum + lot.result.gradeAPercentage, 0) / lots.length 
    : 0;
    
  // Calculate Total Onions Analyzed
  const totalOnionsAnalyzed = lots.reduce((sum, lot) => sum + lot.result.totalCount, 0);

  const filteredLots = lots.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return l.id.toLowerCase().includes(q) || l.farmerId.toLowerCase().includes(q);
  });

  
  const handleExportCSV = () => {
    if (lots.length === 0) return;
    const headers = ['Lot ID', 'Date', 'Farmer ID', 'Total Count', 'Grade A %', 'URS %', 'Rejected %', 'Final Grade'];
    const csvContent = [
      headers.join(','),
      ...lots.map(l => [
        l.id,
        new Date(l.timestamp).toLocaleDateString(),
        l.farmerId,
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
    link.setAttribute('download', 'assessments_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncLots();
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 dark:text-slate-100 tracking-tight">Lots History</h1>
          <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">Manage and review your quality assessments</p>
        </div>
        
        <div className="flex items-center gap-3">
          {pendingSyncCount > 0 && isOnline && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-xs font-bold uppercase tracking-wide rounded-md text-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
            >
              {isSyncing ? 'Syncing...' : `Sync ${pendingSyncCount} Pending`}
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-xs font-bold uppercase tracking-wide rounded-md text-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 text-slate-500" />
            Export CSV
          </button>
          <Link
            to="/officer/new-lot"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-xs font-bold uppercase tracking-wide rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Link>
        </div>
      </div>

      {/* Dashboard Metrics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inspections */}
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Inspections</p>
          <p className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{totalInspectionsAllTime}</p>
          <p className="text-xs font-medium text-slate-400 mt-2">All time</p>
        </div>

        {/* Today's Inspections */}
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Today's Inspections</p>
          <p className="text-3xl font-extrabold tracking-tight text-emerald-600">{todaysInspectionsCount}</p>
          <p className="text-xs font-medium text-slate-400 mt-2">{new Date().toLocaleDateString()}</p>
        </div>

        {/* Avg Quality Score */}
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Avg Quality Score</p>
          <p className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{avgQualityScore.toFixed(1)}%</p>
          <p className="text-xs font-medium text-slate-400 mt-2">Good quality avg</p>
        </div>

        {/* Total Onions Analyzed */}
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Onions Analyzed</p>
          <p className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{totalOnionsAnalyzed.toLocaleString()}</p>
          <p className="text-xs font-medium text-slate-400 mt-2">Across all lots</p>
        </div>
      </div>

      
      {lots.length > 0 && (
        <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Recent Assessments Quality Trend</h3>
          </div>
          <div className="h-64 w-full text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lots.slice(0, 10).reverse().map(l => ({
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

      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 shadow-sm rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg leading-5 bg-white dark:bg-slate-900 dark:bg-slate-800 placeholder-slate-400 font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm shadow-sm transition-shadow"
              placeholder="Search by Lot ID or Farmer ID"
            />
          </div>
        </div>

        {filteredLots.length === 0 ? (
          <div className="p-12 text-center">
            <FileIcon className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">No assessments</h3>
            <p className="mt-1 text-xs font-medium text-slate-500 uppercase tracking-widest">Get started by creating a new assessment lot.</p>
            <div className="mt-6">
              <Link
                to="/officer/new-lot"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-xs font-bold uppercase tracking-wide rounded-md text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                New Assessment
              </Link>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLots.map((lot) => (
              <li key={lot.id}>
                <Link to={`/report/${lot.id}`} className="block hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <p className="text-sm font-bold text-emerald-600 truncate">{lot.id}</p>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border shadow-sm",
                          lot.result.finalGrade === 'Grade A' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          lot.result.finalGrade === 'URS' ? "bg-amber-50 text-amber-700 border-amber-200" :
                          "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {lot.result.finalGrade}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        {lot.status === 'synced' ? (
                          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-amber-500">
                            <Clock className="w-3.5 h-3.5 mr-1" /> Pending Sync
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex sm:space-x-6">
                        <p className="flex items-center text-xs font-medium text-slate-500">
                          <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400 mr-2">Farmer</span> {lot.farmerId}
                        </p>
                        <p className="flex items-center text-xs font-medium text-slate-500 mt-2 sm:mt-0">
                          <span className="uppercase tracking-widest font-bold text-[10px] text-slate-400 mr-2">Sample</span> {lot.result.totalCount} onions
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:mt-0">
                        <p>
                          {new Date(lot.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {lot.disputeStatus === 'disputed' && (
                      <div className="mt-3 flex items-center text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded inline-block w-fit border border-red-100">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Disputed by Farmer
                      </div>
                    )}
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

function FileIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
