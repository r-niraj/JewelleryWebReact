import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAdminAuth } from './store/slices/adminAuthSlice';
import { AnalyticsProvider } from './analytics/AnalyticsProvider';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogArticlePage = lazy(() => import('./pages/BlogArticlePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const ShippingPolicyPage = lazy(() => import('./pages/ShippingPolicyPage'));
const ReturnPolicyPage = lazy(() => import('./pages/ReturnPolicyPage'));
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminOrders = lazy(() => import('./pages/admin/Orders'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AdminProductEdit = lazy(() => import('./pages/admin/ProductEdit'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminContent = lazy(() => import('./pages/admin/Content'));
const AdminHero = lazy(() => import('./pages/admin/HeroContent'));
const AdminGallery = lazy(() => import('./pages/admin/Gallery'));
const AdminFeatures = lazy(() => import('./pages/admin/Features'));
const AdminCTA = lazy(() => import('./pages/admin/CTA'));
const AdminBenefits = lazy(() => import('./pages/admin/Benefits'));
const AdminHeroManager = lazy(() => import('./pages/admin/HeroManager'));
const AdminMedia = lazy(() => import('./pages/admin/Media'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminAnalyticsOverview = lazy(() => import('./pages/admin/analytics/Overview'));
const AdminAnalyticsVisitors = lazy(() => import('./pages/admin/analytics/Visitors'));
const AdminAnalyticsTrafficSources = lazy(() => import('./pages/admin/analytics/TrafficSources'));
const AdminAnalyticsCampaigns = lazy(() => import('./pages/admin/analytics/CampaignAnalytics'));
const AdminAnalyticsProducts = lazy(() => import('./pages/admin/analytics/ProductAnalytics'));
const AdminAnalyticsJourney = lazy(() => import('./pages/admin/analytics/CustomerJourney'));
const AdminAnalyticsGeography = lazy(() => import('./pages/admin/analytics/Geography'));
const AdminAnalyticsLive = lazy(() => import('./pages/admin/analytics/LiveVisitors'));
const AdminAnalyticsEvents = lazy(() => import('./pages/admin/analytics/EventExplorer'));
const AdminAnalyticsFunnel = lazy(() => import('./pages/admin/analytics/ConversionFunnel'));
const AdminAnalyticsLayout = lazy(() => import('./pages/admin/AnalyticsLayout'));

function JsonLd({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function AppInit() {
  const dispatch = useDispatch();
  useEffect(() => { dispatch(checkAdminAuth()); }, [dispatch]);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AppInit />
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Shopsastamart',
        url: import.meta.env.VITE_SITE_URL || 'https://shopsastamart.com',
        logo: `${import.meta.env.VITE_SITE_URL || 'https://shopsastamart.com'}/icon.svg`,
      }} />
      <AnalyticsProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-ivory flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-emerald-deep/20 border-t-emerald-deep rounded-full animate-spin" />
          </div>
        }>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/shipping" element={<ShippingPolicyPage />} />
            <Route path="/return-policy" element={<ReturnPolicyPage />} />
            <Route path="/returns" element={<ReturnPolicyPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/:slug" element={<AdminProductEdit />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="content/hero" element={<AdminHero />} />
              <Route path="content/gallery" element={<AdminGallery />} />
              <Route path="content/features" element={<AdminFeatures />} />
              <Route path="content/cta" element={<AdminCTA />} />
              <Route path="content/benefits" element={<AdminBenefits />} />
              <Route path="hero-manager" element={<AdminHeroManager />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="analytics" element={<AdminAnalyticsLayout />}>
                <Route index element={<AdminAnalyticsOverview />} />
                <Route path="visitors" element={<AdminAnalyticsVisitors />} />
                <Route path="traffic-sources" element={<AdminAnalyticsTrafficSources />} />
                <Route path="campaigns" element={<AdminAnalyticsCampaigns />} />
                <Route path="products" element={<AdminAnalyticsProducts />} />
                <Route path="journey" element={<AdminAnalyticsJourney />} />
                <Route path="geography" element={<AdminAnalyticsGeography />} />
                <Route path="live" element={<AdminAnalyticsLive />} />
                <Route path="events" element={<AdminAnalyticsEvents />} />
                <Route path="funnel" element={<AdminAnalyticsFunnel />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AnalyticsProvider>
    </BrowserRouter>
  );
}

export default App;
