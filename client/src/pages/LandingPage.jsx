import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from 'react-redux'
import { addItem, selectCartItems } from '../store/slices/cartSlice'
import JsonLd from '../components/JsonLd';
import Logo from '../components/Logo';
import { breadcrumbSchema, faqSchema } from '../lib/schema';
import { SITE_URL } from '../lib/seo';

const REVIEWS = [
  { name: "Priya S.", location: "Delhi", text: "Received so many compliments. Looks far more expensive than its price. The packaging was gorgeous too!", img: "https://i.pravatar.cc/80?img=1" },
  { name: "Arjun K.", location: "Mumbai", text: "Bought this as a gift for my girlfriend. She absolutely loved it! The quality is amazing for the price.", img: "https://i.pravatar.cc/80?img=3" },
  { name: "Riya J.", location: "Noida", text: "I wear it to college every day. My friends keep asking where I got it. Lightweight and so elegant!", img: "https://i.pravatar.cc/80?img=5" },
  { name: "Simran N.", location: "Gurgaon", text: "Perfect for office wear. Looks premium without being too flashy. I've recommended it to all my colleagues.", img: "https://i.pravatar.cc/80?img=9" },
  { name: "Rohit V.", location: "Pune", text: "Ordered for our anniversary. My wife hasn't taken it off since! The shine is still perfect after 2 months.", img: "https://i.pravatar.cc/80?img=12" },
  { name: "Ananya L.", location: "Delhi", text: "Was skeptical at first but the moment I unboxed it, I was blown away. Looks like it cost 3x the price.", img: "https://i.pravatar.cc/80?img=20" },
];

const FAQS = [
  { q: "Is Cash On Delivery available?", a: "Yes! We offer COD across India. You pay only when your package arrives. No advance payment needed — completely hassle-free." },
  { q: "How long does delivery take?", a: "Delhi NCR: 1-3 days. Metro cities: 2-5 days. Other cities: 4-7 days. All orders are shipped with tracking." },
  { q: "Can I track my order?", a: "Absolutely! Use your phone number on our Track Order page to see real-time updates on your shipment status." },
  { q: "Can I cancel before shipment?", a: "Yes, orders in Pending or Confirmed status can be cancelled easily. Contact us on WhatsApp and we'll process it immediately." },
  { q: "Will the necklace tarnish over time?", a: "Each piece has a premium tarnish-resistant coating. With basic care, it stays brilliant and shiny for years." },
  { q: "Can I gift this to someone?", a: "Absolutely! Every order comes in a premium velvet gift box with an elegant outer sleeve — ready to gift directly." },
  { q: "What comes in the box?", a: "You'll receive: Premium Crystal Necklace, Luxury Gift Box, Jewelry Care Card, and a personalized Thank You card." },
  { q: "Can I return if I don't like it?", a: "Yes! We offer easy returns within 7 days of delivery. Contact our support team and we'll guide you through the process." },
];

