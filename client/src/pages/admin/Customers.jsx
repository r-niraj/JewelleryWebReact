import { useEffect, useState, useCallback } from 'react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/customers?search=', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setCustomers(data.customers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-xl font-semibold text-heading">Customers</h1>
          <span className="text-xs text-muted">View your customer database</span>
        </div>
        <button onClick={fetchCustomers} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition">
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><i className="fas fa-users text-3xl opacity-30 block mb-3" /><p className="text-sm">No customers yet</p></div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-muted uppercase tracking-wider bg-ivory">
                {['Name', 'Phone', 'Email', 'City', 'Orders', 'Total Spent', 'Last Order'].map((h) => (
                  <th key={h} className="px-3.5 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c, idx) => (
                <tr key={c.customerId || idx} className="border-t border-gold-soft/10 hover:bg-ivory">
                  <td className="px-3.5 py-3 font-semibold">{c.fullName}</td>
                  <td className="px-3.5 py-3">{c.phone}</td>
                  <td className="px-3.5 py-3 text-gray-400">{c.email || '—'}</td>
                  <td className="px-3.5 py-3">{c.city || '—'}</td>
                  <td className="px-3.5 py-3 text-center">{c.orderCount}</td>
                  <td className="px-3.5 py-3 font-semibold">₹{Number(c.totalSpent).toLocaleString()}</td>
                  <td className="px-3.5 py-3 text-gray-400">
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
