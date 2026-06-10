import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function HeroContent() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetch('/api/content/hero', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setForm(d.hero);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/content/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      setMsg('Saved successfully');
    } catch (err) { setMsg(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center pt-20"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;
  if (!form) return <div className="text-center pt-20 text-muted text-sm">Failed to load</div>;

  const fields = [
    { key: 'title', label: 'Headline', type: 'text', rows: 2 },
    { key: 'subtitle', label: 'Subtitle', type: 'text', rows: 3 },
    { key: 'buttonText', label: 'Button Text', type: 'text' },
    { key: 'badgeText', label: 'Badge Text', type: 'text' },
    { key: 'price', label: 'Price (₹)', type: 'number' },
    { key: 'discountPrice', label: 'Original Price (₹)', type: 'number' },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/content" className="text-muted hover:text-emerald-deep transition"><i className="fas fa-arrow-left" /></Link>
        <div><h1 className="font-serif text-xl font-semibold text-heading">Hero Section</h1><span className="text-xs text-muted">Edit the main hero content</span></div>
      </div>
      {msg && (
        <div className={`text-xs rounded-lg px-4 py-3 mb-4 ${msg === 'Saved successfully' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg}
        </div>
      )}
      <div className="bg-white rounded-[16px] p-6 border border-gold-soft/10 max-w-2xl">
        <div className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-heading mb-1">{f.label}</label>
              {f.rows ? (
                <textarea value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)} rows={f.rows}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition resize-none" />
              ) : (
                <input type={f.type} value={form[f.key] || ''} onChange={(e) => update(f.key, e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
              )}
            </div>
          ))}
        </div>
        <button onClick={save} disabled={saving}
          className="mt-6 px-6 py-2.5 bg-emerald-deep text-white rounded-[14px] text-xs font-semibold hover:bg-teal-luxury disabled:opacity-60 transition">
          {saving ? 'Saving...' : 'Save Hero Content'}
        </button>
      </div>
    </div>
  );
}
