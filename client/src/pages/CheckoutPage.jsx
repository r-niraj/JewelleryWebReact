import { Suspense, useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from 'react-redux'
import { clearCart, selectCartItems } from '../store/slices/cartSlice'

function CheckoutForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const cartItems = useSelector(selectCartItems);
  const productSlug = searchParams.get("product") || "";
  const itemsParam = searchParams.get("items") || "";
  const initialQty = Math.max(1, parseInt(searchParams.get("qty") || "1"));

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [form, setForm] = useState({
    fullName: "", phone: "", email: "", address: "", landmark: "", city: "", state: "", pincode: "", notes: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(null);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (itemsParam) {
      const pairs = itemsParam.split(",").map((p) => {
        const [slug, qtyStr] = p.split(":");
        return { slug, qty: Math.max(1, parseInt(qtyStr) || 1) };
      });
      Promise.all(
        pairs.map((p) =>
          fetch(`/api/products/${p.slug}`, { credentials: 'include' })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) {
                const primary = d.product.images?.find((i) => i.isPrimary) || d.product.images?.[0];
                return {
                  slug: p.slug,
                  name: d.product.name,
                  price: Number(d.product.price),
                  originalPrice: Number(d.product.originalPrice),
                  image: primary?.imageUrl || "",
                  quantity: p.qty,
                };
              }
              return null;
            })
            .catch(() => null)
        )
      ).then((results) => {
        setCheckoutItems(results.filter(Boolean));
        setLoadingItems(false);
      });
    } else if (productSlug) {
      fetch(`/api/products/${productSlug}`, { credentials: 'include' }).then((r) => r.json()).then((d) => {
        if (d.success) {
          const primary = d.product.images?.find((i) => i.isPrimary) || d.product.images?.[0];
          setCheckoutItems([{
            slug: productSlug,
            name: d.product.name,
            price: Number(d.product.price),
            originalPrice: Number(d.product.originalPrice),
            image: primary?.imageUrl || "",
            quantity: initialQty,
          }]);
        }
      }).finally(() => setLoadingItems(false));
    } else if (cartItems.length > 0) {
      setCheckoutItems(
        cartItems.map((i) => ({
          slug: i.slug,
          name: i.name,
          price: i.price,
          originalPrice: i.originalPrice,
          image: i.image,
          quantity: i.quantity,
        }))
      );
      setLoadingItems(false);
    } else {
      setLoadingItems(false);
    }
  }, [productSlug, itemsParam, initialQty, cartItems]);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone)) errs.phone = "Must be exactly 10 digits";
    if (!form.address.trim()) errs.address = "Address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.pincode.trim()) errs.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode)) errs.pincode = "Must be 6 digits";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getLocation = () => {
    if (!navigator.geolocation) { setApiError("Geolocation is not supported by your browser"); return; }
    setLocating(true);
    setApiError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      (err) => {
        setLocating(false);
        const msgs = {
          1: "Location permission denied. Please type your address manually.",
          2: "Location unavailable. Please type your address manually.",
        };
        setApiError(msgs[err.code] || "Failed to get location.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    if (checkoutItems.length === 0) { setApiError("No items to order"); return; }
    setLoading(true);
    try {
      let fullAddress = form.landmark ? `${form.address.trim()}, ${form.landmark.trim()}` : form.address.trim();
      if (coords) fullAddress += ` (https://maps.google.com/?q=${coords.lat},${coords.lng})`;

      const payload = { ...form, address: fullAddress };

      if (checkoutItems.length === 1 && !itemsParam) {
        payload.productSlug = checkoutItems[0].slug;
        payload.quantity = checkoutItems[0].quantity;
      } else {
        payload.items = checkoutItems.map((i) => ({ slug: i.slug, quantity: i.quantity }));
      }

      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to place order");
      setSuccess(data);
      dispatch(clearCart());
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="font-serif text-2xl font-medium text-[#1A1A1A] mb-2 tracking-tight">Order Placed!</h2>
          <p className="text-sm text-[#6B6B6B] mb-3">Your order has been placed successfully.</p>
          <div className="bg-[#FAFAF8] rounded-lg px-5 py-3 inline-block mb-4">
            <div className="text-xs text-[#B8B4AD] mb-0.5">Order Number</div>
            <div className="font-bold text-lg text-[#1A1A1A]">{success.orderNumber}</div>
          </div>
          <div className="font-sans text-xl font-medium text-[#1A1A1A] mb-5">₹{success.totalAmount.toLocaleString()}</div>
          <p className="text-xs text-[#6B6B6B] mb-6">Save this Order Number to track your order status. You'll also receive updates via WhatsApp.</p>
          <div className="flex flex-col gap-2.5">
            <Link to={`/track-order?order=${success.orderNumber}`} className="bg-[#1A1A1A] text-white text-sm font-sans font-medium py-3.5 px-6 rounded-[10px] hover:bg-[#333] transition text-center">Track Your Order</Link>
            <Link to="/products" className="text-[#1A1A1A] text-sm font-sans font-medium hover:opacity-60 transition">Continue Shopping</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const subtotal = checkoutItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalSavings = checkoutItems.reduce((s, i) => s + (i.originalPrice - i.price) * i.quantity, 0);

  if (loadingItems) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><div className="w-10 h-10 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" /></div>
  );

  if (checkoutItems.length === 0) return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
      <div className="text-center">
        <p className="text-sm text-[#6B6B6B]">No items to checkout.</p>
        <Link to="/products" className="text-[#1A1A1A] text-sm font-medium mt-2 inline-block hover:opacity-60 transition">Browse products</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="bg-[#FAFAF8] border-b border-[#E8E6E1] px-5 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-base font-normal tracking-wide text-[#1A1A1A]">Shopsastamart</Link>
        <Link to="/cart" className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition"><i className="fas fa-arrow-left mr-1" /> Back to Cart</Link>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="lg:sticky lg:top-8 space-y-4">
              <div className="bg-white rounded-[14px] p-6 border border-[#E8E6E1]">
                <h3 className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD] mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {checkoutItems.map((item, i) => (
                    <div key={i} className="flex gap-3 pb-3 border-b border-[#F0EFEC] last:border-0 last:pb-0">
                      <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-[#F0EFEC] flex-shrink-0">
                        <img src={item.image || "/images/necklace-1.jpeg"} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[0.65rem] font-medium text-[#1A1A1A] line-clamp-1">{item.name}</p>
                        <p className="text-[0.55rem] text-[#6B6B6B] mt-0.5">Qty: {item.quantity}</p>
                        <p className="text-[0.7rem] font-sans font-medium text-[#1A1A1A] mt-0.5">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[#E8E6E1] space-y-1.5 text-[0.7rem]">
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Subtotal</span>
                    <span className="text-[#1A1A1A]">₹{subtotal.toLocaleString()}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Savings</span>
                      <span>−₹{totalSavings.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#6B6B6B]">
                    <span>Shipping</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between text-[0.85rem] font-sans font-medium text-[#1A1A1A] pt-1.5 border-t border-[#E8E6E1] mt-1.5">
                    <span>Total</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-[14px] p-6 md:p-8 border border-[#E8E6E1]">
              <h2 className="font-serif text-xl font-medium text-[#1A1A1A] mb-6 tracking-tight">
                <i className="fas fa-lock text-[#1A1A1A] text-sm mr-1.5" />
                Secure Checkout — Pay on Delivery
              </h2>

              {apiError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">{apiError}</div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">Full Name *</label>
                  <input name="fullName" value={form.fullName} onChange={updateField} placeholder="Your full name" className={`w-full px-3.5 py-3 border rounded-lg text-sm outline-none transition bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A] ${errors.fullName ? "border-red-400" : "border-[#D4D0C8]"}`} />
                  {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">Mobile Number *</label>
                    <input name="phone" value={form.phone} onChange={updateField} placeholder="10-digit number" maxLength={10} className={`w-full px-3.5 py-3 border rounded-lg text-sm outline-none transition bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A] ${errors.phone ? "border-red-400" : "border-[#D4D0C8]"}`} />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">Email <span className="text-[#B8B4AD] font-normal">(optional)</span></label>
                    <input name="email" value={form.email} onChange={updateField} placeholder="email@example.com" className="w-full px-3.5 py-3 border border-[#D4D0C8] rounded-lg text-sm outline-none transition bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A]" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">Building / House / Flat / Street *</label>
                  <textarea name="address" value={form.address} onChange={updateField} placeholder="House / Flat No., Building Name, Street, Area" rows={2}
                    className={`w-full px-3.5 py-3 border rounded-lg text-sm outline-none transition bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A] resize-none ${errors.address ? "border-red-400" : "border-[#D4D0C8]"}`} />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">Landmark <span className="text-[#B8B4AD] font-normal">(recommended)</span></label>
                  <input name="landmark" value={form.landmark} onChange={updateField} placeholder="e.g., Near Metro Station, Opposite Park"
                    className="w-full px-3.5 py-3 border border-[#D4D0C8] rounded-lg text-sm outline-none bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A] transition" />
                </div>

                <div className="mb-5">
                  <button type="button" onClick={getLocation} disabled={locating}
                    className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#D4D0C8] rounded-lg text-sm text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition disabled:opacity-50">
                    {locating ? (
                      <><span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-[#1A1A1A] rounded-full animate-spin" /> Detecting…</>
                    ) : (
                      <><i className="fas fa-crosshairs" /> {coords ? "Update Location" : "Use My Current Location"}</>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="mb-4">
                    <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">City *</label>
                    <input name="city" value={form.city} onChange={updateField} placeholder="City" className={`w-full px-3.5 py-3 border rounded-lg text-sm outline-none transition bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A] ${errors.city ? "border-red-400" : "border-[#D4D0C8]"}`} />
                    {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">State *</label>
                    <input name="state" value={form.state} onChange={updateField} placeholder="State" className={`w-full px-3.5 py-3 border rounded-lg text-sm outline-none transition bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A] ${errors.state ? "border-red-400" : "border-[#D4D0C8]"}`} />
                    {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                  </div>
                  <div className="mb-4">
                    <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">Pincode *</label>
                    <input name="pincode" value={form.pincode} onChange={updateField} placeholder="6-digit" maxLength={6} className={`w-full px-3.5 py-3 border rounded-lg text-sm outline-none transition bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A] ${errors.pincode ? "border-red-400" : "border-[#D4D0C8]"}`} />
                    {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-sans font-medium text-[#1A1A1A] mb-1">Order Notes <span className="text-[#B8B4AD] font-normal">(optional)</span></label>
                  <input name="notes" value={form.notes} onChange={updateField} placeholder="Gift message, delivery instructions..." className="w-full px-3.5 py-3 border border-[#D4D0C8] rounded-lg text-sm outline-none transition bg-[#FAFAF8] focus:bg-white focus:border-[#1A1A1A]" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#1A1A1A] text-white text-sm font-sans font-medium py-4 px-6 rounded-[10px] hover:bg-[#333] disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                  {loading ? <><i className="fas fa-spinner fa-spin mr-2" /> Processing...</> : `Place Order (COD)`}
                </button>

                <p className="text-center text-xs text-[#B8B4AD] mt-3">
                  <i className="fas fa-lock mr-1" /> Your information is secure. We'll only use it to process your order.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center"><div className="w-10 h-10 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin" /></div>}>
      <CheckoutForm />
    </Suspense>
  );
}
