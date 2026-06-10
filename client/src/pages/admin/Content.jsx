import { Link } from 'react-router-dom';

const SECTIONS = [
  { href: '/admin/content/hero', icon: 'fa-star', title: 'Hero Section', desc: 'Edit headline, subtitle, prices & button text' },
  { href: '/admin/content/features', icon: 'fa-th-large', title: 'Features & Trust Items', desc: 'Manage Why Women Love, Trust Banner & Reassurance cards' },
  { href: '/admin/content/gallery', icon: 'fa-images', title: 'Gallery & Product Images', desc: 'Gallery, Product Details & What\'s Included images' },
  { href: '/admin/content/benefits', icon: 'fa-gem', title: 'Luxury Benefits', desc: 'Why It Feels Premium section cards' },
  { href: '/admin/content/cta', icon: 'fa-bullhorn', title: 'CTA Buttons', desc: 'Button text & visibility for each call-to-action' },
];

export default function Content() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-xl font-semibold text-heading">Content Management</h1>
        <span className="text-xs text-muted">Edit all dynamic content on the landing page</span>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SECTIONS.map((s) => (
          <Link key={s.href} to={s.href}
            className="bg-white rounded-[16px] p-6 border border-gold-soft/10 hover:border-emerald-deep/30 hover:shadow-[0_4px_16px_rgba(11,58,66,0.06)] transition block">
            <div className="w-10 h-10 rounded-full bg-emerald-deep/10 flex items-center justify-center text-emerald-deep text-base mb-3">
              <i className={`fas ${s.icon}`} />
            </div>
            <h3 className="font-sans text-sm font-semibold text-heading mb-1">{s.title}</h3>
            <p className="text-xs text-body font-light">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
