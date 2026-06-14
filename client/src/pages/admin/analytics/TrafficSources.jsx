import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0b3a42', '#c9a962', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function AnalyticsTrafficSources() {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dashboard/marketing?period=${period}`, { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) setData(d.bySource || []);
      }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-heading">Traffic Sources</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <h3 className="text-xs font-bold text-heading mb-4">Sessions by Source</h3>
          {data.length === 0 ? <div className="text-center py-12 text-muted text-sm">No data yet</div> : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" outerRadius={100} dataKey="sessions" nameKey="source" label={({ source, sessions }) => `${source}: ${sessions}`}>
                  {data.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <h3 className="text-xs font-bold text-heading mb-4">Source Breakdown</h3>
          {data.length === 0 ? <div className="text-center py-12 text-muted text-sm">No data</div> : (
            <div className="space-y-2">
              {data.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="font-medium text-heading">{item.source}</span>
                  </div>
                  <div className="flex gap-4 text-muted">
                    <span>{item.sessions} sessions</span>
                    <span>{item.visitors} visitors</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
