import { useAppStore } from '@/lib/store';
import { Network, Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ModelsManagement() {
  const { models } = useAppStore();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Model Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Computer Vision models and datasets</p>
        </div>
        <button className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
           Register New Model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Models List */}
         <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Deployed Models</h2>
            {models.map(model => (
               <div key={model.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                     <div className="flex items-center gap-2">
                        <Network className="w-5 h-5 text-slate-600" />
                        <span className="font-semibold text-slate-900">{model.version}</span>
                     </div>
                     {model.active && <span className="text-xs font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">Active Production</span>}
                  </div>
                  <div className="p-4 space-y-4">
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <p className="text-slate-500 mb-1">Dataset</p>
                           <p className="font-medium text-slate-900 flex items-center gap-1">
                              <Database className="w-3.5 h-3.5" /> {model.datasetVersion}
                           </p>
                        </div>
                        <div>
                           <p className="text-slate-500 mb-1">Validation mAP</p>
                           <p className="font-medium text-slate-900">{model.mAP}%</p>
                        </div>
                        <div>
                           <p className="text-slate-500 mb-1">Deployment Date</p>
                           <p className="font-medium text-slate-900">{new Date(model.deploymentDate).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 mb-2">Supported Classes</p>
                        <div className="flex flex-wrap gap-2">
                           {model.classes.map(c => (
                              <span key={c} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200 capitalize">
                                 {c}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Dataset Management Info */}
         <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Dataset Infrastructure</h2>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
               <div className="flex items-start gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                     <Database className="w-6 h-6" />
                  </div>
                  <div>
                     <h3 className="font-medium text-slate-900">Training Data Pipeline</h3>
                     <p className="text-sm text-slate-500 mt-1">
                        The current model is trained on a curated dataset of annotated onion images. Future improvements involve uploading new diverse samples from different procurement centers.
                     </p>
                  </div>
               </div>

               <div className="border-t border-slate-200 pt-6">
                  <h4 className="text-sm font-medium text-slate-900 mb-4">Pipeline Status</h4>
                  <ul className="space-y-3">
                     <li className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-700">Object Detection annotations verified</span>
                     </li>
                     <li className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-slate-700">Train/Val/Test splits configured (70/20/10)</span>
                     </li>
                     <li className="flex items-center gap-3 text-sm">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-slate-700">Pending new "discolored" samples from Maharashtra region</span>
                     </li>
                  </ul>
               </div>

               <div className="pt-4">
                  <button className="w-full justify-center inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                     Manage Datasets
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
