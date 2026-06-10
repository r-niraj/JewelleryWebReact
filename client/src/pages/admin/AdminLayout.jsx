import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutAdmin, selectAdmin, selectAdminLoading } from '../../store/slices/adminAuthSlice';

const NAV_ITEMS = [
  { href: '/admin/dashboard', icon: 'fa-chart-pie', label: 'Dashboard' },
  { href: '/admin/orders', icon: 'fa-shopping-bag', label: 'Orders' },
  { href: '/admin/products', icon: 'fa-box', label: 'Products' },
  { href: '/admin/customers', icon: 'fa-users', label: 'Customers' },
  { href: '/admin/content', icon: 'fa-edit', label: 'Content' },
  { href: '/admin/hero-manager', icon: 'fa-camera', label: 'Hero Manager' },
  { href: '/admin/media', icon: 'fa-images', label: 'Media' },
];

const CONTENT_DROPDOWN = [
  { href: '/admin/content/hero', label: 'Hero' },
  { href: '/admin/content/gallery', label: 'Gallery' },
  { href: '/admin/content/features', label: 'Features' },
  { href: '/admin/content/cta', label: 'CTA' },
  { href: '/admin/content/benefits', label: 'Benefits' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const admin = useSelector(selectAdmin);
  const loading = useSelector(selectAdminLoading);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      navigate('/admin/login', { replace: true });
    }
  }, [admin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" />
      </div>
    );
  }

  if (!admin) return null;

  const isActive = (href) => {
    if (href === '/admin/content' && location.pathname.startsWith('/admin/content')) return true;
    return location.pathname === href;
  };

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-ivory">
      <aside className="w-[220px] bg-emerald-deep text-white flex-shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="font-serif text-lg font-semibold tracking-wide px-4 pt-6 pb-7">
          Shopsastamart <span className="text-gold-soft">Admin</span>
        </div>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            if (item.label === 'Content') {
              return (
                <div key={item.href} className="relative">
                  <button
                    onClick={() => setContentDropdownOpen(!contentDropdownOpen)}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      active ? 'bg-gold-soft/15 text-gold-soft' : 'text-white/60 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <i className={`fas ${item.icon} w-[18px]`} />
                    {item.label}
                    <i className={`fas fa-chevron-down ml-auto text-[0.6rem] transition ${contentDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {contentDropdownOpen && (
                    <div className="ml-7 mt-1 flex flex-col gap-0.5">
                      {CONTENT_DROPDOWN.map((sub) => (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                            location.pathname === sub.href ? 'bg-gold-soft/15 text-gold-soft' : 'text-white/50 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? 'bg-gold-soft/15 text-gold-soft' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <i className={`fas ${item.icon} w-[18px]`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 mb-2">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-white/50 hover:bg-white/5 hover:text-red-300 transition"
          >
            <i className="fas fa-sign-out-alt w-[18px]" />
            Logout
          </button>
        </div>
        <div className="border-t border-white/10 px-4 py-3 text-[0.7rem] text-white/30">v2.0.0</div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => setShowLogoutConfirm(false)}>
          <div className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-[16px] p-8 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-4xl mb-3">🚪</div>
            <h3 className="font-serif text-lg font-semibold text-heading mb-1.5">Logout</h3>
            <p className="text-sm text-body font-light mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 border-2 border-gold-soft/30 rounded-[14px] text-sm font-semibold text-heading hover:bg-gold-soft/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 bg-red-600 text-white rounded-[14px] text-sm font-bold hover:bg-red-700 transition shadow-[0_4px_14px_rgba(220,38,38,0.2)]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 overflow-x-auto">
        <Outlet />
      </div>
    </div>
  );
}
