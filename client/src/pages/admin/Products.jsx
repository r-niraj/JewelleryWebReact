import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const STATUS_CONFIG = {
  AVAILABLE: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Available' },
  OUT_OF_STOCK: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', label: 'Out of Stock' },
  TEMPORARILY_UNAVAILABLE: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Unavailable' },
  DISCONTINUED: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400', label: 'Discontinued' },
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const url = statusFilter
        ? `/api/products?limit=100&all=true&status=${statusFilter}`
        : '/api/products?limit=100&all=true';
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch { }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const toggleFeatured = async (slug, current) => {
    try {
      await fetch(`/api/products/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isFeatured: !current }),
      });
      fetchProducts();
    } catch { }
  };

  const updateStatus = async (slug, newStatus) => {
    try {
      const res = await fetch(`/api/products/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) { setMsg(`Status updated`); fetchProducts(); }
      else setMsg(data.error || 'Update failed');
    } catch { setMsg('Update failed'); }
  };

  const deleteProduct = async (slug, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/products/${slug}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) { setMsg(`Deleted "${name}"`); fetchProducts(); }
      else setMsg(data.error || 'Delete failed');
    } catch { setMsg('Delete failed'); }
  };

  const toggleSelect = (slug) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.slug)));
  };

  const applyBulkUpdate = async () => {
    if (!bulkStatus || selected.size === 0) return;
    let success = 0;
    for (const slug of selected) {
      try {
        const res = await fetch(`/api/products/${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: bulkStatus }),
        });
        const data = await res.json();
        if (data.success) success++;
      } catch { }
    }
    setMsg(`${success} product(s) updated to ${STATUS_CONFIG[bulkStatus]?.label || bulkStatus}`);
    setShowBulk(false);
    setBulkStatus('');
    setSelected(new Set());
    fetchProducts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-xl font-semibold text-heading">Products</h1>
          <span className="text-xs text-muted">{products.length} product{products.length !== 1 ? 's' : ''}</span>
        </div>
        <Link to="/admin/products/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition">
          <i className="fas fa-plus" /> Add Product
        </Link>
      </div>

      {msg && (
        <div className="text-xs rounded-lg px-4 py-3 mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 flex justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="ml-2">&times;</button>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-muted font-semibold">Status:</span>
        {['', 'AVAILABLE', 'OUT_OF_STOCK', 'TEMPORARILY_UNAVAILABLE', 'DISCONTINUED'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-[0.6rem] font-semibold rounded-lg transition ${
              statusFilter === s ? 'bg-emerald-deep text-white' : 'bg-ivory text-heading hover:bg-gold-soft/20'
            }`}
          >
            {s ? (STATUS_CONFIG[s]?.label || s) : 'All'}
          </button>
        ))}
        {selected.size > 0 && (
          <button
            onClick={() => setShowBulk(true)}
            className="px-3 py-1.5 text-[0.6rem] font-semibold rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition ml-2"
          >
            <i className="fas fa-layer-group mr-1" /> Bulk ({selected.size})
          </button>
        )}
      </div>

      {showBulk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowBulk(false)}>
          <div className="bg-white rounded-[16px] p-6 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-heading mb-3">Bulk Update Status</h3>
            <p className="text-xs text-muted mb-3">{selected.size} product(s) selected</p>
            <select
              value={bulkStatus}
              onChange={(e) => setBulkStatus(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory mb-4"
            >
              <option value="">Select status...</option>
              <option value="AVAILABLE">Available</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowBulk(false)} className="flex-1 py-2.5 text-xs font-semibold bg-ivory text-heading rounded-lg">Cancel</button>
              <button onClick={applyBulkUpdate} disabled={!bulkStatus}
                className="flex-1 py-2.5 text-xs font-semibold bg-emerald-deep text-white rounded-lg disabled:opacity-50">Apply</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          <i className="fas fa-box text-3xl mb-3 opacity-30" /><br />No products found.
        </div>
      ) : (
        <div className="bg-white rounded-[16px] overflow-hidden border border-gold-soft/10">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gold-soft/10 bg-ivory">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={toggleSelectAll} className="accent-emerald-deep" />
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Category</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted">Featured</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.AVAILABLE;
                  return (
                  <tr key={p.id} className="border-b border-gold-soft/10 hover:bg-ivory/50 transition">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(p.slug)} onChange={() => toggleSelect(p.slug)} className="accent-emerald-deep" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-ivory flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0].imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted"><i className="fas fa-image" /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-heading">{p.name}</p>
                          <p className="text-[0.6rem] text-muted">SKU: {p.sku || 'N/A'} &middot; Slug: {p.slug}</p>
                          {p.availabilityUpdatedAt && (
                            <p className="text-[0.55rem] text-muted">Updated: {new Date(p.availabilityUpdatedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-heading">₹{Number(p.price).toLocaleString()}
                      <span className="text-muted font-normal line-through ml-1">₹{Number(p.originalPrice).toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[0.55rem] font-semibold ${cfg.bg} ${cfg.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <div className="mt-1">
                        <select
                          value={p.status}
                          onChange={(e) => updateStatus(p.slug, e.target.value)}
                          className="text-[0.5rem] border border-gold-soft/20 rounded px-1 py-0.5 bg-transparent outline-none"
                        >
                          <option value="AVAILABLE">Available</option>
                          <option value="OUT_OF_STOCK">Out of Stock</option>
                          <option value="TEMPORARILY_UNAVAILABLE">Unavailable</option>
                          <option value="DISCONTINUED">Discontinued</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`${p.stockQuantity < 10 ? 'text-red-500' : 'text-body'}`}>{p.stockQuantity}</span>
                    </td>
                    <td className="px-4 py-3 text-body">{p.category || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleFeatured(p.slug, p.isFeatured)}
                        className={`${p.isFeatured ? 'text-amber-500' : 'text-gray-300 hover:text-amber-300'} transition`}>
                        <i className="fas fa-star" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/products/${p.slug}`}
                          className="px-2.5 py-1.5 text-[0.55rem] font-semibold bg-ivory text-heading rounded-md hover:bg-gold-soft/20 transition">
                          <i className="fas fa-edit mr-0.5" /> Edit
                        </Link>
                        <Link to={`/products/${p.slug}`} target="_blank"
                          className="px-2.5 py-1.5 text-[0.55rem] font-semibold bg-ivory text-muted rounded-md hover:bg-gold-soft/20 transition">
                          <i className="fas fa-external-link-alt mr-0.5" /> View
                        </Link>
                        <button onClick={() => deleteProduct(p.slug, p.name)}
                          className="px-2.5 py-1.5 text-[0.55rem] font-semibold bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition">
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );})}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}