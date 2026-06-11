import { useEffect, useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [pw, setPw] = useState({ current: '', newPass: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) setSettings(data.settings);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const updateField = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSetting = async (key) => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key] || '' }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMessage('Saved successfully');
    } catch (err) {
      setMessage(err.message);
    }
    finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center pt-20"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>;
  }

  const fields = [
    { key: 'offerTitle', label: 'Offer Title', type: 'text', help: 'e.g. Weekend Offer, Festival Offer' },
    { key: 'offerEndDate', label: 'Offer End Date', type: 'datetime-local', help: 'Countdown timer target' },
    { key: 'stockCount', label: 'Stock Count', type: 'number', help: 'Displayed as low stock warning' },
    { key: 'deliveryDelhi', label: 'Delivery Days — Delhi NCR', type: 'text', help: 'e.g. 1-3 Days' },
    { key: 'deliveryMetro', label: 'Delivery Days — Metro Cities', type: 'text', help: 'e.g. 2-5 Days' },
    { key: 'deliveryOther', label: 'Delivery Days — Other Cities', type: 'text', help: 'e.g. 4-7 Days' },
    { key: 'whatsappNumber', label: 'WhatsApp Number', type: 'text', help: 'With country code' },
    { key: 'announcement', label: 'Top Bar Announcement', type: 'text', help: 'Text in the top banner' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-xl font-semibold text-heading">Settings</h1>
          <span className="text-xs text-muted">Manage store configuration</span>
        </div>
        <button onClick={fetchSettings} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury transition">
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      {message && (
        <div className={`text-xs rounded-lg px-4 py-3 mb-4 ${message === 'Saved successfully' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10 p-6">
        <div className="grid md:grid-cols-2 gap-5">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-heading mb-1">{f.label}</label>
              <div className="flex gap-2">
                <input
                  type={f.type}
                  value={settings[f.key] || ''}
                  onChange={(e) => updateField(f.key, e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition"
                />
                <button
                  onClick={() => saveSetting(f.key)}
                  disabled={saving}
                  className="px-3 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury disabled:opacity-60 transition whitespace-nowrap"
                >
                  Save
                </button>
              </div>
              {f.help && <p className="text-[0.6rem] text-muted mt-1">{f.help}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10 p-6 mt-6">
        <h2 className="font-semibold text-heading text-sm mb-4">Change Password</h2>
        {pwMsg && (
          <div className={`text-xs rounded-lg px-4 py-3 mb-4 ${pwMsg === 'Password updated successfully' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {pwMsg}
          </div>
        )}
        <div className="grid md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Current Password</label>
            <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">New Password</label>
            <input type="password" value={pw.newPass} onChange={(e) => setPw({ ...pw, newPass: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-heading mb-1">Confirm New Password</label>
            <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gold-soft/30 rounded-lg text-xs outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition" />
          </div>
        </div>
        <button onClick={async () => {
          if (pw.newPass !== pw.confirm) { setPwMsg('Passwords do not match'); return; }
          if (pw.newPass.length < 6) { setPwMsg('New password must be at least 6 characters'); return; }
          setPwSaving(true); setPwMsg('');
          try {
            const res = await fetch('/api/admin/change-password', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.newPass }),
            });
            const data = await res.json();
            setPwMsg(data.success ? 'Password updated successfully' : data.error);
            if (data.success) setPw({ current: '', newPass: '', confirm: '' });
          } catch { setPwMsg('Failed to change password'); }
          finally { setPwSaving(false); }
        }} disabled={pwSaving}
          className="mt-4 px-4 py-2 bg-emerald-deep text-white rounded-lg text-xs font-semibold hover:bg-teal-luxury disabled:opacity-60 transition">
          {pwSaving ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}
