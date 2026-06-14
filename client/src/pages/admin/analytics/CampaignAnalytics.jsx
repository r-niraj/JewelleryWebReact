import { useEffect, useState } from 'react';

export default function AnalyticsCampaigns() {
  const [byCampaign, setByCampaign] = useState([]);
  const [withOrders, setWithOrders] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dashboard/marketing?period=${period}`, { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) { setByCampaign(d.byCampaign || []); setWithOrders(d.withOrders || []); }
      }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-heading">Campaign Performance</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gold-soft/10 mb-5">
        <h3 className="text-xs font-bold text-heading mb-4">Campaign Details</h3>
        {byCampaign.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">No campaign data yet. Campaign data appears when visitors arrive with UTM parameters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-2 pr-3 font-semibold">Source</th>
                  <th className="pb-2 pr-3 font-semibold">Medium</th>
                  <th className="pb-2 pr-3 font-semibold">Campaign</th>
                  <th className="pb-2 pr-3 font-semibold text-right">Sessions</th>
                  <th className="pb-2 pr-3 font-semibold text-right">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {byCampaign.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-ivory/50">
                    <td className="py-2.5 pr-3 font-medium text-heading">{c.utm_source || '—'}</td>
                    <td className="py-2.5 pr-3 text-muted">{c.utm_medium || '—'}</td>
                    <td className="py-2.5 pr-3 text-muted">{c.utm_campaign || '—'}</td>
                    <td className="py-2.5 pr-3 text-right font-medium">{c.sessions}</td>
                    <td className="py-2.5 pr-3 text-right text-muted">{c.visitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
        <h3 className="text-xs font-bold text-heading mb-4">Revenue by Campaign</h3>
        {withOrders.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">No attributed revenue yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-2 pr-3 font-semibold">Source</th>
                  <th className="pb-2 pr-3 font-semibold">Campaign</th>
                  <th className="pb-2 pr-3 font-semibold text-right">Orders</th>
                  <th className="pb-2 pr-3 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {withOrders.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-ivory/50">
                    <td className="py-2.5 pr-3 font-medium text-heading">{c.utm_source || 'Direct'}</td>
                    <td className="py-2.5 pr-3 text-muted">{c.utm_campaign || '—'}</td>
                    <td className="py-2.5 pr-3 text-right font-medium">{c.orders}</td>
                    <td className="py-2.5 pr-3 text-right font-medium text-emerald-deep">₹{Number(c.revenue).toLocaleString()}</td>
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
