import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const FUNNEL_COLORS = ['#0b3a42', '#c9a962', '#8b5cf6', '#22c55e', '#f59e0b'];

export default function ConversionFunnel() {
  const [funnel, setFunnel] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dashboard/funnel?period=${period}`, { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) setFunnel(d.funnel || []);
      }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  const total = funnel[0]?.value || 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-heading">Conversion Funnel</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
        {funnel.length === 0 ? <div className="text-center py-12 text-muted text-sm">No funnel data yet. Data appears as visitors move through browse → cart → checkout → purchase.</div> : (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={funnel} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value) => [value.toLocaleString(), 'Users']} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                  {funnel.map((_, idx) => (
                    <rect key={idx} fill={FUNNEL_COLORS[idx % FUNNEL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-2">
              {funnel.map((step, idx) => {
                const prevValue = idx > 0 ? funnel[idx - 1].value : total;
                const drop = idx > 0 ? ((1 - step.value / prevValue) * 100).toFixed(1) : null;
                const overallConversion = ((step.value / total) * 100).toFixed(1);
                return (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-medium text-heading">{step.name}</span>
                        <span className="text-muted">{step.value.toLocaleString()} users</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-deep rounded-full transition-all" style={{ width: `${overallConversion}%` }} />
                      </div>
                      <div className="flex justify-between text-[0.6rem] text-muted mt-0.5">
                        <span>{overallConversion}% overall</span>
                        {drop !== null && <span className="text-red-400">-{drop}% drop-off</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
