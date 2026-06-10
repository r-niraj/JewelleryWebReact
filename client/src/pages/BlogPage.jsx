import { Link } from "react-router-dom";

const BLOG_POSTS = [
  {
    title: "Best Necklace Gift Ideas for Your Girlfriend",
    excerpt: "Looking for the perfect gift? Discover our curated list of stunning necklaces that she will love and cherish forever.",
    slug: "best-necklace-gift-ideas-for-girlfriend",
    date: "2026-01-15",
    readTime: "4 min read",
  },
  {
    title: "Anniversary Gift Ideas: Jewelry She Will Treasure",
    excerpt: "Make your anniversary unforgettable with these carefully selected jewelry pieces that symbolize your love.",
    slug: "anniversary-gift-ideas-jewelry",
    date: "2026-01-10",
    readTime: "3 min read",
  },
  {
    title: "How to Style Fashion Jewelry for Every Occasion",
    excerpt: "From office wear to wedding season, learn how to style your fashion jewelry for every occasion.",
    slug: "how-to-style-fashion-jewelry",
    date: "2026-01-05",
    readTime: "5 min read",
  },
  {
    title: "Jewelry Care Tips: Keep Your Necklace Looking New",
    excerpt: "Simple tips to keep your fashion jewelry brilliant and tarnish-free for years to come.",
    slug: "jewelry-care-tips",
    date: "2025-12-28",
    readTime: "3 min read",
  },
  {
    title: "Trending Fashion Jewelry in India 2026",
    excerpt: "Discover the latest fashion jewelry trends in India for 2026 — from crystal pendants to gold-plated classics.",
    slug: "trending-fashion-jewelry-india-2026",
    date: "2025-12-20",
    readTime: "4 min read",
  },
  {
    title: "Premium Necklaces Under ₹1000: Style on a Budget",
    excerpt: "You don't need to spend a fortune to look elegant. Explore our top picks for premium necklaces under ₹1000.",
    slug: "premium-necklaces-under-1000",
    date: "2025-12-15",
    readTime: "3 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[960px] mx-auto px-6 py-20">
        <Link to="/" className="font-serif text-base tracking-wide text-[#1A1A1A] hover:opacity-70 transition mb-8 inline-block">Shopsastamart</Link>
        <div className="mb-12">
          <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-3">Style Journal</h1>
          <p className="text-[0.82rem] text-[#6B6B6B] font-light">Jewelry styling tips, gift guides, and fashion inspiration.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {BLOG_POSTS.map((post) => (
            <article key={post.slug} className="group">
              <div className="bg-[#F5F5F3] rounded-[12px] aspect-[16/9] mb-4 flex items-center justify-center">
                <i className="fas fa-image text-[#D4D0C8] text-3xl" />
              </div>
              <div className="flex items-center gap-3 text-[0.6rem] text-[#8B8B8B] mb-2">
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
              <h2 className="font-sans text-base font-semibold text-[#1A1A1A] mb-2 group-hover:text-emerald-700 transition">
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-[0.75rem] text-[#6B6B6B] font-light leading-relaxed">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
