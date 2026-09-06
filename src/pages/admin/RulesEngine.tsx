import { useAppStore } from '@/lib/store';
import { useState } from 'react';
import { Settings, Save, AlertCircle, History } from 'lucide-react';

export default function RulesEngine() {
  const { rules, updateRules } = useAppStore();
  const activeRule = rules.find(r => r.active);
  
  const [formData, setFormData] = useState({
    gradeAMinHealthy: activeRule?.gradeAMinHealthy || 70,
    gradeAMaxUndersized: activeRule?.gradeAMaxUndersized || 15,
    ursMaxDefect: activeRule?.ursMaxDefect || 25,
  });
  
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateRules(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grading Rules Engine</h1>
          <p className="text-sm text-slate-500 mt-1">Configure official quality thresholds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-500" />
                <h2 className="text-lg font-medium text-slate-900">Current Configuration (v{activeRule?.version})</h2>
             </div>
             
             <div className="p-6 space-y-8">
                <div>
                   <label className="block text-sm font-medium text-slate-900 mb-2">Grade A: Minimum Healthy Percentage</label>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="50" max="100" 
                        value={formData.gradeAMinHealthy}
                        onChange={(e) => setFormData({...formData, gradeAMinHealthy: parseInt(e.target.value)})}
                        className="flex-1 accent-emerald-600"
                      />
                      <span className="w-16 text-right font-mono font-medium text-slate-700 bg-slate-100 py-1 px-2 rounded">{formData.gradeAMinHealthy}%</span>
                   </div>
                   <p className="text-xs text-slate-500 mt-2">Minimum percentage of healthy onions required for the lot to qualify as Grade A.</p>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-900 mb-2">Grade A: Maximum Undersized Tolerance</label>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" max="50" 
                        value={formData.gradeAMaxUndersized}
                        onChange={(e) => setFormData({...formData, gradeAMaxUndersized: parseInt(e.target.value)})}
                        className="flex-1 accent-cyan-600"
                      />
                      <span className="w-16 text-right font-mono font-medium text-slate-700 bg-slate-100 py-1 px-2 rounded">{formData.gradeAMaxUndersized}%</span>
                   </div>
                   <p className="text-xs text-slate-500 mt-2">Maximum allowable percentage of undersized onions for Grade A.</p>
                </div>

                <div className="pt-6 border-t border-slate-200">
                   <label className="block text-sm font-medium text-slate-900 mb-2">URS: Maximum Defect Tolerance (Rejection Threshold)</label>
                   <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="5" max="50" 
                        value={formData.ursMaxDefect}
                        onChange={(e) => setFormData({...formData, ursMaxDefect: parseInt(e.target.value)})}
                        className="flex-1 accent-red-600"
                      />
                      <span className="w-16 text-right font-mono font-medium text-slate-700 bg-slate-100 py-1 px-2 rounded">{formData.ursMaxDefect}%</span>
                   </div>
                   <p className="text-xs text-slate-500 mt-2">If total defects (rotten, damaged, sprouted) exceed this percentage, the lot is Rejected instead of URS.</p>
                </div>
             </div>
             
             <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
               {isSaved && (
                 <span className="inline-flex items-center text-sm text-emerald-600 font-medium mr-4">
                   Rules updated successfully
                 </span>
               )}
               <button 
                 onClick={handleSave}
                 className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
               >
                 <Save className="w-4 h-4 mr-2" /> Publish New Version
               </button>
             </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
             <div>
                <h4 className="text-sm font-medium text-blue-900">Important Note on Compliance</h4>
                <p className="text-sm text-blue-800 mt-1">Changes to grading rules will only apply to new assessments. Historical assessments (Digital Passports) retain the rule version active at their time of capture for audit compliance.</p>
             </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
           <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" />
              <h2 className="text-sm font-medium text-slate-900">Version History</h2>
           </div>
           <ul className="divide-y divide-slate-200">
             {rules.map((rule) => (
               <li key={rule.id} className="p-4">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-sm font-bold text-slate-900">Version {rule.version}</span>
                   {rule.active && <span className="text-[10px] font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">Active</span>}
                 </div>
                 <div className="text-xs text-slate-500 mb-2">{new Date(rule.updatedAt).toLocaleString()}</div>
                 <div className="text-xs text-slate-700 space-y-1">
                    <div>Grade A Min Healthy: {rule.gradeAMinHealthy}%</div>
                    <div>Grade A Max Under: {rule.gradeAMaxUndersized}%</div>
                    <div>Reject Threshold: {rule.ursMaxDefect}%</div>
                 </div>
               </li>
             ))}
           </ul>
        </div>
      </div>
    </div>
  );
}
