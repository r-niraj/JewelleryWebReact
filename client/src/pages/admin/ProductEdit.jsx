import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

export default function ProductEdit() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isNew = slug === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    fullDescription: '',
    price: '',
    originalPrice: '',
    sku: '',
    stockQuantity: '0',
    category: '',
    detailsMaterials: '',
    shippingReturns: '',
    careInstructions: '',
    isFeatured: false,
    isActive: true,
  });
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/products/${slug}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const p = d.product;
          setForm({
            name: p.name,
            slug: p.slug,
            shortDescription: p.shortDescription || '',
            fullDescription: p.fullDescription || '',
            price: String(p.price),
            originalPrice: String(p.originalPrice),
            sku: p.sku || '',
            stockQuantity: String(p.stockQuantity),
            category: p.category || '',
            detailsMaterials: p.detailsMaterials || '',
            shippingReturns: p.shippingReturns || '',
            careInstructions: p.careInstructions || '',
            isFeatured: p.isFeatured,
            isActive: p.isActive,
          });
          setImages(p.images || []);
          setVideos(p.videos || []);
        }
      })
      .finally(() => setLoading(false));
  }, [slug, isNew]);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: Number(form.originalPrice),
        stockQuantity: Number(form.stockQuantity),
      };
      delete payload.slug;
      const url = isNew ? '/api/products' : `/api/products/${slug}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(isNew ? 'Product created!' : 'Product updated!');
        if (isNew && data.product) navigate(`/admin/products/${data.product.slug}`);
      } else {
        setMsg(data.error || 'Save failed');
      }
    } catch { setMsg('Save failed'); }
    finally { setSaving(false); }
  };

  const addImage = async () => {
    if (!newImageUrl.trim()) return;
    try {
      const res = await fetch(`/api/products/${isNew ? 'temp' : slug}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageUrl: newImageUrl.trim(), altText: '', isPrimary: images.length === 0 }),
      });
      const data = await res.json();
      if (data.success) { setImages((prev) => [...prev, data.image]); setNewImageUrl(''); setMsg('Image added'); }
      else setMsg(data.error || 'Failed');
    } catch { setMsg('Failed to add image'); }
  };

  const setPrimary = async (imageId) => {
    setImages((prev) => prev.map((img) => ({ ...img, isPrimary: img.id === imageId })));
    try {
      await fetch(`/api/products/${slug}/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ imageUrl: images.find((i) => i.id === imageId)?.imageUrl, isPrimary: true }),
      });
    } catch { }
  };

  const deleteImage = async (imageId) => {
    try {
      await fetch(`/api/products/${slug}/images?id=${imageId}`, { method: 'DELETE', credentials: 'include' });
      setImages((prev) => prev.filter((img) => img.id !== imageId));
      setMsg('Image deleted');
    } catch { setMsg('Failed to delete image'); }
  };

  const addVideo = async () => {
    if (!newVideoUrl.trim()) return;
    try {
      const res = await fetch(`/api/products/${isNew ? 'temp' : slug}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ videoUrl: newVideoUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) { setVideos((prev) => [...prev, data.video]); setNewVideoUrl(''); setMsg('Video added'); }
      else setMsg(data.error || 'Failed');
    } catch { setMsg('Failed to add video'); }
  };

  const deleteVideo = async (videoId) => {
    try {
      await fetch(`/api/products/${slug}/videos?id=${videoId}`, { method: 'DELETE', credentials: 'include' });
      setVideos((prev) => prev.filter((v) => v.id !== videoId));
      setMsg('Video deleted');
    } catch { setMsg('Failed to delete video'); }
  };

  if (loading) return <div className="flex justify-center pt-10"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="text-muted hover:text-heading transition"><i className="fas fa-arrow-left" /></Link>
        <div>
          <h1 className="font-serif text-xl font-semibold text-heading">{isNew ? 'New Product' : `Edit: ${form.name}`}</h1>
          <span className="text-xs text-muted">{isNew ? 'Create a new product' : `/${slug}`}</span>
        </div>
      </div>

      {msg && (
        <div className="text-xs rounded-lg px-4 py-3 mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 flex justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="ml-2">&times;</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-[16px] p-5 border border-gold-soft/10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-heading mb-1">Product Name *</label>
                <input value={form.name} onChange={(e) => update('name', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">Slug *</label>
                <input value={form.slug} onChange={(e) => update('slug', e.target.value)} disabled={!isNew}
                  className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition ${!isNew ? 'opacity-60 cursor-not-allowed' : ''}`} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">SKU</label>
                <input value={form.sku} onChange={(e) => update('sku', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-heading mb-1">Short Description</label>
              <textarea value={form.shortDescription} onChange={(e) => update('shortDescription', e.target.value)} rows={2}
                className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition resize-none" />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-heading mb-1">Full Description</label>
              <textarea value={form.fullDescription} onChange={(e) => update('fullDescription', e.target.value)} rows={4}
                className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition resize-none" />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-heading mb-1">Product Details & Materials</label>
              <textarea value={form.detailsMaterials} onChange={(e) => update('detailsMaterials', e.target.value)} rows={3}
                className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition resize-none" />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-heading mb-1">Shipping & Returns</label>
              <textarea value={form.shippingReturns} onChange={(e) => update('shippingReturns', e.target.value)} rows={3}
                className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition resize-none" />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-heading mb-1">Care Instructions</label>
              <textarea value={form.careInstructions} onChange={(e) => update('careInstructions', e.target.value)} rows={3}
                className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition resize-none" />
            </div>
          </div>

          <div className="bg-white rounded-[16px] p-5 border border-gold-soft/10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Pricing & Inventory</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">Price (₹) *</label>
                <input type="number" value={form.price} onChange={(e) => update('price', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">Original Price (₹)</label>
                <input type="number" value={form.originalPrice} onChange={(e) => update('originalPrice', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-heading mb-1">Stock Quantity</label>
                <input type="number" value={form.stockQuantity} onChange={(e) => update('stockQuantity', e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-heading mb-1">Category</label>
              <input value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="e.g. Crystal Necklaces, Gold Collection"
                className="w-full px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
            </div>
          </div>

          <div className="bg-white rounded-[16px] p-5 border border-gold-soft/10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Product Images</h2>
            <div className="flex gap-2 mb-4">
              <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="/images/necklace-1.jpeg"
                className="flex-1 px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
              <button onClick={addImage} className="px-4 py-2.5 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition whitespace-nowrap">Add</button>
            </div>
            {images.length === 0 ? (
              <p className="text-xs text-muted italic">No images yet. Add image URLs above.</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {images.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-ivory border border-gold-soft/10">
                    <img src={img.imageUrl} alt={img.altText} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {!img.isPrimary && (
                        <button onClick={() => setPrimary(img.id)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[0.45rem] text-heading" title="Set as primary">
                          <i className="fas fa-star" />
                        </button>
                      )}
                      <button onClick={() => deleteImage(img.id)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[0.45rem] text-red-500" title="Delete">
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                    {img.isPrimary && <span className="absolute top-1 left-1 text-[0.35rem] bg-amber-400 text-white px-1 rounded font-bold">PRIMARY</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-[16px] p-5 border border-gold-soft/10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Product Videos</h2>
            <div className="flex gap-2 mb-4">
              <input value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="/uploads/hero/video.mp4"
                className="flex-1 px-3 py-2.5 border-2 border-gold-soft/30 rounded-lg text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
              <button onClick={addVideo} className="px-4 py-2.5 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition whitespace-nowrap">Add</button>
            </div>
            {videos.length === 0 ? (
              <p className="text-xs text-muted italic">No videos yet. Add video URLs above.</p>
            ) : (
              <div className="space-y-2">
                {videos.map((v) => (
                  <div key={v.id} className="flex items-center gap-3 p-2 bg-ivory rounded-lg">
                    <i className="fas fa-video text-muted" />
                    <span className="flex-1 text-xs text-body truncate">{v.videoUrl}</span>
                    <button onClick={() => deleteVideo(v.id)} className="text-red-400 hover:text-red-600 text-xs"><i className="fas fa-trash" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-[16px] p-5 border border-gold-soft/10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted mb-4">Status</h2>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} className="accent-emerald-deep" />
              <span className="text-xs text-body">Active (visible on store)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} className="accent-amber-500" />
              <span className="text-xs text-body">Featured (show on homepage)</span>
            </label>
          </div>

          <button onClick={save} disabled={saving}
            className="w-full py-3.5 bg-emerald-deep text-white rounded-[14px] text-sm font-bold uppercase tracking-wider hover:bg-teal-luxury disabled:opacity-60 transition shadow-[0_4px_14px_rgba(11,58,66,0.15)]">
            {saving ? <><i className="fas fa-spinner fa-spin mr-2" /> Saving...</> : isNew ? 'Create Product' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
