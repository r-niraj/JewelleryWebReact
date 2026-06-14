import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#0b3a42', '#c9a962', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsGeography() {
  const [byCountry, setByCountry] = useState([]);
  const [byCity, setByCity] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dashboard/geography?period=${period}`, { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) { setByCountry(d.byCountry || []); setByCity(d.byCity || []); }
      }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-heading">Visitor Geography</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <h3 className="text-xs font-bold text-heading mb-4">By Country</h3>
          {byCountry.length === 0 ? <div className="text-center py-12 text-muted text-sm">No data yet</div> : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={byCountry} cx="50%" cy="50%" outerRadius={90} dataKey="visitors" nameKey="country" label={({ country, visitors }) => `${country}: ${visitors}`}>
                    {byCountry.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {byCountry.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-heading font-medium">{item.country}</span>
                    <span className="text-muted">{item.visitors} visitors</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <h3 className="text-xs font-bold text-heading mb-4">Top Cities</h3>
          {byCity.length === 0 ? <div className="text-center py-12 text-muted text-sm">No city data yet</div> : (
            <div className="space-y-1.5">
              {byCity.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-4 text-right">{idx + 1}.</span>
                    <span className="text-heading font-medium">{item.city || 'Unknown'}</span>
                    <span className="text-gray-400">{item.country || ''}</span>
                  </div>
                  <span className="text-muted">{item.visitors}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
