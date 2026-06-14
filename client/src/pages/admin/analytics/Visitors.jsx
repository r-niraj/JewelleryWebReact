import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

export default function AnalyticsVisitors() {
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dashboard/traffic?period=${period}`, { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) { setStats(d.stats); setDaily(d.daily || []); }
      }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  const pieData = stats ? [
    { name: 'New', value: Math.max(0, (stats.uniqueVisitors || 0) - (stats.returningVisitors || 0)) },
    { name: 'Returning', value: stats.returningVisitors || 0 },
  ] : [];
  const COLORS = ['#0b3a42', '#c9a962'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-heading">Visitor Breakdown</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gold-soft/10">
          <div className="text-xs text-muted">Total Visitors</div>
          <div className="font-serif text-2xl font-bold text-heading">{stats?.totalVisitors?.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gold-soft/10">
          <div className="text-xs text-muted">Unique</div>
          <div className="font-serif text-2xl font-bold text-heading">{stats?.uniqueVisitors?.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gold-soft/10">
          <div className="text-xs text-muted">Sessions</div>
          <div className="font-serif text-2xl font-bold text-heading">{stats?.sessions?.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gold-soft/10">
          <div className="text-xs text-muted">Bounce Rate</div>
          <div className="font-serif text-2xl font-bold text-heading">{stats?.bounceRate || 0}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <h3 className="text-xs font-bold text-heading mb-4">Daily Traffic</h3>
          {daily.length === 0 ? <div className="text-center py-8 text-muted text-sm">No data</div> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v?.slice(5) || ''} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#0b3a42" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <h3 className="text-xs font-bold text-heading mb-4">New vs Returning</h3>
          {pieData[0]?.value === 0 && pieData[1]?.value === 0 ? <div className="text-center py-8 text-muted text-sm">No data</div> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
