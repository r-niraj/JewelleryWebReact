import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  { value: 'why_love', label: 'Why Women Love' },
  { value: 'trust_banner', label: 'Trust Banner' },
  { value: 'reassurance', label: 'Reassurance' },
];

export default function Features() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchFeatures = async () => {
    setLoading(true);
    const res = await fetch('/api/content/features', { credentials: 'include' });
    const d = await res.json();
    if (d.success) setFeatures(d.features);
    setLoading(false);
  };

  useEffect(() => { fetchFeatures(); }, []);

  const saveFeature = async (f) => {
    setMsg('');
    const method = f.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/content/features', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(f),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      setMsg('Saved');
      setShowForm(false);
      setEditing(null);
      fetchFeatures();
    } catch (err) { setMsg(err.message); }
  };

  const deleteFeature = async (id) => {
    if (!confirm('Delete this feature?')) return;
    await fetch(`/api/content/features?id=${id}`, { method: 'DELETE', credentials: 'include' });
    fetchFeatures();
  };

  if (loading) return <div className="flex justify-center pt-20"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/content" className="text-muted hover:text-emerald-deep transition"><i className="fas fa-arrow-left" /></Link>
        <div className="flex-1"><h1 className="font-serif text-xl font-semibold text-heading">Features & Trust Items</h1><span className="text-xs text-muted">Manage Why Women Love, Trust Banner & Reassurance cards</span></div>
        <button onClick={() => { setEditing({ icon: 'fa-star', title: '', description: '', section: 'why_love', sortOrder: features.length }); setShowForm(true); }}
          className="px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition"><i className="fas fa-plus mr-1" /> Add Feature</button>
      </div>
      {msg && <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-3 mb-4">{msg}</div>}

      {SECTIONS.map((sec) => {
        const items = features.filter((f) => f.section === sec.value);
        return (
          <div key={sec.value} className="mb-6">
            <h3 className="text-sm font-semibold text-heading mb-3">{sec.label}</h3>
            <div className="grid gap-3">
              {items.length === 0 && <p className="text-xs text-muted italic">No items yet</p>}
              {items.map((f) => (
                <div key={f.id} className="bg-white rounded-[16px] p-4 border border-gold-soft/10 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-deep/10 flex items-center justify-center text-emerald-deep flex-shrink-0">
                    <i className={`fas ${f.icon}`} />
                  </div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-semibold text-heading truncate">{f.title}</div><div className="text-[0.65rem] text-muted truncate">{f.description}</div></div>
                  <button onClick={() => { setEditing(f); setShowForm(true); }} className="text-xs text-emerald-deep hover:underline">Edit</button>
                  <button onClick={() => deleteFeature(f.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {showForm && editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setShowForm(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white rounded-[16px] p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-serif text-base font-semibold text-heading mb-4">{editing.id ? 'Edit' : 'Add'} Feature</h3>
            <div className="space-y-3">
              <div><label className="block text-xs font-semibold text-heading mb-1">Icon (Font Awesome class)</label>
                <input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                  placeholder="fa-gem" className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              <div><label className="block text-xs font-semibold text-heading mb-1">Title</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              <div><label className="block text-xs font-semibold text-heading mb-1">Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={2}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep resize-none" /></div>
              <div><label className="block text-xs font-semibold text-heading mb-1">Section</label>
                <select value={editing.section} onChange={(e) => setEditing({ ...editing, section: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep">
                  {SECTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold text-heading mb-1">Sort Order</label>
                  <input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border-2 border-gold-soft/30 rounded-[14px] text-xs font-semibold text-muted hover:border-emerald-deep transition">Cancel</button>
              <button onClick={() => saveFeature(editing)} className="flex-1 py-2.5 bg-emerald-deep text-white rounded-[14px] text-xs font-semibold hover:bg-teal-luxury transition">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
