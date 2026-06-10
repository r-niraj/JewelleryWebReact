import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from 'react-redux'
import { addItem, selectCartItemCount } from '../store/slices/cartSlice'
import JsonLd from '../components/JsonLd';
import { breadcrumbSchema, faqSchema } from '../lib/schema';
import { SITE_URL, SITE_NAME } from '../lib/seo';

const COLLECTION_FAQS = [
  { q: "What materials are used in your jewelry?", a: "Our pieces feature 18k gold-plated sterling silver, brilliant-cut crystals, and tarnish-resistant coatings for lasting shine." },
  { q: "Do you offer Cash on Delivery?", a: "Yes! We offer COD across India. You pay only when your package arrives." },
  { q: "How long does delivery take?", a: "Delhi NCR: 1-3 days. Metro cities: 2-5 days. Other cities: 4-7 days." },
  { q: "Can I return a product?", a: "Yes! We offer easy returns within 7 days of delivery." },
  { q: "Is gift packaging included?", a: "Every order comes in a premium velvet gift box, ready to gift." },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const itemCount = useSelector(selectCartItemCount);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedSlugs, setAddedSlugs] = useState(new Set());

  useEffect(() => {
    fetch("/api/products?limit=50").then((r) => r.json()).then((d) => {
      if (d.success) setProducts(d.products);
    }).finally(() => setLoading(false));
  }, []);

  const collectionBreadcrumb = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Collection", url: `${SITE_URL}/products` },
  ]);

  return (
    <div className="min-h-screen bg-ivory">
      <JsonLd data={collectionBreadcrumb} />
      <JsonLd data={faqSchema(COLLECTION_FAQS)} />
      <div className="border-b border-gold-soft/20 bg-ivory/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="font-serif text-lg font-normal tracking-wide text-heading">Shopsastamart</Link>
          <Link to="/cart" className="relative text-lg font-medium text-heading hover:opacity-60 transition">
            <i className="fas fa-shopping-bag" />
            {itemCount > 0 && (
              <span className="absolute -top-2.5 -right-3 w-5 h-5 bg-emerald-deep text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center shadow-sm">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-heading tracking-tight">Our Collection</h1>
          <p className="text-sm text-body font-light mt-2 max-w-lg mx-auto">Handcrafted elegance for every occasion. Discover jewelry that speaks.</p>
          <div className="flex items-center justify-center gap-2 mt-3 text-[0.65rem] text-muted">
            <span><i className="fas fa-check-circle text-emerald-deep mr-1" /> Free Shipping</span>
            <span><i className="fas fa-check-circle text-emerald-deep mr-1" /> COD Available</span>
            <span><i className="fas fa-check-circle text-emerald-deep mr-1" /> Gift Box Included</span>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[16px] overflow-hidden border border-gold-soft/10 animate-pulse">
                <div className="aspect-square bg-champagne" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-champagne rounded w-3/4" />
                  <div className="h-2 bg-champagne rounded w-1/2" />
                  <div className="h-4 bg-champagne rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-muted text-sm">
            <i className="fas fa-box-open text-3xl mb-3 opacity-30" /><br />No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((product, i) => {
              const primaryImage = product.images?.[0];
              const discount = Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="group bg-white rounded-[16px] overflow-hidden border border-gold-soft/10 hover:shadow-[0_8px_30px_rgba(11,58,66,0.08)] transition-all duration-300 hover:-translate-y-1"
                >
                  <Link to={`/products/${product.slug}`} className="block">
                    <div className="aspect-square overflow-hidden bg-champagne relative">
                      <img
                        src={primaryImage?.imageUrl || "/images/necklace-1.jpeg"}
                        alt={`${product.name} - Premium Fashion Jewelry`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {discount > 0 && (
                        <span className="absolute top-3 left-3 bg-[#1A1A1A]/80 text-white text-[0.45rem] font-medium px-2.5 py-0.5">{discount}% off</span>
                      )}
                      {product.isFeatured && (
                        <span className="absolute top-3 right-3 bg-amber-400/90 text-white text-[0.5rem] font-bold px-2 py-0.5 rounded-full"><i className="fas fa-star mr-0.5" /> Featured</span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-medium text-sm text-heading mb-1 line-clamp-1 hover:text-emerald-deep transition">{product.name}</h3>
                    </Link>
                    <p className="text-[0.65rem] text-body font-light mb-2 line-clamp-2">{product.shortDescription}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-gold-soft tracking-wider text-xs">⭐⭐⭐⭐⭐</span>
                      <span className="text-[0.55rem] text-muted">(4.8)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-sans text-lg font-medium text-heading">₹{Number(product.price).toLocaleString()}</span>
                      <span className="text-xs text-muted line-through">₹{Number(product.originalPrice).toLocaleString()}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <Link to={`/products/${product.slug}`}
                        className="flex-1 flex items-center justify-center py-2 px-2 border border-gold-soft/30 rounded-[8px] text-[0.55rem] font-sans font-medium text-heading hover:bg-gold-soft/10 transition">
                        Details
                      </Link>
                      <button
                        onClick={() => {
                          const img = product.images?.[0];
                          dispatch(addItem({
                            productId: product.id,
                            slug: product.slug,
                            name: product.name,
                            price: Number(product.price),
                            originalPrice: Number(product.originalPrice),
                            image: img?.imageUrl || "",
                            maxQuantity: product.stockQuantity || 10,
                          }));
                          setAddedSlugs((prev) => new Set(prev).add(product.slug));
                          setTimeout(() => setAddedSlugs((prev) => { const n = new Set(prev); n.delete(product.slug); return n; }), 1500);
                        }}
                        className="flex-1 flex items-center justify-center py-2 px-2 bg-emerald-deep text-white rounded-[8px] text-[0.55rem] font-sans font-medium hover:bg-teal-luxury transition">
                        {addedSlugs.has(product.slug) ? <><i className="fas fa-check mr-0.5" /> Added</> : "Add to Cart"}
                      </button>
                      <Link to={`/checkout?product=${product.slug}`}
                        title="Buy Now"
                        className="flex items-center justify-center w-8 py-2 bg-[#1A1A1A] text-white rounded-[8px] text-[0.55rem] hover:bg-[#333] transition">
                        <i className="fas fa-bolt" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!loading && products.length > 0 && (
          <section className="mt-20 pt-16 border-t border-gold-soft/20">
            <div className="max-w-[720px] mx-auto text-center">
              <h2 className="font-serif text-2xl font-medium text-heading mb-4">Premium Fashion Jewelry for Every Woman</h2>
              <p className="text-sm text-body font-light leading-relaxed mb-8">
                Discover handcrafted fashion jewelry designed for the modern Indian woman. From elegant crystal pendants to timeless gold-plated necklaces, 
                each piece is thoughtfully designed to complement your unique style. Whether you are looking for a birthday gift for your girlfriend, 
                an anniversary surprise, or a treat for yourself, our collection offers premium quality at affordable prices.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs text-body">
                <div className="bg-champagne rounded-[12px] p-4"><i className="fas fa-gem text-emerald-deep text-lg mb-2 block" />Premium Quality</div>
                <div className="bg-champagne rounded-[12px] p-4"><i className="fas fa-truck text-emerald-deep text-lg mb-2 block" />Free Shipping</div>
                <div className="bg-champagne rounded-[12px] p-4"><i className="fas fa-gift text-emerald-deep text-lg mb-2 block" />Gift Box Included</div>
                <div className="bg-champagne rounded-[12px] p-4"><i className="fas fa-undo text-emerald-deep text-lg mb-2 block" />Easy Returns</div>
              </div>
            </div>
          </section>
        )}

        {!loading && products.length > 0 && (
          <section className="mt-16 pt-16 border-t border-gold-soft/20">
            <div className="max-w-[640px] mx-auto">
              <h2 className="font-serif text-2xl font-medium text-heading text-center mb-8">Frequently Asked Questions</h2>
              <div className="space-y-0">
                {COLLECTION_FAQS.map((faq, i) => (
                  <details key={i} className="group border-b border-gold-soft/20">
                    <summary className="py-3.5 text-sm font-medium text-heading cursor-pointer list-none flex justify-between items-center group-open:text-emerald-deep transition">
                      {faq.q}
                      <i className="fas fa-chevron-down text-xs text-muted transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="pb-3.5 text-sm text-body font-light leading-relaxed">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      <footer className="bg-[#1A1A1A] text-[#B8B4AD] mt-10">
        <div className="max-w-[1280px] mx-auto px-5 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="font-serif text-base text-white">Shopsastamart</Link>
              <p className="text-[0.6rem] font-light mt-3">Handcrafted jewelry for the discerning.</p>
            </div>
            <div>
              <h4 className="text-[0.5rem] uppercase tracking-widest text-white mb-3">Shop</h4>
              <ul className="space-y-2 text-[0.6rem]">
                <li><Link to="/products" className="hover:text-white transition">All Products</Link></li>
                <li><Link to="/products" className="hover:text-white transition">Best Sellers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.5rem] uppercase tracking-widest text-white mb-3">Support</h4>
              <ul className="space-y-2 text-[0.6rem]">
                <li><Link to="/track-order" className="hover:text-white transition">Track Order</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="/shipping-policy" className="hover:text-white transition">Shipping</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.5rem] uppercase tracking-widest text-white mb-3">Info</h4>
              <ul className="space-y-2 text-[0.6rem]">
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/privacy-policy" className="hover:text-white transition">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-6 text-[0.5rem] text-center">
            &copy; 2026 Shopsastamart. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
