const fs = require('fs');
let code = fs.readFileSync('src/pages/ReportView.tsx', 'utf8');

code = code.replace(
  'import { useParams, Link, useSearchParams } from "react-router-dom";',
  'import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";'
);

code = code.replace(
  'Award\n} from "lucide-react";',
  'Award,\n  ArrowLeft\n} from "lucide-react";'
);

code = code.replace(
  'export default function ReportView() {\n  const { id } = useParams<{ id: string }>();',
  'export default function ReportView() {\n  const { id } = useParams<{ id: string }>();\n  const navigate = useNavigate();'
);

const target = `<div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">`;
const replacement = `<div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <button onClick={() => navigate(-1)} className="print:hidden mb-6 inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>`;

code = code.replace(target, replacement);

fs.writeFileSync('src/pages/ReportView.tsx', code);
console.log("Patched back button");
