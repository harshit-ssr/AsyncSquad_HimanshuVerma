"use client";

import { useCartStore } from "@/lib/cart";
import { useAuthStore } from "@/lib/authStore";
import { useOrderStore } from "@/lib/orderStore";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Truck, CreditCard, Trash2, Store } from "lucide-react";

export default function CheckoutPage() {
  const { items, getTotal, clearCart, removeItem } = useCartStore();
  const { user } = useAuthStore();
  const { addOrder } = useOrderStore();
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role === "seller") return;

    setError("");
    setLoading(true);

    try {
      // Group items by seller — use first item's seller_id
      // (In a full app you'd split by seller, but for MVP assume single seller per order)
      const sellerId = items[0]?.seller_id;

      if (!sellerId) {
        setError("Unable to determine the seller for this order.");
        setLoading(false);
        return;
      }

      await addOrder({
        buyer_id: user.id,
        seller_id: sellerId,
        total: getTotal(),
        items: items.map(i => ({
          title: i.title,
          qty: i.cartQuantity,
          price: i.price,
          product_id: i.id,
        })),
      });

      setPlaced(true);
      clearCart();
      setTimeout(() => {
        router.push("/buyer/orders");
      }, 3000);
    } catch (e) {
      console.error("Checkout failed:", e);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500 px-4">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h2>
        <p className="text-gray-500 text-lg text-center">Thank you for supporting sustainable artisans.</p>
        <p className="text-gray-400 mt-4 text-sm animate-pulse">Redirecting to your orders...</p>
      </div>
    );
  }

  if (user?.role === "seller") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 border border-amber-200">
          <Store className="w-10 h-10 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sellers Cannot Purchase</h2>
        <p className="text-gray-500 text-center max-w-md">Your account is registered as a seller. Please log in with a buyer account to shop.</p>
        <button onClick={() => router.push("/seller")} className="mt-6 px-6 py-2 bg-amber-50 text-amber-700 rounded-full font-medium hover:bg-amber-100 transition border border-amber-200">
          Go to Seller Dashboard
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
          <Truck className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <button onClick={() => router.push("/buyer")} className="mt-4 px-6 py-2 bg-green-50 text-green-700 rounded-full font-medium hover:bg-green-100 transition">
          Discover Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <div className="md:w-2/3 bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40">
          <h2 className="text-xl font-bold mb-6 text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-600" /> Order Summary
          </h2>
          <div className="space-y-1 divide-y divide-gray-50">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 group">
                <div className="flex items-center gap-4">
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-xl" />
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{item.title}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.cartQuantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-gray-900">₹{(item.price * item.cartQuantity).toLocaleString("en-IN")}</span>
                  <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-400 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:w-1/3">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 sticky top-24 shadow-2xl shadow-green-600/5">
            <h3 className="text-xl font-bold mb-6 text-gray-900">Price Details</h3>
            <div className="flex justify-between mb-3 text-gray-600">
              <span className="text-sm">Subtotal</span>
              <span className="font-bold text-gray-900">₹{getTotal().toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between mb-3 text-gray-600">
              <span className="text-sm flex items-center gap-1">
                Delivery{" "}
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">ECO</span>
              </span>
              <span className="font-bold text-green-600">FREE</span>
            </div>
            <div className="border-t border-gray-100 my-6 pt-6 flex justify-between items-end">
              <span className="font-bold text-gray-500">Total</span>
              <div className="text-right">
                <span className="font-extrabold text-3xl text-green-600">₹{getTotal().toLocaleString("en-IN")}</span>
                <p className="text-xs text-gray-400 mt-0.5">incl. GST</p>
              </div>
            </div>

            {error && (
              <div className="rounded-lg p-3 mb-4 text-sm font-medium" style={{ backgroundColor: "#FBE9E2", color: "#9A4A2C" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-4 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-xl shadow-green-600/20 disabled:opacity-60 disabled:cursor-wait"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
            <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
              Your order will be saved to the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
