import { useAppStore } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, Users, Scale, FileWarning, TrendingUp } from 'lucide-react';
import { ONION_CATEGORIES } from '@/lib/types';

export default function AdminDashboard() {
  const { lots, disputes } = useAppStore();

  const totalLots = lots.length;
  const totalOnions = lots.reduce((acc, lot) => acc + lot.result.totalCount, 0);
  const disputedLots = disputes.length;

  let totalGradeA = 0;
  let totalURS = 0;
  let totalRejected = 0;

  lots.forEach(lot => {
    if (lot.result.finalGrade === 'Grade A') totalGradeA++;
    else if (lot.result.finalGrade === 'URS') totalURS++;
    else totalRejected++;
  });

  const gradeData = [
    { name: 'Grade A', value: totalGradeA, color: '#22c55e' },
    { name: 'URS', value: totalURS, color: '#eab308' },
    { name: 'Rejected', value: totalRejected, color: '#ef4444' }
  ];

  // Aggregate defects
  const defectAggregates: Record<string, number> = {};
  lots.forEach(lot => {
    Object.entries(lot.result.defectPercentages).forEach(([key, value]) => {
      defectAggregates[key] = (defectAggregates[key] || 0) + (value * lot.result.totalCount / 100);
    });
  });

  const defectData = Object.entries(defectAggregates)
    .filter(([_, val]) => val > 0)
    .map(([key, value]) => ({
      name: ONION_CATEGORIES[key].label,
      value: Math.round(value),
      color: ONION_CATEGORIES[key].color
    }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Government Analytics Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overall procurement quality statistics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Lots Assessed" value={totalLots} icon={Scale} trend="+12% from last week" />
        <StatCard title="Total Onions Analyzed" value={totalOnions.toLocaleString()} icon={TrendingUp} />
        <StatCard title="Grade A Procurement" value={`${totalLots ? Math.round((totalGradeA / totalLots) * 100) : 0}%`} icon={ArrowUpRight} highlight="text-emerald-600" />
        <StatCard title="Active Disputes" value={disputedLots} icon={FileWarning} highlight={disputedLots > 0 ? "text-amber-600" : ""} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Quality Grade Distribution</h3>
          <div className="h-[300px]">
            {totalLots > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            )}
          </div>
        </div>

        {/* Defect Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Aggregate Defect Distribution</h3>
          <div className="h-[300px]">
            {defectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {defectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, highlight }: { title: string, value: number | string, icon: any, trend?: string, highlight?: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className={`text-3xl font-bold tracking-tight ${highlight || 'text-slate-900'}`}>{value}</p>
      </div>
      {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
    </div>
  );
}
