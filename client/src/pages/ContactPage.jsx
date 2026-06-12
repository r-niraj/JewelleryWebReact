import { Link } from "react-router-dom";
import Logo from '../components/Logo';

const CONTACT_EMAIL = "support@shopsastamart.com";
const CONTACT_WHATSAPP = "918678037094";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[720px] mx-auto px-6 py-20">
        <Logo />
        <h1 className="font-serif text-3xl font-semibold text-[#1A1A1A] mb-2">Contact Us</h1>
        <p className="text-[0.82rem] text-[#6B6B6B] font-light mb-10">We&apos;d love to hear from you. Reach out with any questions, orders, or feedback.</p>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-[#F5F5F3] rounded-[12px] p-6">
            <i className="fab fa-whatsapp text-[#25d366] text-xl mb-3 block" />
            <h2 className="text-sm font-semibold text-[#1A1A1A] mb-1">WhatsApp</h2>
            <p className="text-[0.75rem] text-[#6B6B6B] font-light mb-2">Quickest way to reach us</p>
            <a href={`https://wa.me/${CONTACT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm font-medium hover:underline">
              Chat on WhatsApp
            </a>
          </div>
          <div className="bg-[#F5F5F3] rounded-[12px] p-6">
            <i className="fas fa-envelope text-[#1A1A1A] text-xl mb-3 block" />
            <h2 className="text-sm font-semibold text-[#1A1A1A] mb-1">Email</h2>
            <p className="text-[0.75rem] text-[#6B6B6B] font-light mb-2">We reply within 24 hours</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-600 text-sm font-medium hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <div className="bg-[#F5F5F3] rounded-[12px] p-6">
          <h2 className="text-sm font-semibold text-[#1A1A1A] mb-3">Quick Links</h2>
          <div className="space-y-2 text-[0.75rem]">
            <Link to="/track-order" className="block text-emerald-600 hover:underline">Track Your Order</Link>
            <Link to="/shipping-policy" className="block text-emerald-600 hover:underline">Shipping Information</Link>
            <Link to="/return-policy" className="block text-emerald-600 hover:underline">Return & Exchange Policy</Link>
            <Link to="/privacy-policy" className="block text-emerald-600 hover:underline">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
