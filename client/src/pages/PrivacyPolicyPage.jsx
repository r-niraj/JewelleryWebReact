import { Link } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Link to="/" className="font-serif text-base tracking-wide text-[#1A1A1A] hover:opacity-70 transition mb-8 inline-block">Shopsastamart</Link>
        <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-6">Privacy Policy</h1>
        <p className="text-[0.75rem] text-[#8B8B8B] mb-8">Last updated: January 2026</p>
        <div className="space-y-6 text-[0.82rem] text-[#4A4A4A] font-light leading-[1.9]">
          <p>At Shopsastamart, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Information We Collect</h2>
          <p>When you place an order, we collect your name, phone number, email address, shipping address, and payment details. We also collect browsing data through cookies to improve your shopping experience.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">How We Use Your Information</h2>
          <p>We use your information to process orders, deliver products, provide customer support, and send order updates. With your consent, we may send promotional emails about new collections and offers.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Data Protection</h2>
          <p>Your personal data is encrypted and stored securely. We never share your information with third parties except as required to process your order (e.g., shipping carriers).</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at support@shopsastamart.com.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Contact</h2>
          <p>For privacy-related inquiries, email us at support@shopsastamart.com or reach out on WhatsApp.</p>
        </div>
      </div>
    </div>
  );
}
