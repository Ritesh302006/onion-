const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportView.tsx', 'utf8');

code = code.replace(`          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">`, `          ) : (
            <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">`);

code = code.replace(`          </div>
          )}
        </div>

        {/* Footer Actions */}`, `          </div>
          </>
          )}
        </div>

        {/* Footer Actions */}`);

fs.writeFileSync('src/pages/ReportView.tsx', code);
console.log("Patched fragment wrapper");
