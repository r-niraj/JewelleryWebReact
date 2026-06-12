import { Link } from "react-router-dom";
import Logo from '../components/Logo';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Logo />
        <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-6">Shipping Policy</h1>
        <p className="text-[0.75rem] text-[#8B8B8B] mb-8">Last updated: January 2026</p>
        <div className="space-y-6 text-[0.82rem] text-[#4A4A4A] font-light leading-[1.9]">
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Free Shipping</h2>
          <p>We offer free shipping on all orders across India. No minimum order value required.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Delivery Timelines</h2>
          <p>Orders are dispatched within 24 hours of confirmation. Estimated delivery times:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Delhi NCR: 1-3 business days</li>
            <li>Metro cities (Mumbai, Bangalore, Chennai, Kolkata, Hyderabad): 2-5 business days</li>
            <li>Other cities across India: 4-7 business days</li>
          </ul>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Order Tracking</h2>
          <p>Every order comes with a tracking number. You can track your order in real-time on our <Link to="/track-order" className="text-emerald-600 underline">Track Order</Link> page using your phone number.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Cash on Delivery</h2>
          <p>COD is available across India. Pay in cash when your package arrives. No advance payment needed.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">Packaging</h2>
          <p>All orders are packed in premium velvet gift boxes with elegant outer sleeves, ensuring your jewelry arrives in perfect condition.</p>
          <h2 className="text-[#1A1A1A] font-semibold text-sm">International Shipping</h2>
          <p>Currently, we ship only within India. International shipping will be available soon.</p>
        </div>
      </div>
    </div>
  );
}
