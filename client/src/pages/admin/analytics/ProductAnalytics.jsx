import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsProducts() {
  const [mostViewed, setMostViewed] = useState([]);
  const [mostAdded, setMostAdded] = useState([]);
  const [mostPurchased, setMostPurchased] = useState([]);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/dashboard/products?period=${period}`, { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) { setMostViewed(d.mostViewed || []); setMostAdded(d.mostAddedToCart || []); setMostPurchased(d.mostPurchased || []); }
      }).finally(() => setLoading(false));
  }, [period]);

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  const renderTable = (data, label, valueKey, color) => (
    <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
      <h3 className="text-xs font-bold text-heading mb-4">{label}</h3>
      {data.length === 0 ? <div className="text-center py-8 text-muted text-sm">No data</div> : (
        <>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-2 pr-3 font-semibold">Product</th>
                  <th className="pb-2 pr-3 font-semibold">Category</th>
                  <th className="pb-2 pr-3 font-semibold text-right">{valueKey === 'views' ? 'Views' : valueKey === 'adds' ? 'Added' : 'Purchased'}</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((item, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-ivory/50">
                    <td className="py-2 pr-3 font-medium text-heading truncate max-w-[200px]">{item.product_name}</td>
                    <td className="py-2 pr-3 text-muted">{item.product_category || '—'}</td>
                    <td className="py-2 pr-3 text-right font-medium">{item[valueKey]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="product_name" tick={{ fontSize: 9 }} width={120} tickFormatter={(v) => v.length > 15 ? v.slice(0, 15) + '...' : v} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey={valueKey} fill={color} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-bold text-heading">Product Analytics</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-1.5 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white">
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {renderTable(mostViewed, 'Most Viewed Products', 'views', '#0b3a42')}
        {renderTable(mostAdded, 'Most Added to Cart', 'adds', '#c9a962')}
        {renderTable(mostPurchased, 'Most Purchased', 'purchases', '#22c55e')}
      </div>
    </div>
  );
}
