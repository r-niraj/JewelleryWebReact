import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Benefits() {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchBenefits = async () => {
    setLoading(true);
    const res = await fetch('/api/content/benefits', { credentials: 'include' });
    const d = await res.json();
    if (d.success) setBenefits(d.benefits);
    setLoading(false);
  };

  useEffect(() => { fetchBenefits(); }, []);

  const save = async (b) => {
    setMsg('');
    const method = b.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/content/benefits', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(b),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      setMsg('Saved');
      setShowForm(false);
      setEditing(null);
      fetchBenefits();
    } catch (err) { setMsg(err.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this benefit?')) return;
    await fetch(`/api/content/benefits?id=${id}`, { method: 'DELETE', credentials: 'include' });
    fetchBenefits();
  };

  if (loading) return <div className="flex justify-center pt-20"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/content" className="text-muted hover:text-emerald-deep transition"><i className="fas fa-arrow-left" /></Link>
        <div className="flex-1"><h1 className="font-serif text-xl font-semibold text-heading">Luxury Benefits</h1><span className="text-xs text-muted">Why It Feels Premium section — add or edit benefits</span></div>
        <button onClick={() => { setEditing({ imageUrl: '', title: '', description: '', sortOrder: benefits.length }); setShowForm(true); }}
          className="px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition"><i className="fas fa-plus mr-1" /> Add Benefit</button>
      </div>
      {msg && <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-3 mb-4">{msg}</div>}

      <div className="grid gap-3">
        {benefits.length === 0 && <div className="bg-white rounded-[16px] p-10 text-center text-muted text-sm border border-gold-soft/10">No benefits yet</div>}
        {benefits.map((b) => (
          <div key={b.id} className="bg-white rounded-[16px] p-4 border border-gold-soft/10 flex items-center gap-4">
            {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />}
            <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-heading truncate">{b.title}</div><div className="text-[0.65rem] text-muted line-clamp-2">{b.description}</div></div>
            <span className="text-[0.6rem] text-muted">#{b.sortOrder}</span>
            <button onClick={() => { setEditing(b); setShowForm(true); }} className="text-xs text-emerald-deep hover:underline">Edit</button>
            <button onClick={() => del(b.id)} className="text-xs text-red-400 hover:underline">Delete</button>
          </div>
        ))}
      </div>

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-[16px] p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-base font-semibold text-heading mb-4">{editing.id ? 'Edit' : 'Add'} Benefit</h3>
            <div className="space-y-3">
              <div><label className="block text-xs font-semibold text-heading mb-1">Image URL</label>
                <input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              <div><label className="block text-xs font-semibold text-heading mb-1">Title</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              <div><label className="block text-xs font-semibold text-heading mb-1">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep resize-none" /></div>
              <div><label className="block text-xs font-semibold text-heading mb-1">Sort Order</label>
                <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
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
