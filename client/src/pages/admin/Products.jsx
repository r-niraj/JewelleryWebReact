import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?limit=100&all=true', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch { }
    finally { setLoading(false); }
  }, []);

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

  const toggleActive = async (slug, current) => {
    try {
      await fetch(`/api/products/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !current }),
      });
      fetchProducts();
    } catch { }
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

      {loading ? (
        <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted text-sm">
          <i className="fas fa-box text-3xl mb-3 opacity-30" /><br />No products yet. Create your first product.
        </div>
      ) : (
        <div className="bg-white rounded-[16px] overflow-hidden border border-gold-soft/10">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gold-soft/10 bg-ivory">
                  <th className="text-left px-4 py-3 font-semibold text-muted">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Stock</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted">Category</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted">Featured</th>
                  <th className="text-center px-4 py-3 font-semibold text-muted">Active</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gold-soft/10 hover:bg-ivory/50 transition">
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
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-heading">₹{Number(p.price).toLocaleString()}
                      <span className="text-muted font-normal line-through ml-1">₹{Number(p.originalPrice).toLocaleString()}</span>
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
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(p.slug, p.isActive)}
                        className={`${p.isActive ? 'text-emerald-deep' : 'text-red-300'} transition`}>
                        <i className={`fas ${p.isActive ? 'fa-eye' : 'fa-eye-slash'}`} />
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
