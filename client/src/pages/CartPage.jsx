import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { updateQuantity, removeItem, clearCart, updateItemStatus, selectCartItems, selectCartItemCount, selectCartSubtotal, selectCartSavings } from '../store/slices/cartSlice'
import { motion } from "framer-motion";

import Logo from '../components/Logo';
export default function CartPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const itemCount = useSelector(selectCartItemCount);
  const subtotal = useSelector(selectCartSubtotal);
  const savings = useSelector(selectCartSavings);
  const [unavailableSlugs, setUnavailableSlugs] = useState(new Set());

  useEffect(() => {
    if (items.length === 0) return;
    const slugs = items.map((i) => i.slug);
    slugs.forEach((slug) => {
      fetch(`/api/products/${slug}`, { credentials: 'include' })
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.product.status && d.product.status !== 'AVAILABLE') {
            setUnavailableSlugs((prev) => new Set(prev).add(slug));
            dispatch(updateItemStatus({ slug, status: d.product.status }));
          }
        })
        .catch(() => {});
    });
  }, [items.length]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-center px-5">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#F0EFEC] flex items-center justify-center">
            <i className="fas fa-shopping-bag text-[#B8B4AD] text-2xl" />
          </div>
          <h1 className="font-serif text-xl font-medium text-[#1A1A1A] mb-2 tracking-tight">Your cart is empty</h1>
          <p className="text-[0.8rem] text-[#6B6B6B] mb-6">Add some pieces to get started.</p>
          <Link to="/products" className="inline-block bg-[#1A1A1A] text-white text-sm font-sans font-medium py-3 px-8 rounded-[10px] hover:bg-[#333] transition">
            Explore Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="border-b border-[#E8E6E1] bg-[#FAFAF8]/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1100px] mx-auto px-5 py-4 flex items-center justify-between">
          <Logo />
          <Link to="/products" className="text-xs text-[#6B6B6B] hover:text-[#1A1A1A] transition">
            <i className="fas fa-arrow-left mr-1" /> Continue Shopping
          </Link>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-2xl font-medium text-[#1A1A1A] tracking-tight">Shopping Bag</h1>
            <p className="text-[0.7rem] text-[#6B6B6B] mt-0.5">{itemCount} {itemCount === 1 ? "item" : "items"}</p>
          </div>
          <button onClick={() => dispatch(clearCart())} className="text-[0.65rem] text-[#B8B4AD] hover:text-red-500 transition">
            <i className="fas fa-trash-alt mr-1" /> Clear All
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[14px] p-4 flex gap-4 border border-[#E8E6E1]"
              >
                <Link to={`/products/${item.slug}`} className="flex-shrink-0">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-[10px] overflow-hidden bg-[#F0EFEC]">
                    <img src={item.image || "/images/necklace-1.jpeg"} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug}`} className="text-[0.75rem] font-sans font-medium text-[#1A1A1A] hover:text-[#6B6B6B] transition line-clamp-1">
                    {item.name}
                  </Link>
                  {unavailableSlugs.has(item.slug) && (
                    <span className="inline-flex items-center gap-1 mt-1 text-[0.5rem] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                      <i className="fas fa-exclamation-circle" /> Currently unavailable
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[0.85rem] font-sans font-medium text-[#1A1A1A]">₹{item.price.toLocaleString()}</span>
                    <span className="text-[0.6rem] text-[#B8B4AD] line-through">₹{item.originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-[#D4D0C8] rounded-[8px]">
                      <button onClick={() => dispatch(updateQuantity({ slug: item.slug, qty: item.quantity - 1 }))} disabled={item.quantity <= 1}
                        className="w-7 h-7 flex items-center justify-center text-xs text-[#1A1A1A] hover:bg-[#F0EFEC] transition rounded-l-[8px] disabled:opacity-30">−</button>
                      <span className="w-8 text-center text-[0.75rem] font-medium text-[#1A1A1A] border-x border-[#D4D0C8] h-7 flex items-center justify-center">{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ slug: item.slug, qty: item.quantity + 1 }))} disabled={item.quantity >= item.maxQuantity || unavailableSlugs.has(item.slug)}
                        className="w-7 h-7 flex items-center justify-center text-xs text-[#1A1A1A] hover:bg-[#F0EFEC] transition rounded-r-[8px] disabled:opacity-30">+</button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[0.75rem] font-sans font-medium text-[#1A1A1A]">₹{(item.price * item.quantity).toLocaleString()}</span>
                      <button onClick={() => dispatch(removeItem(item.slug))} className="text-[#B8B4AD] hover:text-red-500 transition text-xs">
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:w-[340px] flex-shrink-0">
            <div className="lg:sticky lg:top-28 bg-white rounded-[14px] p-6 border border-[#E8E6E1]">
              <h3 className="text-[0.5rem] font-sans font-medium uppercase tracking-[0.15em] text-[#B8B4AD] mb-4">Order Summary</h3>
              <div className="space-y-2.5 text-[0.75rem]">
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                  <span className="text-[#1A1A1A]">₹{subtotal.toLocaleString()}</span>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Savings</span>
                    <span>−₹{savings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6B6B6B]">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="border-t border-[#E8E6E1] pt-2.5 mt-2.5 flex justify-between text-[0.9rem] font-sans font-medium text-[#1A1A1A]">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
              </div>
              {unavailableSlugs.size > 0 && (
                <div className="mt-3 text-[0.65rem] text-red-600 bg-red-50 p-2.5 rounded-lg text-center font-medium">
                  <i className="fas fa-exclamation-circle mr-1" /> Some items are unavailable. Remove them to proceed.
                </div>
              )}
              <Link
                to={`/checkout?items=${encodeURIComponent(items.map(i => `${i.slug}:${i.quantity}`).join(","))}`}
                className={`mt-3 w-full bg-[#1A1A1A] text-white text-sm font-sans font-medium py-3.5 px-6 rounded-[10px] transition block text-center ${
                  unavailableSlugs.size > 0 ? 'opacity-40 pointer-events-none' : 'hover:bg-[#333]'
                }`}
              >
                Proceed to Checkout
              </Link>
              <p className="text-center text-[0.55rem] text-[#B8B4AD] mt-2">
                <i className="fas fa-lock mr-1" /> Secure checkout · COD available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
