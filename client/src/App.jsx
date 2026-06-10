import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAdminAuth } from './store/slices/adminAuthSlice';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/Orders';
import AdminProducts from './pages/admin/Products';
import AdminProductEdit from './pages/admin/ProductEdit';
import AdminCustomers from './pages/admin/Customers';
import AdminContent from './pages/admin/Content';
import AdminHero from './pages/admin/HeroContent';
import AdminGallery from './pages/admin/Gallery';
import AdminFeatures from './pages/admin/Features';
import AdminCTA from './pages/admin/CTA';
import AdminBenefits from './pages/admin/Benefits';
import AdminHeroManager from './pages/admin/HeroManager';
import AdminMedia from './pages/admin/Media';
import AdminSettings from './pages/admin/Settings';
import AdminLayout from './pages/admin/AdminLayout';

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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
