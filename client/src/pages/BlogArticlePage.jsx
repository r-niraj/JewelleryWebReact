import { Link, useParams } from "react-router-dom";

const BLOG_CONTENT = {
  "best-necklace-gift-ideas-for-girlfriend": {
    title: "Best Necklace Gift Ideas for Your Girlfriend",
    date: "2026-01-15",
    content: "Finding the perfect gift for your girlfriend can be challenging. A beautiful necklace is always a safe bet — it is personal, elegant, and something she can wear every day. Here are our top picks for necklace gifts that will make her smile."
  },
  "anniversary-gift-ideas-jewelry": {
    title: "Anniversary Gift Ideas: Jewelry She Will Treasure",
    date: "2026-01-10",
    content: "Anniversaries are special milestones that deserve memorable gifts. Jewelry is a timeless choice that symbolizes your love and commitment. From classic crystal pendants to elegant gold-plated designs, find the perfect piece to celebrate your love."
  },
  "how-to-style-fashion-jewelry": {
    title: "How to Style Fashion Jewelry for Every Occasion",
    date: "2026-01-05",
    content: "Fashion jewelry is versatile and can transform any outfit. Learn how to style your pieces for different occasions — from office meetings to festive celebrations. Discover tips on layering necklaces, matching with outfits, and accessorizing like a pro."
  },
  "jewelry-care-tips": {
    title: "Jewelry Care Tips: Keep Your Necklace Looking New",
    date: "2025-12-28",
    content: "Proper care can keep your fashion jewelry looking brilliant for years. Simple habits like storing pieces separately, avoiding contact with water and perfumes, and gentle cleaning with a soft cloth can make a significant difference in preserving your jewelry."
  },
  "trending-fashion-jewelry-india-2026": {
    title: "Trending Fashion Jewelry in India 2026",
    date: "2025-12-20",
    content: "The fashion jewelry landscape in India for 2026 is all about blending tradition with contemporary design. Crystal pendants, gold-plated classics, and minimalist designs are dominating the trends. Discover what is trending this year and find your next favorite piece."
  },
  "premium-necklaces-under-1000": {
    title: "Premium Necklaces Under ₹1000: Style on a Budget",
    date: "2025-12-15",
    content: "Looking elegant doesn't have to cost a fortune. We have curated a list of premium necklaces under ₹1000 that offer exceptional quality, beautiful design, and lasting shine. Perfect for students, young professionals, and anyone who loves great value."
  },
};

export default function BlogArticlePage() {
  const { slug } = useParams();
  const post = BLOG_CONTENT[slug];

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="max-w-[720px] mx-auto px-6 py-20">
          <div className="mb-8">
            <Link to="/blog" className="text-[0.7rem] text-[#8B8B8B] hover:text-[#1A1A1A] transition">&larr; Back to Blog</Link>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-6">Blog Post Not Found</h1>
          <p className="text-[0.82rem] text-[#4A4A4A] font-light">The article you are looking for does not exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <div className="mb-8">
          <Link to="/blog" className="text-[0.7rem] text-[#8B8B8B] hover:text-[#1A1A1A] transition">&larr; Back to Blog</Link>
        </div>
        <div className="flex items-center gap-3 text-[0.6rem] text-[#8B8B8B] mb-4">
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-6 leading-tight">{post.title}</h1>
        <div className="text-[0.82rem] text-[#4A4A4A] font-light leading-[1.9] space-y-4">
          <p>{post.content}</p>
          <p>Discover more jewelry pieces and gift ideas in our <Link to="/products" className="text-emerald-600 underline">collection</Link>.</p>
        </div>
      </div>
    </div>
  );
}
