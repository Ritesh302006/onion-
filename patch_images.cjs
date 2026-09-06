const fs = require('fs');
let code = fs.readFileSync('src/pages/officer/NewAssessment.tsx', 'utf8');

const target = `                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">`;

const replacement = `                </div>
              </div>
            </div>

            {/* Additional Images section */}
            <div className="bg-white shadow-sm rounded-xl border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Additional Images (Optional)</h3>
                <button
                  onClick={() => addMoreInputRef.current?.click()}
                  className="text-xs font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Add Image
                </button>
              </div>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={addMoreInputRef} onChange={handleAddMoreImage} />
              {additionalImages.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {additionalImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                      <img src={img} alt={\`Additional \${idx + 1}\`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No additional images attached. Taking photos from different angles can assist in manual dispute resolution.</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/officer/NewAssessment.tsx', code);
  console.log("Replaced");
} else {
  console.log("Target not found!");
}
