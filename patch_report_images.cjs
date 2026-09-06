const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportView.tsx', 'utf8');

const target = `            </div>
          </div>
          )}`;

const replacement = `            </div>
          </div>

          {/* Photographic Evidence Section */}
          <div className="mt-8 border-t border-slate-200 pt-8">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Photographic Evidence</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {lot.imageUri && (
                  <div className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-sm">
                    <img src={lot.imageUri} alt="Primary sample" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-900/60 backdrop-blur-sm p-1.5 text-center">
                       <span className="text-[8px] font-bold text-white uppercase tracking-wider">Primary</span>
                    </div>
                  </div>
               )}
               {lot.additionalImages?.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-sm">
                    <img src={img} alt={\`Additional \${idx+1}\`} className="w-full h-full object-cover" />
                  </div>
               ))}
            </div>
          </div>
          )}`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/ReportView.tsx', code);
  console.log("Replaced images in report");
} else {
  console.log("Target not found!");
}
