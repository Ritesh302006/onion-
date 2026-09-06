import { useAppStore } from '@/lib/store';
import { Link } from 'react-router-dom';
import { AlertTriangle, Check, FileText } from 'lucide-react';
import { useState } from 'react';

export default function ReviewerDashboard() {
  const { disputes, lots, resolveDispute, currentUser } = useAppStore();
  const [activeDispute, setActiveDispute] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const openDisputes = disputes.filter(d => d.status === 'open');
  const reviewedDisputes = disputes.filter(d => d.status === 'reviewed');

  const handleResolve = (id: string) => {
    if (!resolutionNotes || !currentUser) return;
    resolveDispute(id, currentUser.id, resolutionNotes);
    setActiveDispute(null);
    setResolutionNotes('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dispute Resolution Center</h1>
        <p className="text-sm text-slate-500 mt-1">Review and resolve farmer assessment disputes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-amber-500" /> Open Disputes ({openDisputes.length})
            </h2>
            
            {openDisputes.length === 0 ? (
               <div className="bg-white p-8 text-center rounded-xl border border-slate-200">
                  <p className="text-slate-500 text-sm">No open disputes requiring review.</p>
               </div>
            ) : (
               openDisputes.map(dispute => {
                  const lot = lots.find(l => l.id === dispute.lotId);
                  return (
                     <div key={dispute.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                           <span className="font-semibold text-slate-900">Lot: {dispute.lotId}</span>
                           <span className="text-xs text-slate-500">{new Date(dispute.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="p-4 space-y-4">
                           <div>
                              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Farmer Reason</p>
                              <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded border border-slate-100">{dispute.reason}</p>
                           </div>
                           
                           <div className="flex gap-3">
                              <Link to={`/report/${dispute.lotId}`} className="text-sm text-emerald-600 hover:underline font-medium">
                                 View Original Assessment
                              </Link>
                           </div>

                           {activeDispute === dispute.id ? (
                              <div className="pt-4 border-t border-slate-200 space-y-3">
                                 <textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    placeholder="Enter review notes and final decision..."
                                    className="w-full border-slate-300 rounded-md shadow-sm p-3 focus:ring-emerald-500 focus:border-emerald-500 text-sm border"
                                    rows={3}
                                 />
                                 <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => setActiveDispute(null)}
                                      className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={() => handleResolve(dispute.id)}
                                      disabled={!resolutionNotes}
                                      className="px-3 py-1.5 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded disabled:opacity-50"
                                    >
                                      Mark Resolved
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <button 
                                onClick={() => setActiveDispute(dispute.id)}
                                className="w-full py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800"
                              >
                                 Start Review
                              </button>
                           )}
                        </div>
                     </div>
                  );
               })
            )}
         </div>

         <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
               <Check className="w-5 h-5 text-emerald-500" /> Recently Resolved ({reviewedDisputes.length})
            </h2>
            {reviewedDisputes.slice(0, 5).map(dispute => (
               <div key={dispute.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 opacity-75">
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-medium text-sm text-slate-900">Lot: {dispute.lotId}</span>
                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Reviewed</span>
                  </div>
                  <p className="text-xs text-slate-500">Reason: {dispute.reason}</p>
                  <div className="mt-3 pt-3 border-t border-slate-100">
                     <p className="text-xs font-medium text-slate-900">Review Notes:</p>
                     <p className="text-xs text-slate-700 mt-1">{dispute.reviewerNotes}</p>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
