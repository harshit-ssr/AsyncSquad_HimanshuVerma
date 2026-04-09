"use client";

import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/lib/authStore";
import { useOrderStore } from "@/lib/orderStore";
import { useRouter } from "next/navigation";
import { ShoppingBag, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const STATUS_MAP = {
  pending:    { label: "Pending",    Icon: Clock,         bg: "#FBE9E2", color: "#9A4A2C" },
  processing: { label: "Processing", Icon: Clock,         bg: "#EDEDF5", color: "#4a4a6a" },
  completed:  { label: "Delivered",  Icon: CheckCircle,   bg: "#E8F5E3", color: "#2A5F1E" },
  cancelled:  { label: "Cancelled",  Icon: XCircle,       bg: "#FBE9E2", color: "#9A4A2C" },
};

export default function BuyerOrdersPage() {
  const { user } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const router = useRouter();
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (!mounted.current) return;
    if (!user) { router.push("/login"); return; }
    fetchOrders(user.id);
  }, [user, router, fetchOrders]);

  if (!mounted.current) return null;

  if (!user) {
    return (
      <div className="section py-24 text-center">
        <p className="font-serif text-2xl font-bold mb-4" style={{ color: "#111118" }}>Sign in to view your orders</p>
        <Link href="/login" className="btn-primary">Go to Login</Link>
      </div>
    );
  }

  const myOrders = orders.filter(o => o.buyer_id === user.id);

  return (
    <div className="px-6 sm:px-10 lg:px-16 py-10 max-w-screen-xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold" style={{ color: "#111118" }}>My Orders</h1>
        <p className="mt-2" style={{ color: "#6B5747" }}>Track everything you&apos;ve ordered from local artisans.</p>
      </div>
      
      {myOrders.length === 0 ? (
        <div className="step-card p-16 text-center">
          <ShoppingBag className="w-14 h-14 mx-auto mb-5" style={{ color: "#E5DDD5" }} />
          <h3 className="font-serif text-2xl font-bold mb-2" style={{ color: "#111118" }}>No orders yet</h3>
          <p className="mb-6" style={{ color: "#6B5747" }}>Start exploring the market to place your first order.</p>
          <Link href="/buyer" className="btn-primary">Browse Market</Link>
        </div>
      ) : (
        <div className="space-y-5">
          {myOrders.map((order) => {
            const { label, Icon, bg, color } = STATUS_MAP[order.status];
            return (
              <div key={order.id} className="step-card p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-5" style={{ borderBottom: "1px solid #E5E5EE" }}>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "#111118" }}>#{order.id.slice(0, 8)}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9E8B7D" }}>Placed on {order.date}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: bg, color }}>
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <span style={{ color: "#3D2B1F" }}>{item.title} <span className="text-xs" style={{ color: "#9E8B7D" }}>×{item.qty}</span></span>
                      <span className="font-semibold" style={{ color: "#B85C38" }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4" style={{ borderTop: "1px solid #E5E5EE" }}>
                  <span className="text-sm font-semibold" style={{ color: "#6B5747" }}>Order Total</span>
                  <span className="font-bold text-lg" style={{ color: "#111118" }}>₹{order.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
