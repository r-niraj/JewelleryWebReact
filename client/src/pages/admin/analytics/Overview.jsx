import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsOverview() {
  const [stats, setStats] = useState(null);
  const [daily, setDaily] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/dashboard/traffic?period=30d', { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) { setStats(d.stats); setDaily(d.daily || []); }
      }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  const cards = stats ? [
    { label: 'Total Visitors', value: stats.totalVisitors?.toLocaleString(), icon: 'fa-users', color: '#0b3a42' },
    { label: 'Unique Visitors', value: stats.uniqueVisitors?.toLocaleString(), icon: 'fa-user-plus', color: '#c9a962' },
    { label: 'Returning', value: stats.returningVisitors?.toLocaleString(), icon: 'fa-sync', color: '#8b5cf6' },
    { label: 'Sessions', value: stats.sessions?.toLocaleString(), icon: 'fa-chart-line', color: '#22c55e' },
    { label: 'Bounce Rate', value: `${stats.bounceRate || 0}%`, icon: 'fa-sign-out-alt', color: '#ef4444' },
    { label: 'Avg Session', value: `${Math.floor((stats.avgSessionDuration || 0) / 60)}m ${(stats.avgSessionDuration || 0) % 60}s`, icon: 'fa-clock', color: '#f59e0b' },
  ] : [];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-7">
        {cards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10">
            <div className="float-right text-2xl opacity-15" style={{ color: card.color }}><i className={`fas ${card.icon}`} /></div>
            <div className="font-serif text-2xl font-bold text-heading">{card.value}</div>
            <div className="text-xs text-muted font-medium mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10">
        <h3 className="text-sm font-bold text-heading mb-4">Daily Traffic (30 days)</h3>
        {daily.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">No data yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={daily} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5) || ''} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="count" fill="#0b3a42" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
