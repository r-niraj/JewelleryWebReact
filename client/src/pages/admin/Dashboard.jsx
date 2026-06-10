import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const STATUS_BADGES = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Packed: 'bg-indigo-100 text-indigo-800',
  Shipped: 'bg-purple-100 text-purple-800',
  'Out For Delivery': 'bg-orange-100 text-orange-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/dashboard/stats', { credentials: 'include' }),
        fetch('/api/orders/list?limit=10', { credentials: 'include' }),
      ]);
      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();
      if (statsData.success) setStats(statsData.stats);
      if (ordersData.success) setRecentOrders(ordersData.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cards = stats ? [
    { label: 'Total Orders', value: stats.totalOrders, icon: 'fa-shopping-bag', color: '' },
    { label: "Today's Orders", value: stats.todayOrders, icon: 'fa-calendar-day', color: '' },
    { label: 'Pending', value: stats.pendingOrders, icon: 'fa-clock', color: '#f59e0b' },
    { label: 'Confirmed', value: stats.confirmedOrders, icon: 'fa-check', color: '#3b82f6' },
    { label: 'Shipped', value: stats.shippedOrders, icon: 'fa-truck', color: '#8b5cf6' },
    { label: 'Delivered', value: stats.deliveredOrders, icon: 'fa-check-circle', color: '#22c55e' },
    { label: 'Revenue', value: `₹${Number(stats.revenue).toLocaleString()}`, icon: 'fa-rupee-sign', color: '#c9a962' },
    { label: 'Cancelled', value: stats.cancelledOrders, icon: 'fa-times-circle', color: '#ef4444' },
  ] : [];

  if (loading && !stats) {
    return (
      <div className="flex justify-center pt-20">
        <div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-xl font-semibold text-heading">Dashboard</h1>
          <span className="text-xs text-muted">Overview of your store performance</span>
        </div>
        <button onClick={fetchData} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition">
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-7">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10">
            <div className="float-right text-2xl opacity-15" style={{ color: card.color || '#888' }}>
              <i className={`fas ${card.icon}`} />
            </div>
            <div className="font-serif text-2xl font-bold text-heading">{card.value}</div>
            <div className="text-xs text-muted font-medium mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10">
        <h3 className="text-sm font-bold text-heading mb-3">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wider">
                  <th className="pb-2 pr-3 font-semibold">Order</th>
                  <th className="pb-2 pr-3 font-semibold">Date</th>
                  <th className="pb-2 pr-3 font-semibold">Customer</th>
                  <th className="pb-2 pr-3 font-semibold">Total</th>
                  <th className="pb-2 pr-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.orderNumber} className="border-t border-gray-50">
                    <td className="py-2.5 pr-3 font-semibold text-[0.7rem]">#{o.orderNumber}</td>
                    <td className="py-2.5 pr-3 text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-2.5 pr-3">{o.customer?.fullName}</td>
                    <td className="py-2.5 pr-3 font-semibold">₹{Number(o.totalAmount).toLocaleString()}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-semibold ${STATUS_BADGES[o.status] || 'bg-gray-100 text-gray-800'}`}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link to="/admin/orders" className="block text-center text-xs text-emerald-deep font-semibold mt-4 hover:underline">
          View All Orders →
        </Link>
      </div>
    </div>
  );
}
