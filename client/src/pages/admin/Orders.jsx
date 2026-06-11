import { useEffect, useState, useCallback } from 'react';

const STATUSES = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out For Delivery', 'Delivered', 'Cancelled', 'Returned'];

const STATUS_BADGES = {
  Pending: 'bg-amber-100 text-amber-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Packed: 'bg-indigo-100 text-indigo-800',
  Shipped: 'bg-purple-100 text-purple-800',
  'Out For Delivery': 'bg-orange-100 text-orange-800',
  Delivered: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-800',
  Returned: 'bg-gray-100 text-gray-800',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await fetch(`/api/orders/list?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) { setOrders(data.orders); setTotal(data.total); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderNumber, newStatus) => {
    try {
      const res = await fetch('/api/orders/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderNumber, status: newStatus }),
      });
      const data = await res.json();
      if (!data.success) { alert(data.error); return; }
      fetchOrders();
    } catch (err) { alert(err.message); }
  };

  const exportCSV = () => {
    if (orders.length === 0) { alert('No orders to export'); return; }
    const headers = ['Order Number', 'Date', 'Name', 'Phone', 'Address', 'City', 'State', 'Pincode', 'Product', 'Quantity', 'Unit Price', 'Total', 'Status', 'Payment'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString('en-IN'),
      `"${o.customer?.fullName || ''}"`,
      o.customer?.phone,
      `"${o.customer?.address || ''}"`,
      o.customer?.city,
      o.customer?.state,
      o.customer?.pincode,
      o.items?.length ? o.items.map(i => i.productName).join(' | ') : o.productName,
      o.quantity,
      o.unitPrice,
      o.totalAmount,
      o.status,
      o.paymentMethod,
    ].join(','));
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shopsastamart_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSearch = () => { setPage(1); fetchOrders(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-xl font-semibold text-heading">Orders</h1>
          <span className="text-xs text-muted">Manage and track all customer orders</span>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gold-soft/30 rounded-lg text-xs font-semibold hover:border-emerald-deep hover:text-emerald-deep transition">
          <i className="fas fa-download" /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap gap-2.5 mb-4 items-center">
        <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder="Search name, phone, order..."
          className="px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white focus:border-emerald-deep min-w-[200px]" />
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-white focus:border-emerald-deep">
          <option value="all">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={handleSearch} className="px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition">
          <i className="fas fa-search" /> Search
        </button>
        <span className="text-xs text-muted ml-auto">{total} result(s)</span>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><i className="fas fa-inbox text-3xl opacity-30 block mb-3" /><p className="text-sm">No orders found</p></div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted uppercase tracking-wider bg-ivory">
                {['Order ID', 'Date', 'Customer', 'Phone', 'City', 'Product', 'Qty', 'Total', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-3.5 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.orderNumber} className="border-t border-gold-soft/10 hover:bg-ivory">
                  <td className="px-3.5 py-3 font-semibold text-[0.7rem] whitespace-nowrap">#{o.orderNumber}</td>
                  <td className="px-3.5 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    <br /><span className="text-[0.6rem]">{new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                  <td className="px-3.5 py-3 font-semibold whitespace-nowrap">{o.customer?.fullName}</td>
                  <td className="px-3.5 py-3 whitespace-nowrap">{o.customer?.phone}</td>
                  <td className="px-3.5 py-3 whitespace-nowrap">{o.customer?.city}</td>
                  <td className="px-3.5 py-3">
                    {o.items?.length ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{o.items.length} items</span>
                        <span className="text-[0.55rem] text-gray-400 truncate max-w-[180px] block leading-tight">
                          {o.items.map(i => i.productName).join(', ')}
                        </span>
                      </div>
                    ) : o.productName}
                  </td>
                  <td className="px-3.5 py-3 text-center">{o.quantity}</td>
                  <td className="px-3.5 py-3 font-semibold whitespace-nowrap">₹{Number(o.totalAmount).toLocaleString()}</td>
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-semibold ${STATUS_BADGES[o.status] || 'bg-gray-100 text-gray-800'}`}>{o.status}</span>
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <select value={o.status} onChange={(e) => handleStatusUpdate(o.orderNumber, e.target.value)}
                      className="px-2 py-1.5 border-2 border-gold-soft/30 rounded-lg text-[0.65rem] outline-none bg-white focus:border-emerald-deep cursor-pointer">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setSelectedOrder(o)} className="ml-1.5 px-2 py-1.5 border border-gold-soft/30 rounded-lg text-[0.6rem] hover:border-emerald-deep transition">
                      <i className="fas fa-eye" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setSelectedOrder(null)}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-7 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedOrder(null)} className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-heading transition bg-none border-none cursor-pointer">&times;</button>
            <h3 className="font-serif text-lg font-semibold text-heading mb-5"><i className="fas fa-receipt text-emerald-deep mr-2" />Order Details</h3>
            <div className="space-y-3 text-sm">
              {[
                ['Order Number', `#${selectedOrder.orderNumber}`],
                ['Date', new Date(selectedOrder.createdAt).toLocaleString('en-IN')],
                ['Status', selectedOrder.status],
                ['Customer', selectedOrder.customer?.fullName],
                ['Phone', selectedOrder.customer?.phone],
                ['Address', `${selectedOrder.customer?.address}, ${selectedOrder.customer?.city}, ${selectedOrder.customer?.state} - ${selectedOrder.customer?.pincode}`],
                ...(selectedOrder.items?.length
                  ? selectedOrder.items.map((item, i) => [`Item ${i + 1}`, `${item.productName} × ${item.quantity} — ₹${Number(item.totalPrice).toLocaleString()}`])
                  : [['Product', selectedOrder.productName], ['Quantity', String(selectedOrder.quantity)]]),
                ['Total', `₹${Number(selectedOrder.totalAmount).toLocaleString()}`],
                ['Payment', selectedOrder.paymentMethod],
                ['Tracking', selectedOrder.trackingNumber || '—'],
                ['Notes', selectedOrder.notes || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-400 text-xs">{label}</span>
                  <span className="font-semibold text-right text-xs max-w-[60%]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 text-xs text-gray-400">
        <span>Showing {orders.length} of {total} orders</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-gold-soft/30 rounded-lg disabled:opacity-40 hover:border-emerald-deep transition">Previous</button>
          <button disabled={orders.length < 50} onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gold-soft/30 rounded-lg disabled:opacity-40 hover:border-emerald-deep transition">Next</button>
        </div>
      </div>
    </div>
  );
}
