import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TABS = [
  { value: 'gallery', label: 'Gallery' },
  { value: 'product_detail', label: 'Product Details' },
  { value: 'whats_included', label: 'What\'s Included' },
];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [tab, setTab] = useState('gallery');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    const res = await fetch('/api/content/gallery', { credentials: 'include' });
    const d = await res.json();
    if (d.success) setImages(d.images);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const save = async (item) => {
    setMsg('');
    const method = item.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/content/gallery', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(item),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      setMsg('Saved');
      setShowForm(false);
      setEditing(null);
      fetchAll();
    } catch (err) { setMsg(err.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this image?')) return;
    await fetch(`/api/content/gallery?id=${id}`, { method: 'DELETE', credentials: 'include' });
    fetchAll();
  };

  const filtered = images.filter((i) => i.sectionType === tab);

  if (loading) return <div className="flex justify-center pt-20"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/content" className="text-muted hover:text-emerald-deep transition"><i className="fas fa-arrow-left" /></Link>
        <div className="flex-1"><h1 className="font-serif text-xl font-semibold text-heading">Gallery & Product Images</h1><span className="text-xs text-muted">Manage all images across sections</span></div>
        <button onClick={() => { setEditing({ imageUrl: '', caption: '', sectionType: tab, sortOrder: filtered.length }); setShowForm(true); }}
          className="px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition"><i className="fas fa-plus mr-1" /> Add Image</button>
      </div>
      {msg && <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-3 mb-4">{msg}</div>}

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${tab === t.value ? 'bg-emerald-deep text-white' : 'bg-white text-muted border border-gold-soft/30 hover:border-emerald-deep'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && <div className="bg-white rounded-[16px] p-10 text-center text-muted text-sm border border-gold-soft/10">No images in this section</div>}
        {filtered.map((img) => (
          <div key={img.id} className="bg-white rounded-[16px] p-4 border border-gold-soft/10 flex items-center gap-4">
            <img src={img.imageUrl} alt={img.caption} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-heading truncate">{img.caption}</div><div className="text-[0.6rem] text-muted truncate">{img.imageUrl}</div></div>
            <span className="text-[0.6rem] text-muted">#{img.sortOrder}</span>
            <button onClick={() => { setEditing(img); setShowForm(true); }} className="text-xs text-emerald-deep hover:underline">Edit</button>
            <button onClick={() => del(img.id)} className="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        ))}
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-[16px] p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-base font-semibold text-heading mb-4">{editing.id ? 'Edit' : 'Add'} Image</h3>
            <div className="space-y-3">
              <div><label className="block text-xs font-semibold text-heading mb-1">Image URL</label>
                <input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              <div><label className="block text-xs font-semibold text-heading mb-1">Caption</label>
                <input value={editing.caption} onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              <div><label className="block text-xs font-semibold text-heading mb-1">Sort Order</label>
                <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              {tab === 'gallery' && (
                <div><label className="block text-xs font-semibold text-heading mb-1">Span Class <span className="text-muted font-normal">(optional, e.g. md:row-span-2)</span></label>
                  <input value={editing.spanClass || ''} onChange={(e) => setEditing({ ...editing, spanClass: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border-2 border-gold-soft/30 rounded-[14px] text-xs font-semibold text-muted hover:border-emerald-deep transition">Cancel</button>
              <button onClick={() => save(editing)} className="flex-1 py-2.5 bg-emerald-deep text-white rounded-[14px] text-xs font-semibold hover:bg-teal-luxury transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
