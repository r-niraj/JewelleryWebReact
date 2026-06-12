import { Link } from 'react-router-dom';

export default function Logo({ className = '', link = true }) {
  const content = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-deep to-teal-luxury shadow-[0_2px_8px_rgba(11,58,66,0.2)]">
        <span className="text-white font-serif text-xs font-bold leading-none tracking-tight">SS</span>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-gold-soft rounded-full border-[1.5px] border-white" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-sm font-bold text-heading tracking-wide">Shop Sasta Mart</span>
        <span className="text-[0.45rem] text-muted font-sans font-medium tracking-[0.2em] uppercase">Premium Jewelry</span>
      </span>
    </span>
  );

  if (link) return <Link to="/" className="hover:opacity-85 transition-opacity no-underline">{content}</Link>;
  return content;
}
