import { useState, useEffect, Suspense } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_FLOW = ["Pending", "Confirmed", "Packed", "Shipped", "Out For Delivery", "Delivered"];

const statusLabels = {
  Pending: "Order Placed", Confirmed: "Confirmed", Packed: "Packed",
  Shipped: "Shipped", "Out For Delivery": "Out For Delivery", Delivered: "Delivered", Cancelled: "Cancelled",
};

const statusBadgeColors = {
  Pending: "bg-amber-100 text-amber-800",
  Confirmed: "bg-blue-100 text-blue-800",
  Packed: "bg-indigo-100 text-indigo-800",
  Shipped: "bg-purple-100 text-purple-800",
  "Out For Delivery": "bg-orange-100 text-orange-800",
  Delivered: "bg-emerald-100 text-emerald-800",
  Cancelled: "bg-red-100 text-red-800",
};

function TrackOrderContent() {
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) setOrderNumber(orderParam);
  }, [searchParams]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setOrders([]);
    setSelectedOrder(null);

    if (!phone.trim()) { setError("Enter your phone number to find your orders"); return; }
    if (!/^\d{10}$/.test(phone.trim())) { setError("Enter a valid 10-digit phone number"); return; }

    setLoading(true);
    try {
      const params = new URLSearchParams({ phone: phone.trim() });
      if (orderNumber.trim()) params.set("orderNumber", orderNumber.trim());

      const res = await fetch(`/api/orders/track?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "No orders found");

      setOrders(data.orders);

      if (data.single && data.orders.length === 1) {
        setSelectedOrder(data.orders[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (targetOrder) => {
    if (!confirm(`Cancel order ${targetOrder.orderNumber}?`)) return;
    setCancelling(true);
    try {
      const res = await fetch("/api/orders/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: targetOrder.orderNumber, status: "Cancelled" }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Cannot cancel");
      await handleSearch();
      setSelectedOrder((prev) =>
        prev?.orderNumber === targetOrder.orderNumber
          ? { ...prev, status: "Cancelled" }
          : prev
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = (status) => status === "Pending" || status === "Confirmed";
  const isCancelled = (status) => status === "Cancelled";

  return (
    <div className="min-h-screen bg-ivory">
      <div className="bg-gradient-to-r from-emerald-deep to-teal-luxury text-white text-center py-10 px-5">
        <h1 className="font-serif text-[clamp(1.5rem,4vw,2rem)] mb-1.5">Track Your Order</h1>
        <p className="text-white/50 text-sm">Enter your phone number to find all your orders</p>
      </div>

      <div className="max-w-[560px] mx-auto px-5 -mt-5 pb-10">
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <form onSubmit={handleSearch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">
                  Phone Number <span className="text-red-400">*</span>
                </label>
              <input
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Your 10-digit mobile number"
                maxLength={10}
                className="w-full px-3.5 py-3 border-2 border-gold-soft/30 rounded-xl text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                Order Number <span className="text-muted font-normal">(optional — leave blank to see all)</span>
              </label>
              <input
                value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g., ORD-2026-000001"
                className="w-full px-3.5 py-3 border-2 border-gold-soft/30 rounded-xl text-sm outline-none bg-ivory focus:bg-white focus:border-emerald-deep transition"
              />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-emerald-deep text-white font-bold text-sm py-3.5 rounded-[14px] uppercase tracking-wider shadow-[0_4px_14px_rgba(11,58,66,0.2)] hover:bg-teal-luxury disabled:opacity-60 transition">
              {loading ? "Searching..." : "Find My Orders"}
            </button>
          </form>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mt-4">{error}</div>}

        {loading && <div className="flex justify-center mt-8"><div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" /></div>}

        {orders.length > 1 && !selectedOrder && !loading && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-600">
              {orders.length} order{orders.length > 1 ? "s" : ""} found
            </h3>
            {orders.map((o) => (
              <button
                key={o.orderNumber}
                onClick={() => setSelectedOrder(o)}
                className="w-full text-left bg-white rounded-xl p-4 shadow-sm border border-gray-50 hover:border-emerald-deep/20 transition cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-400">Order</div>
                    <div className="font-bold text-sm">{o.orderNumber}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${statusBadgeColors[o.status] || "bg-gray-100 text-gray-800"}`}>
                    {o.status}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{new Date(o.createdAt).toLocaleDateString("en-IN")}</span>
                  <span className="font-semibold text-gray-600">₹{o.totalAmount.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </motion.div>
        )}

        <AnimatePresence>
          {selectedOrder && !loading && (
            <motion.div
              key={selectedOrder.orderNumber}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mt-5 space-y-4"
            >
              {orders.length > 1 && (
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs text-emerald-deep font-semibold hover:underline"
                >
                  ← Back to all orders
                </button>
              )}

              <div className={`rounded-2xl p-6 border shadow-sm ${isCancelled(selectedOrder.status) ? "bg-red-50 border-red-200" : "bg-white border-gold-soft/10 shadow-[0_2px_8px_rgba(11,58,66,0.04)]"}`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Order Number</div>
                    <div className="font-bold text-sm">{selectedOrder.orderNumber}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeColors[selectedOrder.status] || "bg-gray-100 text-gray-800"}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
                  <div><span className="text-gray-400">Product:</span> {selectedOrder.productName}</div>
                  <div><span className="text-gray-400">Qty:</span> {selectedOrder.quantity}</div>
                  <div><span className="text-gray-400">Total:</span> ₹{selectedOrder.totalAmount.toLocaleString()}</div>
                  <div><span className="text-gray-400">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString("en-IN")}</div>
                  {selectedOrder.trackingNumber && <div className="col-span-2"><span className="text-gray-400">Tracking:</span> {selectedOrder.trackingNumber}</div>}
                </div>

                {selectedOrder.expectedDelivery && !isCancelled(selectedOrder.status) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                    <span className="text-gray-400">Expected Delivery:</span>{" "}
                    <span className="font-semibold">
                      {new Date(selectedOrder.expectedDelivery).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}
                    </span>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                  <span className="text-gray-400">Name:</span> {selectedOrder.customer.fullName}<br />
                  <span className="text-gray-400">Phone:</span> {selectedOrder.customer.phone}
                </div>

                {canCancel(selectedOrder.status) && (
                  <button
                    onClick={() => handleCancel(selectedOrder)}
                    disabled={cancelling}
                    className="mt-4 w-full py-2.5 border-2 border-red-400 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-500 hover:text-white disabled:opacity-50 transition"
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>

              {!isCancelled(selectedOrder.status) && (
                <div className="bg-white rounded-2xl p-6 shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10">
                  <h3 className="text-sm font-bold text-heading mb-5">Order Progress</h3>
                  {STATUS_FLOW.map((status, idx) => {
                    const currentIdx = STATUS_FLOW.indexOf(selectedOrder.status);
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={status} className="flex items-start mb-4 last:mb-0">
                        <div className="flex flex-col items-center mr-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isCompleted ? "bg-emerald-deep text-white" : "bg-gray-200 text-gray-400"}`}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          {idx < STATUS_FLOW.length - 1 && (
                            <div className={`w-0.5 h-6 mt-0.5 ${isCompleted ? "bg-emerald-deep" : "bg-gray-200"}`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <div className={`text-sm ${isCurrent ? "font-bold text-heading" : isCompleted ? "font-semibold" : "text-muted"}`}>
                            {statusLabels[status]}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedOrder.statusHistory.length > 0 && (
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(11,58,66,0.04)] border border-gold-soft/10">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Status History</h3>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((h, idx) => (
                      <div key={idx} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                        <span>
                          {h.oldStatus ? (
                            <>From <strong>{h.oldStatus}</strong> to <strong>{h.newStatus}</strong></>
                          ) : (
                            <><strong>{h.newStatus}</strong> (initial)</>
                          )}
                        </span>
                        <span className="text-gray-400">{new Date(h.changedAt).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mt-5">
          <Link to="/" className="text-emerald-deep text-sm hover:underline">← Back to store</Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="w-9 h-9 border-3 border-gray-200 border-t-emerald-deep rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
