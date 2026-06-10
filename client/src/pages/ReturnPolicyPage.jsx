import { Link } from "react-router-dom";

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Link to="/" className="font-serif text-base tracking-wide text-[#1A1A1A] hover:opacity-70 transition mb-8 inline-block">Shopsastamart</Link>
        <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-6">Return & Exchange Policy</h1>
        <p className="text-[0.75rem] text-[#8B8B8B] mb-8">Last updated: January 2026</p>
        <div className="space-y-6 text-[0.82rem] text-[#4A4A4A] font-light leading-[1.9]">
          <h2 className="text-[#1A1A1A] font-semibold text-sm">7-Day Easy Returns</h2>
          <p>We offer easy returns within 7 days of delivery. If you are not satisfied with your purchase for any reason, you can return it for a refund or exchange.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Conditions for Return</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Items must be unworn and in original condition</li>
            <li>All tags and packaging must be intact</li>
            <li>Return must be initiated within 7 days of delivery</li>
            <li>Custom or personalized items cannot be returned</li>
          </ul>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">How to Initiate a Return</h2>
          <p>Contact our support team on WhatsApp or email at support@shopsastamart.com with your order number. We will guide you through the return process.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Refunds</h2>
          <p>Refunds are processed within 5-7 business days after we receive and inspect the returned item. COD orders are refunded via bank transfer. Prepaid orders are refunded to the original payment method.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Exchanges</h2>
          <p>If you received a defective or incorrect item, we will replace it free of charge. Contact us immediately with photos of the issue.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Cancellations</h2>
          <p>Orders in Pending or Confirmed status can be cancelled. Contact us on WhatsApp for instant cancellation.</p>
        </div>
      </div>
    </div>
  );
}
