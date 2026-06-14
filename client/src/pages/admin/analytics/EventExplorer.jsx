import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function EventExplorer() {
  const [events, setEvents] = useState([]);
  const [byName, setByName] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dashboard/events?period=${period}`, { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) { setEvents(d.recent || []); setByName(d.byName || []); }
      }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-heading">Event Explorer</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <h3 className="text-xs font-bold text-heading mb-4">Events by Type</h3>
          {byName.length === 0 ? <div className="text-center py-8 text-muted text-sm">No data</div> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={byName} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="event_name" tick={{ fontSize: 10 }} width={120} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#0b3a42" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <h3 className="text-xs font-bold text-heading mb-4">Event Summary</h3>
          {byName.length === 0 ? <div className="text-center py-8 text-muted text-sm">No data</div> : (
            <div className="space-y-1.5">
              {byName.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                  <span className="text-heading font-medium">{e.event_name}</span>
                  <span className="text-muted">{e.count} ×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
        <h3 className="text-xs font-bold text-heading mb-4">Recent Events</h3>
        {events.length === 0 ? <div className="text-center py-8 text-muted text-sm">No events yet</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-2 pr-3 font-semibold">Event</th>
                  <th className="pb-2 pr-3 font-semibold">Visitor</th>
                  <th className="pb-2 pr-3 font-semibold">Data</th>
                  <th className="pb-2 pr-3 font-semibold text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-ivory/50">
                    <td className="py-2 pr-3 font-medium text-heading">{e.event_name}</td>
                    <td className="py-2 pr-3 text-muted font-mono text-[0.6rem]">{e.anonymous_id?.slice(0, 12) || '—'}</td>
                    <td className="py-2 pr-3 text-muted max-w-[200px] truncate">{e.event_data ? JSON.stringify(e.event_data) : '—'}</td>
                    <td className="py-2 pr-3 text-right text-muted whitespace-nowrap">{e.created_at ? new Date(e.created_at).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
