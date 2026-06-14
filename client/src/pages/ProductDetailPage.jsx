import { useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from 'react-redux'
import { addItem, selectCartItemCount } from '../store/slices/cartSlice'
import JsonLd from '../components/JsonLd';
import Logo from '../components/Logo';
import { productSchema, breadcrumbSchema, faqSchema } from '../lib/schema';
import { SITE_URL } from '../lib/seo';
import { useAnalytics } from '../analytics/useAnalytics';

const REVIEWS = [
  { name: "Priya S.", quote: "Received so many compliments. Looks far more expensive than its price. The packaging was gorgeous too!" },
  { name: "Arjun K.", quote: "Bought this as a gift for my girlfriend. She absolutely loved it! The quality is amazing for the price." },
  { name: "Riya J.", quote: "I wear it every day. My friends keep asking where I got it. Lightweight and so elegant!" },
  { name: "Simran N.", quote: "Perfect for office wear. Looks premium without being too flashy. I've recommended it to all my colleagues." },
  { name: "Rohit V.", quote: "My wife hasn't taken it off since! The shine is still perfect after 2 months." },
];

const SECTION_ITEMS = [
  { imageUrl: "/images/necklace-1.jpeg", altText: "Front View", mediaType: "image" },
  { imageUrl: "/images/necklace-2.jpeg", altText: "Close-up", mediaType: "image" },
  { imageUrl: "/images/necklace-3.jpeg", altText: "On Model", mediaType: "image" },
];

const TRUST_INDICATORS = [
  { icon: "fa-hand-holding-usd", label: "COD Available" },
  { icon: "fa-truck", label: "Free Shipping" },
  { icon: "fa-gift", label: "Gift Box Included" },
  { icon: "fa-lock", label: "Secure Checkout" },
  { icon: "fa-bolt", label: "Fast Delivery" },
];

const STORY_BENEFITS = [
  { icon: "fa-gem", title: "Premium Craftsmanship", desc: "Meticulously hand-finished by skilled artisans for flawless quality." },
  { icon: "fa-star", title: "Timeless Elegance", desc: "Designed to complement both traditional and contemporary styles." },
  { icon: "fa-gift", title: "Perfect Gift", desc: "Arrives in a luxury velvet gift box, ready to present." },
  { icon: "fa-shield-alt", title: "Tarnish Resistant", desc: "Special coating keeps your jewelry brilliant for years." },
];

const PRODUCT_FAQS = [
  { q: "Is Cash On Delivery available?", a: "Yes! We offer COD across India. You pay only when your package arrives." },
  { q: "How long does delivery take?", a: "Delhi NCR: 1-3 days. Metro cities: 2-5 days. Other cities: 4-7 days. All orders shipped with tracking." },
  { q: "Can I return the product?", a: "Yes! We offer easy returns within 7 days of delivery. Contact our support team and we'll guide you." },
  { q: "Is gift packaging included?", a: "Absolutely! Every order comes in a premium velvet gift box with an elegant outer sleeve — ready to gift directly." },
  { q: "Will the necklace tarnish?", a: "Each piece has a premium tarnish-resistant coating. With basic care, it stays brilliant for years." },
];

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { trackProductInteraction } = useAnalytics();
  const dispatch = useDispatch();
  const itemCount = useSelector(selectCartItemCount);
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const galleryRef = useRef(null);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState(0);
  const touchStartX = useRef(0);

  useEffect(() => {
    fetch(`/api/products/${slug}`, { credentials: 'include' }).then((r) => r.json()).then((d) => {
      if (d.success) {
        setProduct(d.product);
        setRelated(d.related || []);
        trackProductInteraction(d.product.id, d.product.name, d.product.category, 'view', window.location.pathname);
      }
    }).finally(() => setLoading(false));
  }, [slug, trackProductInteraction]);

  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIdx((prev) => (prev + 1) % REVIEWS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const galleryItems = [
    ...(product?.images?.length ? product.images : SECTION_ITEMS).map((i) => ({ ...i, mediaType: "image" })),
    ...(product?.videos || []).map((v) => ({ fileUrl: v.videoUrl, mediaType: "video", altText: "Product Video" })),
  ];

  const discount = product ? Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100) : 0;

  const accordionSections = [
    { id: "details", label: "Product Details & Materials", content: product?.detailsMaterials || "18k gold-plated sterling silver chain (18-inch). Pendant: 14mm x 12mm heart motif. Lobster clasp closure. Hypoallergenic and nickel-free. Tarnish-resistant finish for lasting brilliance." },
    { id: "shipping", label: "Shipping & Returns", content: product?.shippingReturns || "Free shipping on all orders within India. Dispatch within 24 hours. Estimated delivery: 3-5 business days. 30-day easy returns from the date of delivery. Items must be returned in original packaging with all tags attached." },
    { id: "care", label: "Care Instructions", content: product?.careInstructions || "Avoid contact with water, perfume, and cosmetics. Store in a dry, cool place away from direct sunlight. Clean gently with a soft, dry cloth after each wear. Remove before sleeping, showering, or exercising." },
  ];

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    trackProductInteraction(product.id, product.name, product.category, 'add_to_cart', window.location.pathname);
    const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
    dispatch(addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice),
      image: primaryImage?.imageUrl || "",
      maxQuantity: product.stockQuantity || 10,
      quantity: qty,
      status: product.status || 'AVAILABLE',
    }));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }, [product, qty, dispatch, trackProductInteraction]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    trackProductInteraction(product.id, product.name, product.category, 'buy_now', window.location.pathname);
    const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
    dispatch(addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice),
      image: primaryImage?.imageUrl || "",
      maxQuantity: product.stockQuantity || 10,
      quantity: qty,
      status: product.status || 'AVAILABLE',
    }));
    navigate(`/checkout?product=${product.slug}&qty=${qty}`);
  }, [product, qty, dispatch, navigate, trackProductInteraction]);

  const handlePrevImage = () => {
    setSelectedGalleryIdx((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  const handleNextImage = () => {
    setSelectedGalleryIdx((prev) => (prev + 1) % galleryItems.length);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="w-8 h-8 border border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-[#6B6B6B] font-light">Product not found</p>
        <Link to="/products" className="text-[#1A1A1A] text-xs font-medium mt-3 inline-block underline-offset-2 hover:underline">Browse all products</Link>
      </div>
    </div>
  );

  const currentItem = galleryItems[selectedGalleryIdx];
  const effectiveItems = galleryItems.length ? galleryItems : SECTION_ITEMS;

  const productUrl = `${SITE_URL}/products/${product.slug}`;

  const productBreadcrumb = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Collection", url: `${SITE_URL}/products` },
    { name: product.name, url: productUrl },
  ]);

  const productSchemaData = productSchema({
    name: product.name,
    slug: product.slug,
    description: product.shortDescription,
    price: Number(product.price),
    originalPrice: Number(product.originalPrice),
    image: product.images?.[0]?.imageUrl,
    images: product.images,
    category: product.category,
    sku: product.sku,
    stockQuantity: product.stockQuantity,
    ratingValue: 4.8,
    reviewCount: 1000,
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <JsonLd data={productSchemaData} />
      <JsonLd data={productBreadcrumb} />
      <JsonLd data={faqSchema(PRODUCT_FAQS)} />
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .gallery-zoom-container { position: relative; overflow: hidden; cursor: crosshair; }
        .gallery-zoom-container img { transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .gallery-zoom-container:hover img { transform: scale(1.8); }
        .gallery-thumb-active { border-color: #1A1A1A; }
        @media (max-width: 1023px) {
          .gallery-zoom-container:hover img { transform: none; }
        }
      `}</style>

      <header className="bg-[#FAFAFA]/80 backdrop-blur-sm sticky top-0 z-30 border-b border-[#E8E6E1]/50">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5">
              <Logo />
            <span className="text-[#C8C4BC] text-[0.5rem] hidden sm:inline">/</span>
            <Link to="/products" className="text-[0.65rem] text-[#8B8B8B] hover:text-[#1A1A1A] transition hidden sm:inline">Collection</Link>
            <span className="text-[#C8C4BC] text-[0.5rem]">/</span>
            <span className="text-[0.65rem] text-[#1A1A1A] font-medium truncate max-w-[180px]">{product.name}</span>
          </div>
          <Link to="/cart" className="relative text-base text-[#1A1A1A] hover:opacity-50 transition">
            <i className="fas fa-shopping-bag" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2.5 w-4 h-4 bg-[#1A1A1A] text-white text-[0.4rem] font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <section className="max-w-[1440px] mx-auto px-6 md:px-10 pt-6 md:pt-10 pb-0">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="w-full lg:w-[60%]">
            <div className="relative bg-[#F5F5F3] rounded-[4px] overflow-hidden mb-4">
              {effectiveItems.length > 1 && (
                <>
                  <button onClick={handlePrevImage} className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white text-[#1A1A1A] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:block hidden lg:flex">
                    <i className="fas fa-chevron-left text-xs" />
                  </button>
                  <button onClick={handleNextImage} className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center bg-white/80 hover:bg-white text-[#1A1A1A] rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-hover:block hidden lg:flex">
                    <i className="fas fa-chevron-right text-xs" />
                  </button>
                </>
              )}
              <div
                className="gallery-zoom-container group aspect-square lg:aspect-auto lg:h-[600px]"
                onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  const dx = e.changedTouches[0].clientX - touchStartX.current;
                  if (Math.abs(dx) > 50) {
                    if (dx < 0 && selectedGalleryIdx < effectiveItems.length - 1) setSelectedGalleryIdx(selectedGalleryIdx + 1);
                    if (dx > 0 && selectedGalleryIdx > 0) setSelectedGalleryIdx(selectedGalleryIdx - 1);
                  }
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedGalleryIdx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                  >
                    {currentItem?.mediaType === "video" ? (
                      <video src={currentItem.fileUrl} muted playsInline loop controls className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src={currentItem?.imageUrl || currentItem?.fileUrl || "/images/necklace-1.jpeg"}
                        alt={currentItem?.altText || product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              {discount > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-[#1A1A1A] text-white text-[0.55rem] font-semibold px-3 py-1.5 tracking-wide">
                  -{discount}%
                </span>
              )}
            </div>

            {effectiveItems.length > 1 && (
              <div ref={galleryRef} className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {effectiveItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGalleryIdx(idx)}
                    className={`flex-shrink-0 w-[72px] h-[72px] rounded-[4px] overflow-hidden border-2 transition-all ${
                      idx === selectedGalleryIdx ? "gallery-thumb-active border-[#1A1A1A]" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    {item.mediaType === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
                        <i className="fas fa-play text-white/70 text-sm" />
                      </div>
                    ) : (
                      <img
                        src={item.imageUrl || item.fileUrl}
                        alt={item.altText || `View ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-[40%] lg:sticky lg:top-28 lg:self-start lg:pb-16">
            <div className="max-w-[420px]">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[0.5rem] font-sans font-medium tracking-[0.15em] uppercase text-[#B8B4AD]">{product.category || "Fine Jewelry"}</span>
                <span className="text-[#D4D0C8]">|</span>
                <div className="flex items-center gap-1">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <i key={s} className="fas fa-star text-[#B8944E] text-[0.45rem]" />
                    ))}
                  </div>
                  <span className="text-[0.5rem] text-[#8B8B8B] font-medium ml-1">4.8/5</span>
                </div>
              </div>

              {product.status && product.status !== 'AVAILABLE' && (
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[0.55rem] font-semibold uppercase tracking-wider mb-4 ${
                  product.status === 'OUT_OF_STOCK' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    product.status === 'OUT_OF_STOCK' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                  {product.status === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Currently Unavailable'}
                  {product.expectedRestockDate && (
                    <span className="ml-1 font-normal normal-case">· Restock: {new Date(product.expectedRestockDate).toLocaleDateString()}</span>
                  )}
                </div>
              )}

              <h1 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-semibold text-[#1A1A1A] leading-[1.08] tracking-tight mb-5">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-[#E8E6E1]">
                <span className="font-sans text-[clamp(1.6rem,3vw,2.4rem)] font-semibold text-[#1A1A1A] leading-none">
                  ₹{Number(product.price).toLocaleString()}
                </span>
                {Number(product.originalPrice) > Number(product.price) && (
                  <>
                    <span className="text-sm text-[#B8B4AD] line-through leading-none">
                      ₹{Number(product.originalPrice).toLocaleString()}
                    </span>
                    {discount > 0 && (
                      <span className="text-[0.55rem] font-sans font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-sm leading-none">
                        Save {discount}%
                      </span>
                    )}
                  </>
                )}
              </div>

              <p className="text-[0.82rem] text-[#4A4A4A] font-light leading-[1.9] mb-7">{product.shortDescription}</p>

              <div className="flex items-center gap-4 mb-7 pb-7 border-b border-[#E8E6E1]">
                <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((n) => (
                      <div key={n} className="w-7 h-7 rounded-full border-2 border-white overflow-hidden">
                        <img src={`https://i.pravatar.cc/40?img=${n}`} alt="Happy customer" className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                </div>
                <div className="text-[0.6rem] text-[#6B6B6B] font-light">
                  <span className="text-[#1A1A1A] font-medium">1,000+</span> happy customers
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[#B8944E] text-[0.4rem]">⭐⭐⭐⭐⭐</span>
                    <span className="text-[0.45rem] text-[#8B8B8B]">4.8/5 (Verified)</span>
                  </div>
                </div>
              </div>

              {product.status && product.status !== 'AVAILABLE' ? (
                <div className="bg-amber-50/50 border border-amber-200/50 rounded-lg p-4 mb-6 text-center">
                  <p className="text-xs text-amber-800 font-medium">
                    <i className="fas fa-info-circle mr-1" />
                    This product is currently unavailable. Please check back later.
                  </p>
                  {product.expectedRestockDate && (
                    <p className="text-[0.65rem] text-amber-600 mt-1">
                      Expected restock: {new Date(product.expectedRestockDate).toLocaleDateString()}
                    </p>
                  )}
                  {product.unavailableReason && (
                    <p className="text-[0.65rem] text-amber-600 mt-0.5">{product.unavailableReason}</p>
                  )}
                </div>
              ) : (
                <>
              <div className="flex items-center gap-5 mb-6">
                <span className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD]">Qty</span>
                <div className="flex items-center border border-[#D4D0C8] rounded-[4px]">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center text-sm text-[#1A1A1A] hover:bg-[#F0EFEC] transition">−</button>
                  <span className="w-11 text-center text-[0.85rem] text-[#1A1A1A] border-x border-[#D4D0C8] h-10 flex items-center justify-center font-medium">{qty}</span>
                  <button onClick={() => setQty(Math.min(product.stockQuantity || 10, qty + 1))} className="w-10 h-10 flex items-center justify-center text-sm text-[#1A1A1A] hover:bg-[#F0EFEC] transition">+</button>
                </div>
                {product.stockQuantity !== null && product.stockQuantity < 20 && (
                  <span className="text-[0.55rem] text-red-600 font-medium">Only {product.stockQuantity} left</span>
                )}
              </div>

              <div className="flex flex-col gap-2.5 mb-6">
                <button
                  onClick={handleBuyNow}
                  className="w-full bg-[#1A1A1A] text-white text-sm font-sans font-semibold py-4 px-8 hover:bg-[#333] transition text-center tracking-wide"
                >
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white text-[#1A1A1A] text-sm font-sans font-medium py-4 px-8 border border-[#1A1A1A] hover:bg-[#F5F5F3] transition text-center tracking-wide"
                >
                  {addedToCart ? (
                    <><i className="fas fa-check mr-1.5" /> Added to Cart</>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              </div>
                </>
              )}

              <div className="bg-[#F5F5F3] p-4 mb-8">
                <div className="grid grid-cols-5 gap-2">
                  {TRUST_INDICATORS.map((item) => (
                    <div key={item.label} className="text-center">
                      <i className={`fas ${item.icon} text-[#1A1A1A] text-xs mb-2 block`} />
                      <p className="text-[0.4rem] font-sans text-[#6B6B6B] uppercase tracking-[0.1em] font-medium leading-relaxed">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#E8E6E1] mb-8">
                {accordionSections.map((section) => (
                  <div key={section.id} className="border-b border-[#E8E6E1]">
                    <button
                      onClick={() => setOpenAccordion(openAccordion === section.id ? null : section.id)}
                      className="w-full flex items-center justify-between py-4 text-left group"
                    >
                      <span className="text-[0.55rem] font-sans font-medium uppercase tracking-[0.15em] text-[#1A1A1A] group-hover:text-[#4A4A4A] transition">{section.label}</span>
                      <i className={`fas fa-plus text-[#C8C4BC] text-[0.45rem] transition-transform duration-300 ${openAccordion === section.id ? "rotate-45" : ""}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {openAccordion === section.id && (
                        <motion.div
                          key={section.id}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="text-[0.7rem] text-[#6B6B6B] font-light leading-[1.9] pb-5">{section.content}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="text-center mb-14">
          <div className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD] mb-4">Why You'll Love It</div>
          <h2 className="font-serif text-[clamp(1.4rem,3.5vw,2.2rem)] font-medium text-[#1A1A1A] tracking-tight">Crafted for the Discerning</h2>
          <p className="text-[0.75rem] text-[#6B6B6B] font-light max-w-[460px] mx-auto mt-3 leading-relaxed">Every detail thoughtfully designed to bring you elegance that lasts.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-[960px] mx-auto">
          {STORY_BENEFITS.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#F5F5F3] flex items-center justify-center text-[#1A1A1A] text-base mx-auto mb-4">
                <i className={`fas ${benefit.icon}`} />
              </div>
              <h3 className="font-sans text-sm font-semibold text-[#1A1A1A] mb-2">{benefit.title}</h3>
              <p className="text-[0.65rem] text-[#6B6B6B] font-light leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-24 md:py-32 border-t border-[#E8E6E1]/50 bg-[#FAFAFA]">
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-14">
            <div className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD] mb-4">Product Details</div>
            <h2 className="font-serif text-[clamp(1.4rem,3.5vw,2.2rem)] font-medium text-[#1A1A1A] tracking-tight">Materials & Specifications</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#1A1A1A] mb-3">Materials</h3>
              <ul className="space-y-2 text-[0.75rem] text-[#6B6B6B] font-light leading-relaxed">
                <li><i className="fas fa-check text-emerald-600 mr-2" /> 18k gold-plated on sterling silver</li>
                <li><i className="fas fa-check text-emerald-600 mr-2" /> Premium crystal pendant with brilliant cut</li>
                <li><i className="fas fa-check text-emerald-600 mr-2" /> Hypoallergenic and nickel-free</li>
                <li><i className="fas fa-check text-emerald-600 mr-2" /> Tarnish-resistant coating for lasting shine</li>
                <li><i className="fas fa-check text-emerald-600 mr-2" /> Secure lobster clasp closure</li>
              </ul>
            </div>
            <div>
              <h3 className="font-sans text-sm font-semibold text-[#1A1A1A] mb-3">Specifications</h3>
              <ul className="space-y-2 text-[0.75rem] text-[#6B6B6B] font-light leading-relaxed">
                <li><i className="fas fa-ruler text-emerald-600 mr-2" /> Chain length: 18 inches (adjustable)</li>
                <li><i className="fas fa-gem text-emerald-600 mr-2" /> Pendant: 14mm x 12mm</li>
                <li><i className="fas fa-weight-hanging text-emerald-600 mr-2" /> Weight: ~8 grams (lightweight design)</li>
                <li><i className="fas fa-box text-emerald-600 mr-2" /> Packaging: Premium velvet gift box</li>
                <li><i className="fas fa-calendar-alt text-emerald-600 mr-2" /> Ideal for: Daily wear, parties, office, weddings</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="text-center mb-14">
          <div className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD] mb-4">Perfect For</div>
          <h2 className="font-serif text-[clamp(1.4rem,3.5vw,2.2rem)] font-medium text-[#1A1A1A] tracking-tight">Every Occasion</h2>
          <p className="text-[0.75rem] text-[#6B6B6B] font-light max-w-[460px] mx-auto mt-3 leading-relaxed">From office meetings to weddings, this piece complements every look.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-[800px] mx-auto">
          {[
            { icon: "fa-briefcase", label: "Office Wear" },
            { icon: "fa-ring", label: "Weddings" },
            { icon: "fa-glass-cheers", label: "Parties" },
            { icon: "fa-heart", label: "Date Night" },
            { icon: "fa-university", label: "College" },
            { icon: "fa-home", label: "Daily Wear" },
            { icon: "fa-gift", label: "Gifting" },
            { icon: "fa-calendar-day", label: "Festivals" },
          ].map((occ) => (
            <div key={occ.label} className="group bg-white rounded-[16px] p-5 sm:p-6 text-center border border-[#E8E6E1] hover:border-gold-soft/40 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#F5F5F3] group-hover:bg-emerald-deep/5 flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300">
                <i className={`fas ${occ.icon} text-[#1A1A1A] group-hover:text-emerald-deep text-lg sm:text-xl transition-colors duration-300`} />
              </div>
              <span className="text-[0.65rem] sm:text-[0.7rem] text-[#4A4A4A] font-medium tracking-wide">{occ.label}</span>
            </div>
          ))}
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-24 md:py-32 border-t border-[#E8E6E1]/50">
          <div className="text-center mb-12">
            <div className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD] mb-4">Complete the Look</div>
            <h2 className="font-serif text-[clamp(1.2rem,2.5vw,1.8rem)] font-medium text-[#1A1A1A] tracking-tight">You May Also Love</h2>
            <p className="text-[0.65rem] text-[#6B6B6B] font-light mt-2">Explore more handcrafted jewelry pieces from our collection.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {related.slice(0, 4).map((r) => {
              const img = r.images?.[0];
              const relDiscount = Math.round((1 - Number(r.price) / Number(r.originalPrice)) * 100);
              return (
                <Link key={r.id} to={`/products/${r.slug}`} className="group">
                  <div className="aspect-square overflow-hidden bg-[#F5F5F3] mb-4 relative">
                    <img
                      src={img?.imageUrl || "/images/necklace-1.jpeg"}
                      alt={r.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {relDiscount > 0 && (
                      <span className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[0.45rem] font-semibold px-2 py-1">{relDiscount}% OFF</span>
                    )}
                  </div>
                  <h3 className="text-[0.7rem] font-medium text-[#1A1A1A] truncate">{r.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[0.82rem] font-sans font-medium text-[#1A1A1A]">₹{Number(r.price).toLocaleString()}</span>
                    {relDiscount > 0 && (
                      <span className="text-[0.55rem] text-[#B8B4AD] line-through">₹{Number(r.originalPrice).toLocaleString()}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-24 md:py-32 border-t border-[#E8E6E1]/50 bg-[#F5F5F3]">
        <div className="max-w-[640px] mx-auto text-center">
          <div className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD] mb-4">Verified Reviews</div>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className="fas fa-star text-[#B8944E] text-sm" />
              ))}
            </div>
            <span className="text-[0.75rem] text-[#1A1A1A] font-medium">4.8/5</span>
            <span className="text-[0.6rem] text-[#8B8B8B]">(1,000+ reviews)</span>
          </div>
          <div className="relative min-h-[160px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={reviewIdx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-serif text-[clamp(1rem,2.5vw,1.4rem)] text-[#1A1A1A] leading-[1.7] italic mb-6">
                  &ldquo;{REVIEWS[reviewIdx].quote}&rdquo;
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i key={star} className="fas fa-star text-[#B8944E] text-[0.5rem]" />
                    ))}
                  </div>
                  <span className="text-[0.65rem] text-[#8B8B8B] font-medium">— {REVIEWS[reviewIdx].name}</span>
                  <span className="text-[0.45rem] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm font-medium">Verified</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-2 mt-8">
            {REVIEWS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setReviewIdx(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === reviewIdx ? "bg-[#1A1A1A] w-5" : "bg-[#D4D0C8] hover:bg-[#B8B4AD]"}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 md:px-10 py-24 md:py-32">
        <div className="max-w-[640px] mx-auto">
          <div className="text-center mb-12">
            <div className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD] mb-4">FAQ</div>
            <h2 className="font-serif text-[clamp(1.2rem,2.5vw,1.8rem)] font-medium text-[#1A1A1A] tracking-tight">Frequently Asked Questions</h2>
          </div>
          {PRODUCT_FAQS.map((faq, i) => (
            <div key={i} className="border-b border-[#E8E6E1]">
              <button
                onClick={() => setOpenAccordion(openAccordion === `faq-${i}` ? null : `faq-${i}`)}
                className="w-full flex justify-between items-center py-4 text-left"
              >
                <span className="text-[0.75rem] text-[#1A1A1A] font-medium">{faq.q}</span>
                <i className={`fas fa-chevron-down text-[#C8C4BC] text-[0.5rem] transition-transform ${openAccordion === `faq-${i}` ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {openAccordion === `faq-${i}` && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="text-[0.7rem] text-[#6B6B6B] font-light leading-[1.9] pb-5">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#F5F5F3] py-16 md:py-14">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row">
          <div className="relative w-full md:w-1/2 h-[280px] md:h-[420px] overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/necklace-4.jpeg')" }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
          <div className="w-full md:w-1/2 flex items-center px-8 md:px-16">
            <div className="max-w-[380px]">
              <span className="text-[0.45rem] font-sans font-medium uppercase tracking-[0.2em] text-[#B8B4AD] mb-4 block">Stay Inspired</span>
              <h3 className="font-serif text-[clamp(1.3rem,2.8vw,1.8rem)] font-medium text-[#1A1A1A] mb-3 leading-snug">Be the First to Know</h3>
              <p className="text-[0.72rem] text-[#8B8B8B] font-light leading-relaxed mb-7">New collections, exclusive offers, and early access to limited drops — delivered to your inbox.</p>
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-0">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-white border border-[#D4D0C8] px-5 py-3.5 text-[0.7rem] text-[#1A1A1A] placeholder:text-[#B8B4AD] outline-none focus:border-[#1A1A1A] transition"
                />
                <button type="submit" className="bg-[#1A1A1A] text-white text-[0.65rem] font-sans font-medium px-7 py-3.5 hover:bg-[#333] transition tracking-wide whitespace-nowrap">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#1A1A1A] text-[#B8B4AD]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
            <div className="col-span-2 md:col-span-1">
              <Logo className="[&_span:last-child]:text-white [&_span:last-child_span]:text-white/60" />
              <p className="text-[0.65rem] font-light leading-relaxed mt-4 max-w-[220px]">Handcrafted jewelry for the discerning. Quality, artistry, and timeless design.</p>
            </div>
            <div>
              <h4 className="text-[0.5rem] font-sans font-medium tracking-[0.15em] uppercase text-white mb-5">Shop</h4>
              <ul className="space-y-3">
                <li><Link to="/products" className="text-[0.65rem] hover:text-white transition">All Products</Link></li>
                <li><Link to="/products" className="text-[0.65rem] hover:text-white transition">New Arrivals</Link></li>
                <li><Link to="/products" className="text-[0.65rem] hover:text-white transition">Best Sellers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.5rem] font-sans font-medium tracking-[0.15em] uppercase text-white mb-5">Customer Service</h4>
              <ul className="space-y-3">
                <li><Link to="/track-order" className="text-[0.65rem] hover:text-white transition">Track Order</Link></li>
                <li><Link to="/shipping-policy" className="text-[0.65rem] hover:text-white transition">Shipping Info</Link></li>
                <li><Link to="/return-policy" className="text-[0.65rem] hover:text-white transition">Returns & Exchanges</Link></li>
                <li><Link to="/contact" className="text-[0.65rem] hover:text-white transition">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[0.5rem] font-sans font-medium tracking-[0.15em] uppercase text-white mb-5">Policies</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="text-[0.65rem] hover:text-white transition">About Us</Link></li>
                <li><Link to="/privacy-policy" className="text-[0.65rem] hover:text-white transition">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-[0.65rem] hover:text-white transition">Terms of Service</Link></li>
                <li><Link to="/blog" className="text-[0.65rem] hover:text-white transition">Blog</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 mt-14 pt-8">
            <p className="text-[0.55rem] text-[#8B8B8B]">&copy; 2026 Shop Sasta Mart. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/shopsastamart" target="_blank" rel="noopener noreferrer" className="text-[#B8B4AD] hover:text-white transition text-xs" aria-label="Follow us on Instagram"><i className="fab fa-instagram" /></a>
              <a href="https://pinterest.com/shopsastamart" target="_blank" rel="noopener noreferrer" className="text-[#B8B4AD] hover:text-white transition text-xs" aria-label="Follow us on Pinterest"><i className="fab fa-pinterest" /></a>
              <a href="https://facebook.com/shopsastamart" target="_blank" rel="noopener noreferrer" className="text-[#B8B4AD] hover:text-white transition text-xs" aria-label="Follow us on Facebook"><i className="fab fa-facebook-f" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
