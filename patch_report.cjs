const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportView.tsx', 'utf8');

const target = `<div className="flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase">
                      CV Model
                    </dt>
                    <dd className="text-xs font-mono font-bold text-slate-800">
                      {lot.modelVersion}
                    </dd>
                  </div>`;

const replacement = `<div className="flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase">
                      CV Model
                    </dt>
                    <dd className="text-xs font-mono font-bold text-slate-800">
                      {lot.modelVersion}
                    </dd>
                  </div>
                  {/* Just inject the dataset hash since the user requested it specifically */}
                  <div className="flex justify-between">
                    <dt className="text-xs font-bold text-slate-500 uppercase">
                      Dataset
                    </dt>
                    <dd className="text-[10px] font-mono font-bold text-slate-800 truncate max-w-[150px]" title="e09611742de689e0a95ca07be2d2ee25bba446f268a2d185d2c5baa45bdc76b3">
                      e09611742de689e...
                    </dd>
                  </div>`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/ReportView.tsx', code);
  console.log("Patched ReportView");
} else {
  console.log("Target not found!");
}
