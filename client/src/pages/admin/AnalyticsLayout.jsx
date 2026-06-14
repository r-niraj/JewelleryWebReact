import { Link, Outlet, useLocation } from 'react-router-dom';

const ANALYTICS_TABS = [
  { href: '/admin/analytics', label: 'Overview', icon: 'fa-chart-pie' },
  { href: '/admin/analytics/visitors', label: 'Visitors', icon: 'fa-users' },
  { href: '/admin/analytics/traffic-sources', label: 'Traffic Sources', icon: 'fa-share-alt' },
  { href: '/admin/analytics/campaigns', label: 'Campaigns', icon: 'fa-bullhorn' },
  { href: '/admin/analytics/products', label: 'Products', icon: 'fa-box' },
  { href: '/admin/analytics/journey', label: 'Journey', icon: 'fa-route' },
  { href: '/admin/analytics/geography', label: 'Geography', icon: 'fa-globe' },
  { href: '/admin/analytics/live', label: 'Live', icon: 'fa-bolt' },
  { href: '/admin/analytics/events', label: 'Events', icon: 'fa-list' },
  { href: '/admin/analytics/funnel', label: 'Funnel', icon: 'fa-filter' },
];

export default function AnalyticsLayout() {
  const location = useLocation();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-xl font-semibold text-heading">Analytics</h1>
        <span className="text-xs text-muted">Visitor intelligence & marketing attribution</span>
      </div>
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 hide-scrollbar border-b border-gold-soft/10">
        {ANALYTICS_TABS.map((tab) => {
          const active = location.pathname === tab.href || (tab.href !== '/admin/analytics' && location.pathname.startsWith(tab.href));
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                active ? 'bg-emerald-deep text-white' : 'text-muted hover:text-heading hover:bg-ivory'
              }`}
            >
              <i className={`fas ${tab.icon} text-[0.65rem]`} />
              {tab.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}