const FALLBACK_HERO_IMAGES = [
  { id: "fb-1", fileUrl: "/images/necklace-1.jpeg", altText: "Premium Crystal Necklace Front View", mediaType: "image", isPrimary: false },
  { id: "fb-2", fileUrl: "/images/necklace-2.jpeg", altText: "Necklace Detail Close-up", mediaType: "image", isPrimary: true },
  { id: "fb-3", fileUrl: "/images/necklace-3.jpeg", altText: "Elegant Necklace on Model", mediaType: "image", isPrimary: false },
  { id: "fb-4", fileUrl: "/images/necklace-4.jpeg", altText: "Luxury Jewelry Display", mediaType: "image", isPrimary: false },
  { id: "fb-5", fileUrl: "/images/necklace-5.jpeg", altText: "Crystal Necklace Side View", mediaType: "image", isPrimary: false },
  { id: "fb-6", fileUrl: "/images/necklace-6.jpeg", altText: "Necklace Elegant Angle", mediaType: "image", isPrimary: false },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [viewerCount, setViewerCount] = useState(18);
  const [activeFaq, setActiveFaq] = useState(null);
  const [sticky, setSticky] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderIdx, setOrderIdx] = useState(0);
  const [offerEnd, setOfferEnd] = useState(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [offerTitle, setOfferTitle] = useState("Limited Time Offer");
  const exitDismissed = useRef(false);
  const [whatsAppNumber, setWhatsAppNumber] = useState("919999999999");
  const [stockCount, setStockCount] = useState(null);
  const [deliveryDelhi, setDeliveryDelhi] = useState("1-3 Days");
  const [deliveryMetro, setDeliveryMetro] = useState("2-5 Days");
  const [deliveryOther, setDeliveryOther] = useState("4-7 Days");
  const [announcement, setAnnouncement] = useState("");
  const [hero, setHero] = useState(null);
  const [heroMedia, setHeroMedia] = useState([]);
  const [heroGalleryItems, setHeroGalleryItems] = useState([]);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [heroLoading, setHeroLoading] = useState(true);
  const [touchStartX, setTouchStartX] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const autoplayRef = useRef(null);
  const [testimonialMedia, setTestimonialMedia] = useState([]);
  const [mediaSectionImages, setMediaSectionImages] = useState({});
  const [whyLoveFeatures, setWhyLoveFeatures] = useState([]);
  const [trustFeatures, setTrustFeatures] = useState([]);
  const thumbRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scrollThumbnails = (dir) => {
    const el = thumbRef.current;
    if (!el) return;
    const scrollAmount = 200;
    el.scrollBy({ left: dir === "left" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  const updateScrollButtons = () => {
    const el = thumbRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };
  const [reassuranceFeatures, setReassuranceFeatures] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [detailImages, setDetailImages] = useState([]);
  const [includedItems, setIncludedItems] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [ctaConfig, setCtaConfig] = useState({});
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const videoRef = useRef(null);
  const lightboxVideoRef = useRef(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoMuted, setVideoMuted] = useState(true);
  const [lightboxMuted, setLightboxMuted] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(Math.max(4, 18 + Math.floor(Math.random() * 9) - 4));
    }, 4500);
    const handleScroll = () => setSticky(window.scrollY > window.innerHeight * 0.7);
    window.addEventListener("scroll", handleScroll, { passive: true });
    const handleExit = (e) => { if (!exitDismissed.current && e.clientY <= 0) setShowExit(true); };
    document.addEventListener("mouseleave", handleExit);
    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handleExit);
    };
  }, []);

  useEffect(() => {
    fetch("/api/recent-orders").then((r) => r.json()).then((d) => {
      if (d.success) setRecentOrders(d.items);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!showLightbox) return;
    const handler = (e) => {
      if (e.key === "ArrowLeft" && selectedMediaIdx > 0) setSelectedMediaIdx(selectedMediaIdx - 1);
      if (e.key === "ArrowRight" && selectedMediaIdx < heroGalleryItems.length - 1) setSelectedMediaIdx(selectedMediaIdx + 1);
      if (e.key === "Escape") setShowLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showLightbox, selectedMediaIdx, heroGalleryItems.length]);

  useEffect(() => {
    if (!autoplay || heroGalleryItems.length <= 1) return;
    autoplayRef.current = setInterval(() => {
      setSelectedMediaIdx((prev) => (prev + 1) % heroGalleryItems.length);
    }, 4000);
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [autoplay, heroGalleryItems.length]);

  useEffect(() => {
    if (recentOrders.length === 0) return;
    const tick = setInterval(() => {
      setOrderIdx((prev) => (prev + 1) % recentOrders.length);
    }, 4000);
    return () => clearInterval(tick);
  }, [recentOrders.length]);

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => {
      if (d.success) {
        if (d.settings.offerEndDate) setOfferEnd(d.settings.offerEndDate);
        if (d.settings.offerTitle) setOfferTitle(d.settings.offerTitle);
        if (d.settings.whatsappNumber) setWhatsAppNumber(d.settings.whatsappNumber);
        if (d.settings.stockCount) setStockCount(d.settings.stockCount);
        if (d.settings.deliveryDelhi) setDeliveryDelhi(d.settings.deliveryDelhi);
        if (d.settings.deliveryMetro) setDeliveryMetro(d.settings.deliveryMetro);
        if (d.settings.deliveryOther) setDeliveryOther(d.settings.deliveryOther);
        if (d.settings.announcement) setAnnouncement(d.settings.announcement);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/content/hero").then((r) => r.json()),
      fetch("/api/content/features").then((r) => r.json()),
      fetch("/api/content/gallery").then((r) => r.json()),
      fetch("/api/content/benefits").then((r) => r.json()),
      fetch("/api/content/cta").then((r) => r.json()),
    ]).then(([heroData, featData, galData, benData, ctaData]) => {
      if (heroData.success && heroData.hero) setHero(heroData.hero);
      if (featData.success) {
        const all = featData.features || [];
        setWhyLoveFeatures(all.filter((f) => f.section === "why_love"));
        setTrustFeatures(all.filter((f) => f.section === "trust_banner"));
        setReassuranceFeatures(all.filter((f) => f.section === "reassurance"));
      }
      if (galData.success) {
        const imgs = galData.images || [];
        setGalleryImages(imgs.filter((i) => i.sectionType === "gallery"));
        setDetailImages(imgs.filter((i) => i.sectionType === "product_detail"));
        setIncludedItems(imgs.filter((i) => i.sectionType === "whats_included"));
      }
      if (benData.success) setBenefits(benData.benefits || []);
      if (ctaData.success) setCtaConfig(ctaData.sections || {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const sectionKeys = ["gallery", "product_detail", "whats_included", "benefits", "testimonials", "checkout"];
      
      const featuredRes = await fetch("/api/featured-product").then((r) => r.json()).catch(() => null);
      if (featuredRes?.success && featuredRes?.product) {
        setFeaturedProduct(featuredRes.product);
      }

      const results = await Promise.all([
        ...sectionKeys.map((key) =>
          fetch(`/api/media/section/${key}`).then((r) => r.json()).then((d) => ({ key, data: d }))
        ),
        fetch("/api/hero-media").then((r) => r.json()).then((d) => ({ key: "hero", data: d })),
      ]);

      const map = {};
      for (const { key, data } of results) {
        if (key === "hero") {
          if (featuredRes?.success && featuredRes?.product?.images?.length > 0) {
            const product = featuredRes.product;
            const items = product.images.map((img, idx) => ({
              id: `prod-${img.id}`,
              fileUrl: img.imageUrl,
              altText: img.altText || product.name,
              mediaType: "image",
              isPrimary: img.isPrimary,
            }));
            setHeroGalleryItems(items);
            const primary = items.find((m) => m.isPrimary) || items[0];
            if (primary) setSelectedMediaIdx(items.indexOf(primary));
            setHeroMedia(items);
            map[key] = items;
          } else {
            const items = data.success && data.media.length > 0 ? data.media : FALLBACK_HERO_IMAGES;
            setHeroGalleryItems(items);
            const primary = items.find((m) => m.isPrimary) || items[0];
            if (primary) setSelectedMediaIdx(items.indexOf(primary));
            setHeroMedia(items);
            map[key] = items;
          }
        } else if (data.success && data.media.length > 0) {
          map[key] = data.media;
        }
      }
      setMediaSectionImages(map);
      if (map["testimonials"]) setTestimonialMedia(map["testimonials"]);
      setHeroLoading(false);
    };
    loadData().catch(() => { setHeroGalleryItems(FALLBACK_HERO_IMAGES); setHeroLoading(false); });

    fetch("/api/products?featured=true&limit=8").then((r) => r.json()).then((d) => {
      if (d.success) setFeaturedProducts(d.products);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => updateScrollButtons());
  }, [heroGalleryItems]);

  useEffect(() => {
    if (!offerEnd) return;
    const calc = () => {
      const diff = new Date(offerEnd).getTime() - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [offerEnd]);

  const handleOrderNow = useCallback(() => {
    if (!featuredProduct) {
      navigate("/products");
      return;
    }
    const primaryImage = featuredProduct.images?.find((i) => i.isPrimary) || featuredProduct.images?.[0];
    dispatch(addItem({
      productId: featuredProduct.id,
      slug: featuredProduct.slug,
      name: featuredProduct.name,
      price: Number(featuredProduct.price),
      originalPrice: Number(featuredProduct.originalPrice),
      image: primaryImage?.imageUrl || "",
      quantity: 1,
      maxQuantity: featuredProduct.stockQuantity || 99,
    }));
    navigate(`/checkout?product=${featuredProduct.slug}&qty=1`);
  }, [featuredProduct, dispatch, navigate]);

  const heroPrice = featuredProduct ? Number(featuredProduct.price) : (Number(hero?.price) || 1299);
  const heroDiscountPrice = featuredProduct ? Number(featuredProduct.originalPrice) : (Number(hero?.discountPrice) || 2499);
  const heroTitle = featuredProduct ? featuredProduct.name : (hero?.title || "More Than Jewelry.<br />A Statement of Elegance.");
  const heroSubtitle = featuredProduct ? (featuredProduct.shortDescription || "") : (hero?.subtitle || "");
  const heroBadge = featuredProduct?.category || hero?.badgeText || "Premium Crystal";
  const heroDiscountPercent = Math.round((1 - heroPrice / heroDiscountPrice) * 100);
  const noFeatured = !featuredProduct;

  const activeOrder = recentOrders.length > 0 ? recentOrders[orderIdx] : null;

  const homepageBreadcrumb = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Collection", url: `${SITE_URL}/products` },
  ]);

  const faqData = faqSchema(FAQS);

  return (
    <main>
      <JsonLd data={homepageBreadcrumb} />
      <JsonLd data={faqData} />
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="bg-emerald-deep text-white text-center py-2 px-4 text-[0.72rem] font-medium tracking-wide">
        {announcement ? <span>{announcement}</span> : <><i className="fas fa-truck text-gold-soft mr-1" /> Free Shipping Across India &nbsp;|&nbsp; <i className="fas fa-gift text-gold-soft mr-1" /> Premium Gift Box Included</>}
      </div>

      <motion.header
        className="fixed top-0 left-0 right-0 z-50 bg-ivory/98 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.04)]"
        initial={false}
        animate={{ height: sticky ? 60 : 0, overflow: "hidden" }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      >
        <div className="max-w-[1280px] mx-auto px-5 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-0">
            <span className="hidden sm:inline"><Logo /></span>
            <span className="sm:hidden"><Logo /></span>
            <div className="flex sm:hidden items-baseline gap-1.5 ml-2 pl-2 border-l border-gold-soft/20">
              <span className="font-bold text-emerald-deep text-sm">₹{heroPrice.toLocaleString()}</span>
              <span className="text-[0.55rem] text-muted line-through">₹{heroDiscountPrice.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:flex items-center gap-3">
              <span className="font-bold text-emerald-deep text-sm">₹{heroPrice.toLocaleString()}</span>
              <span className="text-xs text-muted line-through">₹{heroDiscountPrice.toLocaleString()}</span>
              <Link to="/products" data-track="nav-shop-click" className="text-[0.7rem] font-semibold text-heading hover:text-emerald-deep transition">Shop</Link>
            </div>
            <button onClick={handleOrderNow} className="bg-emerald-deep text-white text-[0.65rem] sm:text-[0.75rem] font-bold py-1.5 px-3 sm:py-2 sm:px-5 rounded-[10px] uppercase tracking-wide whitespace-nowrap hover:bg-teal-luxury transition shadow-[0_2px_8px_rgba(11,58,66,0.15)] cursor-pointer">{noFeatured ? "Shop Now" : "Order Now"}</button>
          </div>
        </div>
      </motion.header>

      <section id="hero-section" className="min-h-screen flex flex-col bg-ivory relative">
        <div className="flex justify-between items-center px-5 pt-4 relative z-10 max-w-[1280px] mx-auto w-full">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/products" data-track="nav-shop-click"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-deep/5 hover:bg-emerald-deep/10 text-emerald-deep rounded-full text-[0.65rem] font-semibold transition">
                <i className="fas fa-store text-[0.5rem]" /> Shop
              </Link>
              <Link to="/track-order"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-body/5 hover:bg-body/10 text-body rounded-full text-[0.65rem] font-medium transition">
                <i className="fas fa-search text-[0.45rem]" /> Track Order
              </Link>
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-gold-soft/20">
              <span className="text-gold-soft tracking-wider text-sm">⭐⭐⭐⭐⭐</span>
              <span className="text-xs text-muted">4.8/5 <span className="font-normal">(1k+)</span></span>
            </div>
            <Link to="/cart" className="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-deep/5 hover:bg-emerald-deep/10 text-heading hover:text-emerald-deep transition">
              <i className="fas fa-shopping-bag text-sm" />
            </Link>
          </div>
        </div>
        <div className="flex sm:hidden items-center justify-between px-5 pt-3">
          <div className="flex items-center gap-3">
            <Link to="/products" className="text-[0.75rem] font-semibold text-heading">Shop</Link>
            <Link to="/track-order" className="text-[0.75rem] text-muted font-medium flex items-center gap-1"><i className="fas fa-search text-[0.5rem]" /> Track</Link>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gold-soft tracking-wider text-[0.55rem]">⭐⭐⭐⭐⭐</span>
            <span className="text-[0.6rem] text-muted font-medium">4.8/5</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center lg:px-10 gap-8 lg:gap-12 max-w-[1280px] mx-auto w-full px-5 py-6 lg:pt-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="w-full lg:w-[68%] max-w-[680px] lg:max-w-none flex-shrink-0"
          >
            {heroLoading && (
              <div className="relative rounded-[16px] overflow-hidden bg-champagne h-[420px] md:h-[520px] lg:h-[600px] animate-pulse">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skeleton-shimmer" />
              </div>
            )}

            <div className={`relative rounded-[16px] overflow-hidden bg-champagne h-[420px] md:h-[520px] lg:h-[600px] group ${heroLoading ? 'hidden' : ''}`}
              onMouseEnter={() => setAutoplay(false)}
              onMouseLeave={() => setAutoplay(true)}
            >
              <div className="absolute top-3 left-3 z-20 bg-emerald-deep text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-full shadow-lg">
                <i className="fas fa-gem mr-1" /> {heroBadge}
              </div>
              <div className="absolute top-3 right-3 z-20 bg-emerald-deep text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-full shadow-lg">
                {heroDiscountPercent}% OFF
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMediaIdx}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="w-full h-full"
                >
              {heroGalleryItems[selectedMediaIdx]?.mediaType === "video" ? (
                <div className="relative w-full h-full bg-black/5">
                  <video
                    ref={videoRef}
                    src={heroGalleryItems[selectedMediaIdx].fileUrl}
                    autoPlay muted playsInline loop
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setShowLightbox(true)}
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    onVolumeChange={() => setVideoMuted(videoRef.current?.muted ?? true)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

                  {!videoPlaying && (
                    <button
                      onClick={(e) => { e.stopPropagation(); videoRef.current?.play(); }}
                      className="absolute inset-0 flex items-center justify-center bg-black/20 z-10"
                    >
                      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform hover:scale-110">
                        <i className="fas fa-play text-heading text-2xl lg:text-3xl ml-1" />
                      </div>
                    </button>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); if (videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setVideoMuted(videoRef.current.muted); } }}
                    className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition"
                  >
                    <i className={`fas ${videoMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-heading text-xs`} />
                  </button>

                  <div className="absolute bottom-4 left-4 z-20 text-white/60 text-[0.55rem] uppercase tracking-widest flex items-center gap-1.5">
                    <i className="fas fa-expand" /> Click to expand
                  </div>
                </div>
              ) : (
                <div
                  className="group relative w-full h-full overflow-hidden"
                  onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
                  onTouchEnd={(e) => {
                    const dx = e.changedTouches[0].clientX - touchStartX;
                    if (Math.abs(dx) > 50) {
                      if (dx < 0 && selectedMediaIdx < heroGalleryItems.length - 1) setSelectedMediaIdx(selectedMediaIdx + 1);
                      if (dx > 0 && selectedMediaIdx > 0) setSelectedMediaIdx(selectedMediaIdx - 1);
                    }
                  }}
                >
                  <motion.div
                    key={`ken-${selectedMediaIdx}`}
                    className="w-full h-full"
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 8, ease: "easeOut" }}
                  >
                    <img
                      src={heroGalleryItems[selectedMediaIdx]?.fileUrl || heroMedia[0]?.fileUrl || "/images/necklace-1.jpeg"}
                      alt={heroGalleryItems[selectedMediaIdx]?.altText || "Premium Crystal Necklace"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.35] cursor-crosshair"
                      onClick={() => setShowLightbox(true)}
                    />
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/5">
                    <div className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
                      <i className="fas fa-search-plus text-heading text-lg" />
                    </div>
                  </div>
                </div>
              )}
                </motion.div>
              </AnimatePresence>

              {heroGalleryItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedMediaIdx((selectedMediaIdx - 1 + heroGalleryItems.length) % heroGalleryItems.length); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center bg-white/70 hover:bg-white text-heading rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <i className="fas fa-chevron-left text-sm" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedMediaIdx((selectedMediaIdx + 1) % heroGalleryItems.length); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center bg-white/70 hover:bg-white text-heading rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                  >
                    <i className="fas fa-chevron-right text-sm" />
                  </button>
                </>
              )}

              {heroGalleryItems.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {heroGalleryItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setSelectedMediaIdx(idx); }}
                      className={`w-2 h-2 rounded-full transition-all ${idx === selectedMediaIdx ? "bg-white w-5 shadow-lg" : "bg-white/50 hover:bg-white/80"}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {heroGalleryItems.length > 1 && (
              <div className="relative mt-3 group/thumb">
                <button
                  onClick={() => scrollThumbnails("left")}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm text-[#1A1A1A] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${canScrollLeft ? "pointer-events-auto" : "pointer-events-none opacity-0"}`}
                >
                  <i className="fas fa-chevron-left text-[0.5rem] lg:text-[0.6rem]" />
                </button>
                <div
                  ref={thumbRef}
                  onScroll={updateScrollButtons}
                  className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory touch-pan-x hide-scrollbar scroll-smooth"
                >
                  {heroGalleryItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedMediaIdx(idx)}
                      className={`flex-shrink-0 w-[68px] h-[68px] lg:w-20 lg:h-20 rounded-[12px] overflow-hidden border-2 transition-all snap-start ${
                        idx === selectedMediaIdx ? "border-emerald-deep shadow-[0_3px_12px_rgba(11,58,66,0.2)]" : "border-gold-soft/20 opacity-60 hover:opacity-100 hover:border-gold-soft/50"
                      }`}
                    >
                      {item.mediaType === "video" ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 relative">
                          <i className="fas fa-play text-white/80 text-lg drop-shadow-lg" />
                          <span className="absolute bottom-0.5 right-1 text-[0.35rem] bg-white/20 text-white/70 px-1 rounded font-mono">HD</span>
                        </div>
                      ) : (
                        <img src={item.fileUrl} alt={item.altText || "Premium jewelry thumbnail"} className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => scrollThumbnails("right")}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 lg:w-8 lg:h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm text-[#1A1A1A] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.06)] opacity-0 group-hover/thumb:opacity-100 transition-opacity hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${canScrollRight ? "pointer-events-auto" : "pointer-events-none opacity-0"}`}
                >
                  <i className="fas fa-chevron-right text-[0.5rem] lg:text-[0.6rem]" />
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="w-full lg:w-[32%] max-w-lg lg:max-w-none flex flex-col gap-4 text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start gap-2 text-xs">
              <span className="text-gold-soft tracking-wider">⭐⭐⭐⭐⭐</span>
              <span className="font-semibold text-heading">4.8/5</span>
              <span className="text-muted">(1,000+ verified reviews)</span>
            </div>

            <div>
              <p className="text-[0.65rem] font-semibold tracking-[3px] uppercase text-emerald-deep mb-1">{featuredProduct?.name || "Premium Crystal Necklace"}</p>
              <h1 className="font-serif text-[clamp(1.4rem,4.5vw,2.4rem)] leading-tight text-heading" dangerouslySetInnerHTML={{ __html: heroTitle }} />
            </div>

            <p className="text-sm text-body font-light leading-relaxed">{heroSubtitle || "Designed to turn heads. Made to be remembered. Premium fashion jewelry that looks like a fortune."}</p>

            <div className="bg-champagne rounded-[16px] p-5 -mx-1">
              <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                <span className="font-serif text-[clamp(2rem,5vw,2.8rem)] font-bold text-heading leading-none">₹{heroPrice.toLocaleString()}</span>
                <span className="text-sm text-muted line-through">₹{heroDiscountPrice.toLocaleString()}</span>
                <span className="inline-block bg-red-600/10 text-red-600 text-[0.6rem] font-bold px-2.5 py-0.5 rounded-full border border-red-600/20">Save ₹{(heroDiscountPrice - heroPrice).toLocaleString()}</span>
              </div>
              {stockCount && Number(stockCount) < 50 && (
                <p className="text-[0.7rem] text-red-600 font-semibold mt-2 flex items-center justify-center lg:justify-start gap-1">
                  <i className="fas fa-clock animate-pulse" /> Only {stockCount} left in stock
                </p>
              )}
            </div>

            {offerEnd && countdown.days + countdown.hours + countdown.minutes + countdown.seconds > 0 && (
              <div className="bg-amber-50 rounded-[10px] px-4 py-2.5 flex items-center justify-center lg:justify-start gap-3 text-xs border border-amber-200/50">
                <span className="font-semibold text-amber-800">⏳ {offerTitle}:</span>
                <span className="font-mono font-bold text-amber-900 tracking-wider">{String(countdown.days).padStart(2, "0")}d {String(countdown.hours).padStart(2, "0")}h {String(countdown.minutes).padStart(2, "0")}m {String(countdown.seconds).padStart(2, "0")}s</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-[0.65rem] text-body">
              <span className="flex items-center gap-1.5"><i className="fas fa-check-circle text-emerald-deep text-[0.5rem]" /> COD</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-truck text-emerald-deep text-[0.5rem]" /> Free Ship</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-gift text-emerald-deep text-[0.5rem]" /> Gift Box</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-shield-alt text-emerald-deep text-[0.5rem]" /> Secure</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-search-location text-emerald-deep text-[0.5rem]" /> Tracking</span>
              <span className="flex items-center gap-1.5"><i className="fas fa-undo-alt text-emerald-deep text-[0.5rem]" /> 7-Day</span>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              <button onClick={handleOrderNow}
                className="bg-emerald-deep text-white font-bold text-sm py-4 px-8 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(11,58,66,0.25)] hover:bg-teal-luxury hover:shadow-[0_6px_24px_rgba(11,58,66,0.35)] hover:-translate-y-0.5 transition-all text-center cursor-pointer"
              >
                {noFeatured ? "BROWSE COLLECTION" : `${(ctaConfig["hero_primary"]?.buttonText) || "ORDER NOW"} `}<i className="fas fa-arrow-right ml-1" />
              </button>
              {featuredProduct && (
                <Link
                  to="/products"
                  data-track="hero-collection-cta"
                  className="w-full text-center text-xs font-semibold text-heading py-3 px-8 rounded-[14px] border border-gold-soft/30 hover:bg-gold-soft/10 hover:border-gold-soft/50 transition-all"
                >
                  Explore Collection <i className="fas fa-arrow-right ml-1" />
                </Link>
              )}
              <div className="flex gap-2">
                {heroGalleryItems.some((m) => m.mediaType === "video") && (
                  <button
                    onClick={() => {
                      const videoIdx = heroGalleryItems.findIndex((m) => m.mediaType === "video");
                      if (videoIdx >= 0) { setSelectedMediaIdx(videoIdx); document.getElementById("hero-section")?.scrollIntoView({ behavior: "smooth" }); }
                    }}
                    className="flex-1 py-3 border-2 border-gold-soft/30 rounded-[14px] text-xs font-semibold text-heading hover:bg-gold-soft/10 hover:border-gold-soft/50 transition flex items-center justify-center gap-1.5"
                  >
                    <i className="fas fa-play text-emerald-deep" /> Watch Video
                  </button>
                )}
                <a
                  href={`https://wa.me/${whatsAppNumber}?text=Hi!%20I%20want%20to%20order%20the%20${encodeURIComponent(featuredProduct?.name || "Premium Crystal Necklace")}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 border-2 border-[#25d366]/20 rounded-[14px] text-xs font-semibold text-[#25d366] hover:bg-[#25d366]/5 transition flex items-center justify-center gap-1.5"
                >
                  <i className="fab fa-whatsapp" /> WhatsApp
                </a>
              </div>
              <div className="border-t border-[#E8E6E1]/60 pt-5 mt-3 space-y-2">
                <div className="flex items-center gap-2 text-[0.65rem] text-[#6B6B6B]">
                  <span className="relative flex w-2 h-2">
                    <span className="absolute inline-flex w-full h-full bg-emerald-deep rounded-full opacity-75 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 bg-emerald-deep rounded-full" />
                  </span>
                  <span className="font-sans font-light">{viewerCount} people viewing</span>
                </div>
                {activeOrder && (
                  <div className="flex items-center gap-2 text-[0.65rem]">
                    <span className="w-5 h-5 rounded-full bg-[#F0EFEC] border border-white flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={`https://i.pravatar.cc/40?img=${(activeOrder.name.length % 70) + 1}`} alt="" className="w-full h-full object-cover" />
                    </span>
                    <span className="font-sans font-light text-[#6B6B6B]">
                      <span className="text-[#1A1A1A] font-medium">{activeOrder.name}</span> from {activeOrder.city}
                      <span className="text-emerald-deep ml-1">just ordered</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {showLightbox && heroGalleryItems[selectedMediaIdx] && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 select-none" onClick={() => setShowLightbox(false)}>
          <button onClick={() => setShowLightbox(false)} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-full text-2xl z-10 transition">&times;</button>

          {selectedMediaIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedMediaIdx(selectedMediaIdx - 1); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full text-2xl z-10 backdrop-blur-sm transition"
            >
              <i className="fas fa-chevron-left" />
            </button>
          )}
          {selectedMediaIdx < heroGalleryItems.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedMediaIdx(selectedMediaIdx + 1); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full text-2xl z-10 backdrop-blur-sm transition"
            >
              <i className="fas fa-chevron-right" />
            </button>
          )}

          <div className="absolute top-5 left-5 text-white/40 text-xs font-mono z-10">{selectedMediaIdx + 1} / {heroGalleryItems.length}</div>

          {heroGalleryItems[selectedMediaIdx].mediaType === "video" ? (
            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <video
                ref={lightboxVideoRef}
                src={heroGalleryItems[selectedMediaIdx].fileUrl}
                autoPlay muted playsInline loop
                className="max-h-[85vh] max-w-full object-contain rounded-xl"
              />
              <button
                onClick={(e) => { e.stopPropagation(); const v = lightboxVideoRef.current; if (v) { v.muted = !v.muted; setLightboxMuted(v.muted); } }}
                className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition border border-white/20"
              >
                <i className={`fas ${lightboxMuted ? 'fa-volume-mute' : 'fa-volume-up'} text-white text-sm`} />
                </button>
              </div>
            ) : (
            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <img src={heroGalleryItems[selectedMediaIdx].fileUrl} alt={heroGalleryItems[selectedMediaIdx].altText || ""} className="max-h-[85vh] max-w-full object-contain rounded-xl" />
              <div className="flex justify-center gap-2.5 mt-5">
                {heroGalleryItems.map((item, idx) => (
                  <button key={item.id} onClick={() => setSelectedMediaIdx(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${idx === selectedMediaIdx ? "border-emerald-deep shadow-[0_0_20px_rgba(11,58,66,0.4)] scale-110" : "border-white/20 hover:border-white/50"}`}>
                    {item.mediaType === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white text-base"><i className="fas fa-play drop-shadow-lg" /></div>
                    ) : (
                      <img src={item.fileUrl} alt={item.altText || "Premium jewelry view"} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/20 text-[0.55rem] uppercase tracking-widest hidden lg:block">
            <i className="fas fa-arrow-left" /> / <i className="fas fa-arrow-right" /> navigate &middot; Esc to close
          </div>
        </div>
      )}

      <section className="py-14 md:py-20 px-5 bg-ivory">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          <div className="text-center md:text-left">
            <p className="text-[0.5rem] font-sans font-medium tracking-[0.15em] uppercase text-emerald-deep mb-3">Discover More</p>
            <h2 className="font-serif text-[clamp(1.3rem,3vw,1.8rem)] font-medium text-heading leading-tight">Looking For More Designs?</h2>
            <p className="text-sm font-sans font-light text-body mt-2 leading-relaxed">Necklaces &middot; Gift Sets &middot; Elegant Designs</p>
          </div>
          <Link
            to="/products"
            data-track="shop-collection-click"
            className="flex-shrink-0 bg-emerald-deep text-white font-semibold text-sm py-3.5 px-8 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(11,58,66,0.2)] hover:bg-teal-luxury hover:shadow-[0_6px_24px_rgba(11,58,66,0.3)] hover:-translate-y-0.5 transition-all"
          >
            Shop Collection <i className="fas fa-arrow-right ml-1" />
          </Link>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <Section className="bg-white">
          <SectionLabel>Featured Collection</SectionLabel>
          <SectionTitle>Our Bestsellers</SectionTitle>
          <SectionSub>Handpicked favorites that our customers love the most.</SectionSub>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {featuredProducts.map((p, i) => {
              const img = p.images?.[0];
              const disc = Math.round((1 - Number(p.price) / Number(p.originalPrice)) * 100);
              return (
                <Reveal key={p.id} delay={i * 0.06}>
                  <Link to={`/products/${p.slug}`} className="group block bg-white rounded-[16px] overflow-hidden border border-gold-soft/10 hover:shadow-[0_8px_30px_rgba(11,58,66,0.08)] transition-all duration-300 hover:-translate-y-0.5 h-full">
                    <div className="aspect-square overflow-hidden bg-champagne relative">
                      <img src={img?.imageUrl || "/images/necklace-1.jpeg"} alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      {disc > 0 && (
                        <span className="absolute top-3 left-3 bg-red-600/90 text-white text-[0.5rem] font-bold px-2 py-0.5 rounded-full">{disc}% OFF</span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm text-heading mb-1 truncate group-hover:text-emerald-deep transition">{p.name}</h3>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-gold-soft tracking-wider text-xs">⭐⭐⭐⭐⭐</span>
                        <span className="text-[0.55rem] text-muted">(4.8)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-bold text-heading">₹{Number(p.price).toLocaleString()}</span>
                        <span className="text-[0.6rem] text-muted line-through">₹{Number(p.originalPrice).toLocaleString()}</span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/products"
              data-track="bestsellers-collection-cta"
              className="inline-flex items-center gap-2.5 bg-emerald-deep text-white font-semibold text-sm py-3.5 px-8 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(11,58,66,0.2)] hover:bg-teal-luxury hover:shadow-[0_6px_24px_rgba(11,58,66,0.3)] hover:-translate-y-0.5 transition-all"
            >
              Discover More Designs <i className="fas fa-arrow-right text-xs" />
            </Link>
            <p className="text-[0.65rem] font-sans font-light text-body mt-3">Explore our full collection of handcrafted jewelry.</p>
          </div>
        </Section>
      )}

      <Section className="bg-ivory">
        <SectionLabel>Why Women Love It</SectionLabel>
        <SectionTitle>Designed for the Modern Woman</SectionTitle>
        <SectionSub>Every detail thoughtfully crafted to make you feel confident, elegant, and unforgettable.</SectionSub>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {(whyLoveFeatures.length > 0 ? whyLoveFeatures : [
            { icon: "fa-gem", title: "Luxury Look, Smart Price", desc: "Premium aesthetic without the premium tag." },
            { icon: "fa-tshirt", title: "Matches Every Outfit", desc: "From sarees to blazers, completes every look." },
            { icon: "fa-star", title: "Gets Compliments Instantly", desc: 'Be ready for "Where did you get that?"' },
            { icon: "fa-feather-alt", title: "Lightweight & Comfortable", desc: "Zero weight on your neck. So comfortable." },
            { icon: "fa-calendar-day", title: "Perfect for Daily Wear", desc: "Durable enough for everyday elegance." },
            { icon: "fa-heart", title: "Ideal Gift for Loved Ones", desc: "Birthdays, anniversaries — the perfect surprise." },
          ]).map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="bg-white rounded-[16px] p-6 text-center border border-gold-soft/20 hover:shadow-[0_8px_24px_rgba(11,58,66,0.06)] hover:-translate-y-0.5 transition-all h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-deep/10 flex items-center justify-center text-emerald-deep text-lg mb-3 flex-shrink-0">
                  <i className={`fas ${item.icon}`} />
                </div>
                <h3 className="font-sans text-sm font-semibold text-heading mb-1.5">{item.title}</h3>
                <p className="text-xs text-body font-light leading-relaxed">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-champagne">
        <SectionLabel>Premium Craftsmanship</SectionLabel>
        <SectionTitle>Why It Feels So Luxurious</SectionTitle>
        <SectionSub>We don't just make jewelry. We craft elegance that lasts.</SectionSub>
        <div className="grid md:grid-cols-2 gap-6">
          {(mediaSectionImages["benefits"]?.length > 0
            ? mediaSectionImages["benefits"].map((m, i) => ({ imageUrl: m.fileUrl, title: m.altText || `Benefit ${i + 1}`, description: "" }))
            : (benefits.length > 0 ? benefits : [
            { imageUrl: "/images/necklace-7.jpeg", title: "Elegant Craftsmanship", description: "Each piece is meticulously hand-finished by skilled artisans who have spent years perfecting their craft." },
            { imageUrl: "/images/necklace-8.jpeg", title: "Premium Finish That Lasts", description: "Our proprietary tarnish-resistant coating ensures your necklace stays brilliant and shiny, wear after wear." },
            { imageUrl: "/images/necklace-9.jpeg", title: "Luxury Inspired Design", description: "Inspired by high-end fashion trends, designed to complement both traditional and contemporary outfits." },
            { imageUrl: "/images/necklace-10.jpeg", title: "Comfort Meets Elegance", description: "Lightweight construction means you can wear it all day without any discomfort." },
          ])).map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-white rounded-[16px] overflow-hidden border border-gold-soft/20 h-full flex flex-col md:flex-row">
                <div className="md:w-[180px] h-[180px] md:h-auto flex-shrink-0 overflow-hidden">
                  <img src={item.imageUrl || item.img} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="p-5 flex flex-col justify-center">
                  <h3 className="font-serif text-base font-semibold text-heading mb-1.5">{item.title}</h3>
                  <p className="text-xs text-body font-light leading-relaxed">{item.description || item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-ivory">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {(trustFeatures.length > 0 ? trustFeatures : [
            { icon: "fa-rupee-sign", title: "Cash On Delivery Available", desc: "Pay only when you receive. No upfront payment needed." },
            { icon: "fa-shipping-fast", title: "Fast Delivery Across India", desc: "Delivered within 3-7 business days. Tracked shipping." },
            { icon: "fa-lock", title: "Secure Ordering Process", desc: "Your data is encrypted and never shared with third parties." },
            { icon: "fa-gift", title: "Premium Packaging", desc: "Every order comes in a luxury gift box, ready to present." },
            { icon: "fa-headset", title: "Easy Customer Support", desc: "Reach us on WhatsApp or email. We're here to help." },
            { icon: "fa-heart", title: "Trusted by Hundreds", desc: "Join 1,000+ happy customers who love their Shopsastamart necklace." },
          ]).map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-3 p-5 sm:p-4 rounded-[20px] bg-champagne h-full text-center sm:text-left">
                <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-emerald-deep flex items-center justify-center text-white text-base sm:text-sm flex-shrink-0">
                  <i className={`fas ${item.icon}`} />
                </div>
                <div>
                  <h4 className="font-sans text-sm font-semibold text-heading mb-0.5">{item.title}</h4>
                  <p className="text-xs text-body font-light leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-champagne">
        <SectionLabel>See It in Style</SectionLabel>
        <SectionTitle>Look Stunning in Every Setting</SectionTitle>
        <SectionSub>From office meetings to date nights — see how this necklace completes every look.</SectionSub>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(mediaSectionImages["gallery"]?.length > 0
            ? mediaSectionImages["gallery"].map((m, i) => ({ imageUrl: m.fileUrl, caption: m.altText || `View ${i + 1}` }))
            : (galleryImages.length > 0 ? galleryImages : [
            { imageUrl: "/images/necklace-11.jpeg", caption: "Necklace Closeup", spanClass: "md:row-span-2" },
            { imageUrl: "/images/necklace-12.jpeg", caption: "Woman Wearing It" },
            { imageUrl: "/images/necklace-13.jpeg", caption: "Gift Box Packaging" },
            { imageUrl: "/images/necklace-14.jpeg", caption: "Office Look" },
            { imageUrl: "/images/necklace-15.jpeg", caption: "Party Look" },
            { imageUrl: "/images/necklace-16.jpeg", caption: "Date Night" },
            { imageUrl: "/images/necklace-17.jpeg", caption: "Traditional Look" },
            { imageUrl: "/images/necklace-18.jpeg", caption: "Anniversary Gift" },
            { imageUrl: "/images/necklace-19.jpeg", caption: "Customer Selfie" },
            { imageUrl: "/images/necklace-20.jpeg", caption: "Elegant Display" },
          ])).map((img, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className={`relative rounded-[16px] overflow-hidden cursor-pointer group aspect-[3/4] ${img.spanClass || ""}`}>
                <img src={img.imageUrl || img.src} alt={img.caption || img.tag} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-emerald-deep/70 to-transparent">
                  <span className="text-white text-xs font-medium">{img.caption || img.tag}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-ivory">
        <SectionLabel>Up Close</SectionLabel>
        <SectionTitle>Inspect the Quality</SectionTitle>
        <SectionSub>Every detail tells a story of premium craftsmanship and thoughtful design.</SectionSub>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(mediaSectionImages["product_detail"]?.length > 0
            ? mediaSectionImages["product_detail"].map((m, i) => ({ imageUrl: m.fileUrl, caption: m.altText || `Detail ${i + 1}` }))
            : (detailImages.length > 0 ? detailImages : [
            { imageUrl: "/images/necklace-21.jpeg", caption: "Pendant Detail" },
            { imageUrl: "/images/necklace-22.jpeg", caption: "Crystal Detail" },
            { imageUrl: "/images/necklace-23.jpeg", caption: "Chain Detail" },
            { imageUrl: "/images/necklace-24.jpeg", caption: "Clasp Detail" },
            { imageUrl: "/images/necklace-25.jpeg", caption: "Finish Detail" },
          ])).map((img, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="relative rounded-[16px] overflow-hidden aspect-square group">
                <img src={img.imageUrl || img.src} alt={img.caption || img.label} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-emerald-deep/0 group-hover:bg-emerald-deep/30 transition-all flex items-end">
                  <span className="text-white text-[0.65rem] font-medium p-3 opacity-0 group-hover:opacity-100 transition-opacity">{img.caption || img.label}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-champagne">
        <SectionLabel>Your Order Includes</SectionLabel>
        <SectionTitle>Premium Unboxing Experience</SectionTitle>
        <SectionSub>Every order is carefully packed to make you feel special from the moment it arrives.</SectionSub>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(mediaSectionImages["whats_included"]?.length > 0
            ? mediaSectionImages["whats_included"].map((m, i) => ({ imageUrl: m.fileUrl, caption: m.altText || `Item ${i + 1}`, description: "" }))
            : (includedItems.length > 0 ? includedItems : [
            { imageUrl: "/images/necklace-26.jpeg", caption: "Premium Crystal Necklace", description: "The star of the show. Ready to wear." },
            { imageUrl: "/images/necklace-27.jpeg", caption: "Luxury Gift Box", description: "Elegant velvet finish with satin lining." },
            { imageUrl: "/images/necklace-28.jpeg", caption: "Jewelry Care Card", description: "Tips to keep your necklace brilliant forever." },
            { imageUrl: "/images/necklace-29.jpeg", caption: "Thank You Card", description: "A personal note with every order." },
          ])).map((item, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-white rounded-[16px] overflow-hidden border border-gold-soft/20 h-full flex flex-col">
                <div className="aspect-square overflow-hidden">
                  <img src={item.imageUrl || item.src} alt={item.caption || item.title} loading="lazy" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-center text-center">
                  <h4 className="font-serif text-sm font-semibold text-heading mb-1">{item.caption || item.title}</h4>
                  <p className="text-[0.7rem] text-body font-light">{item.description || item.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-ivory">
        <SectionLabel>Delivery Info</SectionLabel>
        <SectionTitle>When Will You Get It?</SectionTitle>
        <SectionSub>We ship across India with real-time tracking on every order.</SectionSub>
        <div className="max-w-[680px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {[
            { city: "Delhi NCR", time: deliveryDelhi, icon: "fa-bolt", desc: "Fastest delivery in the region", accent: "from-emerald-deep to-teal-luxury", badge: "Express" },
            { city: "Metro Cities", time: deliveryMetro, icon: "fa-truck", desc: "Mumbai, Bangalore, Chennai, Kolkata", accent: "from-emerald-deep to-teal-luxury", badge: "Standard" },
            { city: "Other Cities", time: deliveryOther, icon: "fa-map-marked-alt", desc: "Across India with tracking", accent: "from-emerald-deep to-teal-luxury", badge: "Nationwide" },
          ].map((d, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="relative bg-white rounded-[20px] p-5 md:p-6 border border-gold-soft/20 h-full flex flex-row md:flex-col items-center md:text-center gap-4 md:gap-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 md:w-full h-full md:h-1 bg-gradient-to-b md:bg-gradient-to-r ${d.accent} rounded-l-[20px] md:rounded-t-[20px] md:rounded-bl-none`} />
                <div className="relative w-14 h-14 md:w-12 md:h-12 rounded-2xl bg-emerald-deep/5 flex items-center justify-center text-emerald-deep text-xl md:text-lg flex-shrink-0 border border-emerald-deep/10">
                  <i className={`fas ${d.icon}`} />
                </div>
                <div className="flex-1 min-w-0 md:text-center">
                  <div className="flex items-center md:justify-center gap-2 mb-0.5">
                    <span className="text-[0.65rem] font-semibold text-muted uppercase tracking-wider">{d.city}</span>
                    <span className={`text-[0.55rem] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r ${d.accent} text-white`}>{d.badge}</span>
                  </div>
                  <div className="font-serif text-2xl md:text-xl font-bold text-heading tracking-tight">{d.time}</div>
                  <div className="text-[0.65rem] text-body font-light mt-0.5 leading-relaxed">{d.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-body">
          <span><i className="fas fa-check-circle text-emerald-deep mr-1" /> Cash On Delivery Available</span>
          <span><i className="fas fa-search-location text-emerald-deep mr-1" /> Order Tracking Available</span>
          <span><i className="fas fa-headset text-emerald-deep mr-1" /> Customer Support Available</span>
        </div>
      </Section>

      <Section className="bg-champagne">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 bg-ivory px-4 py-1.5 rounded-full text-sm font-semibold text-heading mb-3">
            <i className="fas fa-heart text-emerald-deep" /> Trusted by 1,000+ Happy Customers
          </div>
        </div>
        <SectionLabel>Real Reviews</SectionLabel>
        <SectionTitle>What Our Customers Say</SectionTitle>
        <SectionSub>No fake reviews. Every testimonial is from a real verified buyer.</SectionSub>
        <div className="grid md:grid-cols-3 gap-6">
          {REVIEWS.map((r, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="bg-white rounded-[16px] p-6 border border-gold-soft/20 h-full flex flex-col">
                <div className="flex items-center gap-1 text-[0.65rem] text-gold-soft mb-2 tracking-wider">
                  {"⭐⭐⭐⭐⭐"} <span className="text-[0.5rem] bg-emerald-deep/10 text-emerald-deep font-semibold px-1.5 py-0.5 rounded-full ml-1">Verified</span>
                </div>
                <blockquote className="text-sm text-heading italic leading-relaxed mb-4 flex-1">"{r.text}"</blockquote>
                <div className="flex items-center gap-3 mt-auto">
                  <img src={testimonialMedia[i]?.fileUrl || r.img} alt={r.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div className="text-xs"><strong className="block text-heading">{r.name}</strong><span className="text-muted text-[0.65rem]">{r.location} • Verified Buyer</span></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {recentOrders.length > 0 && (
        <Section className="bg-ivory">
          <div className="text-center">
            <SectionLabel>Live Orders</SectionLabel>
            <SectionTitle>Real People Are Ordering Right Now</SectionTitle>
            <SectionSub>Join hundreds of happy customers who have already placed their order.</SectionSub>
          </div>
          <div className="max-w-[600px] mx-auto bg-white rounded-[16px] p-5 border border-gold-soft/20">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {recentOrders.slice(0, 5).map((o, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden shadow-sm">
                    <img
                      src={`https://i.pravatar.cc/80?img=${((o.name.length + i) % 70) + 1}`}
                      alt={o.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <motion.div
                  key={orderIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-sm font-medium text-heading truncate"
                >
                  {activeOrder?.name} from {activeOrder?.city} <span className="text-emerald-deep font-bold">just ordered!</span>
                </motion.div>
                <div className="text-[0.65rem] text-muted">Order value: ₹{activeOrder?.amount.toLocaleString()}</div>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </Section>
      )}

      <Section className="bg-emerald-deep text-white">
        <div className="text-center">
          <div className="text-gold-soft text-xs font-semibold tracking-widest uppercase mb-2">🎁 The Perfect Gift</div>
          <SectionTitle className="text-white">The Gift She Will Never Forget</SectionTitle>
          <SectionSub className="text-white/50">Some gifts are forgotten. This one becomes her favorite accessory.</SectionSub>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 mb-8">
          {[
            { emoji: "🎂", label: "Birthday" },
            { emoji: "💍", label: "Anniversary" },
            { emoji: "❤️", label: "Valentine's Day" },
            { emoji: "💎", label: "Proposal" },
            { emoji: "👫", label: "Wedding Gift" },
            { emoji: "🤩", label: "Surprise Gift" },
          ].map((g, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="bg-white/5 border border-white/10 rounded-[16px] p-5 text-center hover:border-gold-soft hover:-translate-y-0.5 transition-all h-full flex flex-col items-center justify-center">
                <div className="text-2xl mb-1.5">{g.emoji}</div>
                <h4 className="font-sans text-sm font-medium text-white">{g.label}</h4>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="text-center">
          <p className="text-white/50 text-sm italic font-light mb-4">"Give her elegance she'll wear with pride."</p>
          <button onClick={handleOrderNow} className="bg-gold-soft text-heading font-bold text-sm py-4 px-10 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-white hover:-translate-y-0.5 transition-all inline-block cursor-pointer">
            {noFeatured ? "SHOP GIFTS" : "GIFT NOW"} <i className="fas fa-arrow-right ml-1" />
          </button>
        </div>
      </Section>

      {offerEnd && countdown.days + countdown.hours + countdown.minutes + countdown.seconds > 0 && (
        <section className="bg-champagne text-center py-16 lg:py-[100px] px-5">
          <div className="max-w-[1280px] mx-auto">
            <div className="text-[0.7rem] font-semibold tracking-[3px] uppercase text-emerald-deep mb-2">⏳ {offerTitle}</div>
            <h2 className="font-serif text-[clamp(1.4rem,4vw,2rem)] font-semibold text-heading mb-2">Offer Ends In</h2>
            <p className="text-sm text-body font-light mb-6">Don't miss out on this exclusive offer. Thousands of women have already ordered.</p>
            <div className="flex justify-center gap-4">
              {[
                { label: "Days", value: countdown.days },
                { label: "Hours", value: countdown.hours },
                { label: "Minutes", value: countdown.minutes },
                { label: "Seconds", value: countdown.seconds },
              ].map((unit) => (
                <div key={unit.label} className="bg-white rounded-[16px] w-[70px] md:w-[90px] py-3 px-2 text-center shadow-[0_2px_8px_rgba(11,58,66,0.06)]">
                  <div className="font-serif text-2xl md:text-3xl font-bold text-heading">{String(unit.value).padStart(2, "0")}</div>
                  <div className="text-[0.6rem] text-muted uppercase tracking-wider mt-0.5">{unit.label}</div>
                </div>
              ))}
            </div>
            <div className="mt-7">
              <button onClick={handleOrderNow} className="bg-emerald-deep text-white font-bold text-sm py-4 px-10 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(11,58,66,0.2)] hover:bg-teal-luxury hover:-translate-y-0.5 transition-all inline-block cursor-pointer">
                {noFeatured ? "SHOP NOW" : "CLAIM YOUR OFFER"} <i className="fas fa-arrow-right ml-1" />
              </button>
            </div>
          </div>
        </section>
      )}

      <Section className="bg-ivory">
        <SectionLabel>Why Shop With Us</SectionLabel>
        <SectionTitle>Shop With Confidence</SectionTitle>
        <SectionSub>We make sure your shopping experience is safe, smooth, and delightful.</SectionSub>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {(reassuranceFeatures.length > 0 ? reassuranceFeatures : [
            { icon: "fa-rupee-sign", title: "COD Available", desc: "Pay when your package arrives. No advance payment needed." },
            { icon: "fa-lock", title: "Secure Checkout", desc: "Your personal data is encrypted and never shared." },
            { icon: "fa-gift", title: "Premium Packaging", desc: "Every order comes in a luxury gift box, ready to present." },
            { icon: "fa-search-location", title: "Live Order Tracking", desc: "Track your order in real-time from dispatch to delivery." },
            { icon: "fa-headset", title: "Customer Support", desc: "Reach us on WhatsApp. We're here to help you." },
            { icon: "fa-clipboard-check", title: "Quality Checked", desc: "Every piece is inspected before shipping to ensure perfection." },
          ]).map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <div className="bg-white rounded-[16px] p-5 text-center border border-gold-soft/20 h-full flex flex-col items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-emerald-deep/10 flex items-center justify-center text-emerald-deep text-base mb-3"><i className={`fas ${item.icon}`} /></div>
                <h4 className="font-sans text-sm font-semibold text-heading mb-1">{item.title}</h4>
                <p className="text-[0.7rem] text-body font-light">{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="bg-champagne">
        <div className="max-w-[900px] mx-auto text-center">
          <SectionLabel>Stay Informed</SectionLabel>
          <SectionTitle>Track Your Order Anytime</SectionTitle>
          <SectionSub>From the moment you place your order to the moment it arrives at your doorstep — stay updated every step of the way.</SectionSub>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-7">
            {[
              { icon: "fa-check-circle", title: "Real-Time Tracking", desc: "See exactly where your package is at any moment." },
              { icon: "fa-bell", title: "Order Updates", desc: "Get notified when your status changes — from Confirmed to Out for Delivery." },
              { icon: "fa-truck", title: "Shipment Status", desc: "Know when your package is packed, shipped, and out for delivery." },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white rounded-[16px] p-6 border border-gold-soft/20 h-full flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-deep/10 flex items-center justify-center text-emerald-deep text-lg mb-3"><i className={`fas ${item.icon}`} /></div>
                  <h4 className="font-sans text-sm font-semibold text-heading mb-1">{item.title}</h4>
                  <p className="text-[0.7rem] text-body font-light">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Link to="/track-order" className="inline-flex items-center gap-2 bg-emerald-deep text-white font-bold text-sm py-3.5 px-8 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(11,58,66,0.2)] hover:bg-teal-luxury hover:-translate-y-0.5 transition-all">
            <i className="fas fa-search" /> Track Your Order
          </Link>
        </div>
      </Section>

      <Section className="bg-ivory">
        <SectionLabel>FAQ</SectionLabel>
        <SectionTitle>Any Questions? We're Here.</SectionTitle>
        <div className="max-w-[680px] mx-auto">
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-gold-soft/30">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full flex justify-between items-center py-4 text-sm font-medium text-left text-heading hover:text-emerald-deep transition"
              >
                {faq.q}
                <i className={`fas fa-chevron-down text-muted text-xs transition-transform duration-300 ${activeFaq === i ? "rotate-180 text-emerald-deep" : ""}`} />
              </button>
              <motion.div
                initial={false}
                animate={{ height: activeFaq === i ? "auto" : 0, opacity: activeFaq === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="pb-4 text-sm text-body font-light leading-relaxed">{faq.a}</p>
              </motion.div>
            </div>
          ))}
        </div>
      </Section>

      {(ctaConfig["final_cta"]?.visible !== false) && (
      <section className="bg-emerald-deep text-white text-center py-20 lg:py-[120px] px-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-soft via-white/30 to-gold-soft" />
        <h2 className="font-serif text-[clamp(1.5rem,5vw,2.4rem)] mb-3">{ctaConfig["final_cta"]?.heading || "You Deserve Jewelry That Gets Noticed."}</h2>
        <p className="text-white/50 text-sm font-light max-w-md mx-auto mb-7 leading-relaxed">{ctaConfig["final_cta"]?.subtext || "Thousands of customers already love this necklace. Join them and elevate your style today."}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button onClick={handleOrderNow} className="bg-gold-soft text-heading font-bold text-sm py-4 px-10 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-white hover:-translate-y-0.5 transition-all cursor-pointer">
            {noFeatured ? "BROWSE COLLECTION" : `${(ctaConfig["final_cta"]?.buttonText) || "ORDER NOW"} `}<i className="fas fa-arrow-right ml-1" />
          </button>
          <a
            href={`https://wa.me/${whatsAppNumber}?text=Hi!%20I%20want%20to%20order%20the%20${encodeURIComponent(featuredProduct?.name || "Premium Crystal Necklace")}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25d366] text-white font-bold text-sm py-4 px-10 rounded-[14px] uppercase tracking-wider shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_24px_rgba(37,211,102,0.5)] hover:-translate-y-0.5 transition-all"
          >
            <i className="fab fa-whatsapp mr-1" /> CHAT ON WHATSAPP
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-xs text-white/40">
          <span><i className="fas fa-check-circle text-gold-soft mr-1" /> COD Available</span>
          <span><i className="fas fa-truck text-gold-soft mr-1" /> Free Shipping</span>
          <span><i className="fas fa-gift text-gold-soft mr-1" /> Premium Gift Box</span>
          <span><i className="fas fa-shield-alt text-gold-soft mr-1" /> Secure Checkout</span>
          <span><i className="fas fa-redo text-gold-soft mr-1" /> Easy Returns</span>
          <span><i className="fas fa-search-location text-gold-soft mr-1" /> Live Tracking</span>
        </div>
      </section>
      )}

      <footer className="bg-teal-luxury text-white/40 text-center py-7 px-5 pb-20 text-xs leading-relaxed">
        <div className="max-w-[600px] mx-auto flex flex-wrap justify-center gap-x-6 gap-y-1 mb-4">
          <Link to="/products" className="text-gold-soft hover:underline">All Products</Link>
          <Link to="/about" className="text-gold-soft hover:underline">About Us</Link>
          <Link to="/track-order" className="text-gold-soft hover:underline">Track Order</Link>
          <Link to="/contact" className="text-gold-soft hover:underline">Contact</Link>
          <Link to="/blog" className="text-gold-soft hover:underline">Blog</Link>
          <Link to="/shipping-policy" className="text-gold-soft hover:underline">Shipping</Link>
          <Link to="/return-policy" className="text-gold-soft hover:underline">Returns</Link>
          <Link to="/privacy-policy" className="text-gold-soft hover:underline">Privacy</Link>
        </div>
        <p>© 2026 Shop Sasta Mart. All rights reserved.</p>
        <p>WhatsApp: <a href={`https://wa.me/${whatsAppNumber}`} className="text-gold-soft">+91-{whatsAppNumber}</a> &nbsp;|&nbsp; Email: <a href="mailto:support@shopsastamart.com" className="text-gold-soft">support@shopsastamart.com</a></p>
        <p className="mt-2"><Link to="/track-order" className="text-gold-soft hover:underline">Track Your Order</Link></p>
      </footer>

      <motion.div
        className="fixed bottom-0 left-0 right-0 z-40 bg-ivory/98 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-4 py-2.5 flex items-center gap-2.5"
        initial={false}
        animate={{ y: sticky ? 0 : "100%" }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex-1 min-w-0">
          <span className="text-[0.68rem] text-muted hidden sm:inline">{featuredProduct?.name || "Premium Crystal Necklace"}</span>
          <div className="font-serif text-lg font-bold text-heading">
            ₹{heroPrice.toLocaleString()} <span className="text-xs text-muted line-through font-sans font-normal ml-1">₹{heroDiscountPrice.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={handleOrderNow} className="bg-emerald-deep text-white text-sm font-bold py-2.5 px-6 rounded-[14px] whitespace-nowrap hover:bg-teal-luxury transition shadow-[0_2px_8px_rgba(11,58,66,0.15)] cursor-pointer">{noFeatured ? "SHOP NOW" : "ORDER NOW"}</button>
      </motion.div>

      <a
        href={`https://wa.me/${whatsAppNumber}?text=Hi!%20I%20want%20to%20know%20more%20about%20the%20${encodeURIComponent(featuredProduct?.name || "Premium Crystal Necklace")}.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[76px] right-3 md:bottom-20 md:right-6 z-40 w-[50px] h-[50px] bg-[#25d366] text-white rounded-full flex items-center justify-center text-2xl shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_24px_rgba(37,211,102,0.5)] transition-all"
      >
        <i className="fab fa-whatsapp" />
      </a>

      {showExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5" onClick={() => { setShowExit(false); exitDismissed.current = true; }}>
          <div className="absolute inset-0 bg-emerald-deep/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-white rounded-[16px] p-9 max-w-[400px] w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => { setShowExit(false); exitDismissed.current = true; }} className="absolute top-2.5 right-3.5 bg-none border-none text-2xl text-gray-400 cursor-pointer hover:text-heading transition">&times;</button>
            <div className="text-3xl mb-2.5">💎</div>
            <h3 className="font-serif text-xl font-semibold text-heading mb-1.5">Wait! Don't Miss This Offer</h3>
            <p className="text-sm text-body font-light mb-4">Get the {featuredProduct?.name || (hero?.title || "Premium Crystal Necklace").replace(/<br\s*\/?>/gi, ' ')} at <strong className="text-heading">{heroDiscountPercent}% OFF</strong> with free shipping, COD, and a premium gift box.</p>
            <div className="font-serif text-3xl text-emerald-deep font-bold mb-4">₹{heroPrice.toLocaleString()}</div>
            <button onClick={() => { handleOrderNow(); setShowExit(false); exitDismissed.current = true; }} className="bg-emerald-deep text-white font-bold text-sm py-4 px-8 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(11,58,66,0.2)] hover:bg-teal-luxury transition-all block w-full cursor-pointer">{noFeatured ? "SHOP NOW" : "CLAIM YOUR DISCOUNT"}</button>
            <p className="mt-2.5 text-[0.7rem] text-muted">Free Shipping • COD Available • Gift Box Included</p>
          </motion.div>
        </div>
      )}
    </main>
  );
}

function Section({ children, className = "" }) {
  return <section className={`py-20 lg:py-[120px] px-5 ${className}`}><div className="max-w-[1280px] mx-auto">{children}</div></section>;
}

function SectionLabel({ children }) {
  return <div className="text-center text-[0.5rem] font-sans font-medium tracking-[0.15em] uppercase text-emerald-deep mb-3">{children}</div>;
}

function SectionTitle({ children, className = "" }) {
  return <h2 className={`font-serif text-[clamp(1.4rem,5vw,2.2rem)] font-medium text-center text-heading mb-3 tracking-tight ${className}`}>{children}</h2>;
}

function SectionSub({ children, className = "" }) {
  return <p className={`text-sm font-sans font-light max-w-[560px] mx-auto text-center mb-10 leading-relaxed ${className || "text-body"}`}>{children}</p>;
}

function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
