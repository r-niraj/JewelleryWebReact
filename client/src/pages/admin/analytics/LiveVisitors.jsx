import { useEffect, useState, useRef } from 'react';

export default function LiveVisitors() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [stats, setStats] = useState({ activeToday: 0, rightNow: 0 });
  const intervalRef = useRef(null);

  const fetchLive = () => {
    fetch('/api/analytics/dashboard/live', { credentials: 'include' })
      .then((r) => r.json()).then((d) => {
        if (d.success) { setActiveSessions(d.sessions || []); setStats({ activeToday: d.activeToday || 0, rightNow: d.rightNow || 0 }); }
      }).catch(() => {});
  };

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-sm font-bold text-heading">Live Visitors</h2>
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Auto-refreshes every 30s" />
        <span className="text-[0.6rem] text-muted">Auto-refreshing every 30s</span>
        <button onClick={fetchLive} className="ml-auto px-3 py-1 text-xs font-semibold bg-ivory rounded-lg hover:bg-gold-soft/20 transition text-muted">
          <i className="fas fa-sync-alt mr-1" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <div className="text-xs text-muted mb-1">Active Right Now</div>
          <div className="font-serif text-3xl font-bold text-emerald-deep">{stats.rightNow}</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
          <div className="text-xs text-muted mb-1">Active Today</div>
          <div className="font-serif text-3xl font-bold text-heading">{stats.activeToday}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-gold-soft/10">
        <h3 className="text-xs font-bold text-heading mb-4">Current Sessions</h3>
        {activeSessions.length === 0 ? (
          <div className="text-center py-12 text-muted text-sm">No active sessions right now</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="pb-2 pr-3 font-semibold">Visitor</th>
                  <th className="pb-2 pr-3 font-semibold">Page</th>
                  <th className="pb-2 pr-3 font-semibold">Source</th>
                  <th className="pb-2 pr-3 font-semibold">Device</th>
                  <th className="pb-2 pr-3 font-semibold text-right">Duration</th>
                </tr>
              </thead>
              <tbody>
                {activeSessions.map((s, i) => (
                  <tr key={s.id || i} className="border-b border-gray-50 hover:bg-ivory/50">
                    <td className="py-2 pr-3">
                      <span className="font-medium text-heading">{s.anonymous_id?.slice(0, 8) || '—'}</span>
                      <span className="text-gray-400 ml-1">
                                {s.is_returning ? <i className="fas fa-sync text-[0.5rem]" title="Returning" /> : <i className="fas fa-plus text-[0.5rem]" title="New" />}
                              </span>
                    </td>
                    <td className="py-2 pr-3 text-muted max-w-[200px] truncate">{s.current_page || '/'}</td>
                    <td className="py-2 pr-3 text-muted">{s.utm_source || 'Direct'}</td>
                    <td className="py-2 pr-3 text-muted">{s.device_type || '—'}</td>
                    <td className="py-2 pr-3 text-right text-muted">{Math.floor((s.duration_seconds || 0) / 60)}m {(s.duration_seconds || 0) % 60}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
