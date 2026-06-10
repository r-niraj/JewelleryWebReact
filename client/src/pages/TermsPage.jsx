import { Link } from "react-router-dom";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Link to="/" className="font-serif text-base tracking-wide text-[#1A1A1A] hover:opacity-70 transition mb-8 inline-block">Shopsastamart</Link>
        <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-6">Terms of Service</h1>
        <p className="text-[0.75rem] text-[#8B8B8B] mb-8">Last updated: January 2026</p>
        <div className="space-y-6 text-[0.82rem] text-[#4A4A4A] font-light leading-[1.9]">
          <p>By using the Shopsastamart website and placing orders, you agree to these terms. Please read them carefully.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Products & Pricing</h2>
          <p>All product descriptions, images, and pricing are subject to change without notice. We reserve the right to modify or discontinue any product at any time. Prices are listed in Indian Rupees (INR) and include applicable taxes.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Orders & Payment</h2>
          <p>By placing an order, you agree to provide accurate and complete information. We accept Cash on Delivery (COD) and prepaid payments. Order confirmation is sent via WhatsApp or email.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Shipping & Delivery</h2>
          <p>We ship across India. Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers or unforeseen circumstances.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Returns & Refunds</h2>
          <p>Please see our Return Policy for detailed information on returns, exchanges, and refunds.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Intellectual Property</h2>
          <p>All content on this website, including images, text, and designs, is the property of Shopsastamart and may not be reproduced without permission.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Contact</h2>
          <p>For questions about these terms, contact support@shopsastamart.com.</p>
        </div>
      </div>
    </div>
  );
}
