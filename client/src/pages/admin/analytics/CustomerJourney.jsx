import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsJourney() {
  const [data, setData] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dashboard/journey?period=${period}`, { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) { setData(d.routes || []); setTotalViews(d.totalViews || 0); }
      }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-heading">Customer Journey</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gold-soft/10 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-ivory rounded-lg p-3">
            <div className="text-xs text-muted">Total Page Views</div>
            <div className="font-serif text-xl font-bold text-heading">{totalViews.toLocaleString()}</div>
          </div>
          <div className="bg-ivory rounded-lg p-3">
            <div className="text-xs text-muted">Unique Routes</div>
            <div className="font-serif text-xl font-bold text-heading">{data.length}</div>
          </div>
        </div>

        <h3 className="text-xs font-bold text-heading mb-4">Route Popularity</h3>
        {data.length === 0 ? <div className="text-center py-8 text-muted text-sm">No data</div> : (
          <>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    <th className="pb-2 pr-3 font-semibold">Route</th>
                    <th className="pb-2 pr-3 font-semibold text-right">Views</th>
                    <th className="pb-2 pr-3 font-semibold text-right">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-ivory/50">
                      <td className="py-2 pr-3 font-medium text-heading">
                        <span className="font-mono text-[0.6rem]">{r.route_name || '/'}</span>
                      </td>
                      <td className="py-2 pr-3 text-right font-medium">{r.count}</td>
                      <td className="py-2 pr-3 text-right text-muted">{totalViews > 0 ? ((r.count / totalViews) * 100).toFixed(1) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.slice(0, 10)} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="route_name" tick={{ fontSize: 9 }} width={120} tickFormatter={(v) => v?.length > 15 ? v.slice(0, 15) + '...' : v || '/'} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#0b3a42" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
