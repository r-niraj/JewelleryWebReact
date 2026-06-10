import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SECTIONS = [
  { key: 'hero_primary', label: 'Hero — Primary Button', desc: 'Main ORDER NOW button in hero' },
  { key: 'hero_secondary', label: 'Hero — Secondary', desc: 'WhatsApp/chat button in hero' },
  { key: 'gift', label: 'Gift Section', desc: 'GIFT NOW button in gift section' },
  { key: 'countdown', label: 'Countdown Section', desc: 'CLAIM YOUR OFFER button' },
  { key: 'final', label: 'Final CTA', desc: 'ORDER NOW in final CTA section' },
];

export default function CTA() {
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    fetch('/api/content/cta', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSections(d.sections);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const update = (key, field, value) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || { buttonText: 'ORDER NOW', headline: null, subheadline: null, isVisible: true }), [field]: value },
    }));
  };

  const save = async (sectionKey) => {
    setSaving(sectionKey);
    setMsg('');
    const data = sections[sectionKey];
    try {
      const res = await fetch('/api/content/cta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sectionKey, ...data }),
      });
      const d = await res.json();
      if (!d.success) throw new Error(d.error);
      setMsg(`"${sectionKey}" saved`);
    } catch (err) { setMsg(err.message); }
    finally { setSaving(null); }
  };

  if (loading) return <div className="flex justify-center pt-20"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/content" className="text-muted hover:text-emerald-deep transition"><i className="fas fa-arrow-left" /></Link>
        <div><h1 className="font-serif text-xl font-semibold text-heading">CTA Buttons</h1><span className="text-xs text-muted">Edit button text & visibility for each call-to-action</span></div>
      </div>
      {msg && <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-3 mb-4">{msg}</div>}

      <div className="grid gap-4">
        {SECTIONS.map((sec) => {
          const data = sections[sec.key] || { buttonText: 'ORDER NOW', headline: null, subheadline: null, isVisible: true };
          return (
            <div key={sec.key} className="bg-white rounded-[16px] p-5 border border-gold-soft/10">
              <div className="flex items-center justify-between mb-3">
                <div><h3 className="text-sm font-semibold text-heading">{sec.label}</h3><p className="text-[0.65rem] text-muted">{sec.desc}</p></div>
                <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                  <span className="text-[0.65rem]">Visible</span>
                  <input type="checkbox" checked={data.isVisible} onChange={(e) => update(sec.key, 'isVisible', e.target.checked)}
                    className="w-4 h-4 rounded border-gold-soft/30 text-emerald-deep focus:ring-emerald-deep cursor-pointer" />
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div><label className="block text-[0.65rem] font-semibold text-heading mb-1">Button Text</label>
                  <input value={data.buttonText} onChange={(e) => update(sec.key, 'buttonText', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
                <div><label className="block text-[0.65rem] font-semibold text-heading mb-1">Headline <span className="text-muted font-normal">(optional)</span></label>
                  <input value={data.headline || ''} onChange={(e) => update(sec.key, 'headline', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep" /></div>
              </div>
              <button onClick={() => save(sec.key)} disabled={saving === sec.key}
                className="px-5 py-2 bg-emerald-deep text-white rounded-[14px] text-xs font-semibold hover:bg-teal-luxury disabled:opacity-60 transition">
                {saving === sec.key ? 'Saving...' : 'Save'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
