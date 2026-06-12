import { Link } from "react-router-dom";
import Logo from '../components/Logo';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Logo />
        <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-6">About Shopsastamart</h1>
        <div className="prose prose-sm max-w-none text-[#4A4A4A]">
          <p>Shopsastamart was born from a simple belief: every woman deserves jewelry that makes her feel confident, beautiful, and unforgettable. We handcraft premium fashion jewelry that combines timeless design with modern aesthetics.</p>
          <p>Based in Delhi, India, we serve customers across the country with Cash on Delivery, free shipping, and premium gift packaging. Our pieces are designed for the modern Indian woman — whether she is attending a wedding, going to the office, or enjoying a date night.</p>
          <p>Every piece of jewelry is meticulously crafted by skilled artisans using premium materials. We use 18k gold-plated sterling silver, brilliant-cut crystals, and tarnish-resistant coatings to ensure your jewelry stays beautiful for years.</p>
          <p>We are proud to be trusted by over 1,000 happy customers across India. Our commitment to quality, customer service, and affordable luxury sets us apart.</p>
          <div className="bg-[#F5F5F3] p-6 rounded-[12px] mt-8">
            <h2 className="text-[#1A1A1A] font-semibold text-sm mb-3">Our Promise</h2>
            <ul className="space-y-2">
              <li><i className="fas fa-check text-emerald-600 mr-2" /> Premium quality at affordable prices</li>
              <li><i className="fas fa-check text-emerald-600 mr-2" /> Cash on Delivery across India</li>
              <li><i className="fas fa-check text-emerald-600 mr-2" /> Free shipping on all orders</li>
              <li><i className="fas fa-check text-emerald-600 mr-2" /> 7-day easy return policy</li>
              <li><i className="fas fa-check text-emerald-600 mr-2" /> Premium gift packaging</li>
              <li><i className="fas fa-check text-emerald-600 mr-2" /> Customer support via WhatsApp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
