"use client";

import { useEffect, useState, useRef } from "react";
import { Package, TrendingUp, IndianRupee, Plus, ChevronRight, Clock, Users, Loader2, Pencil, XCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { getProductsBySeller } from "@/lib/services/products";
import { getSellerOrders } from "@/lib/services/orders";
import { updateOrderStatus } from "@/lib/services/orders";
import { Product, Order }  from "@/types";
import { useRouter } from "next/navigation";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  processing: "bg-orange-50 text-orange-700 border border-orange-200",
  completed: "bg-green-50 text-green-700 border border-green-200",
  cancelled: "bg-red-50 text-red-700 border border-red-200",
};

export default function SellerDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => { mounted.current = true; }, []);

  useEffect(() => {
    if (!mounted.current) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "seller" && user.role !== "admin") { router.push("/buyer"); return; }

    getProductsBySeller(user.id).then(setProducts).catch(console.error);
    getSellerOrders(user.id).then(setOrders).catch(console.error);
   
  }, [user, router]);

  if (!mounted.current) return null;

  const totalRevenue = orders
    .filter(o => o.status === "completed")
    .reduce((acc, o) => acc + Number(o.total_amount), 0);

  const pendingCount = orders.filter(o => o.status === "pending").length;

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o));
    } catch (e) {
      console.error("Failed to update order:", e);
      alert(`Failed to update order status. Please try again.`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="py-8 animate-in fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your store and fulfill orders.</p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 active:scale-95 w-full sm:w-auto justify-center"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-green-600", bg: "bg-green-50" },
          { label: "Active Products", value: String(products.length), icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pending Orders", value: String(pendingCount), icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Total Orders", value: String(orders.length), icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" /> Active Products
              </h2>
              <Link href="/seller/products/new" className="text-green-600 hover:text-green-700 transition">
                <Plus className="w-5 h-5" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {products.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No products yet. Add your first product!</div>
              ) : (
                products.slice(0, 5).map((p) => (
                  <Link key={p.id} href={`/seller/products/${p.id}/edit`} className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition group cursor-pointer">
                    {p.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image_url} alt={p.title} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{p.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.stock_quantity} in stock</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-gray-900 text-sm">₹{Number(p.price).toLocaleString("en-IN")}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-gray-500 transition" />
                  </Link>
                ))
              )}
            </div>
            {products.length > 5 && (
              <div className="p-4 border-t border-gray-50">
                <Link href="/seller/products" className="block w-full text-center text-sm text-green-600 font-semibold hover:text-green-700 transition py-1">
                  View all {products.length} products →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-500" /> Recent Orders
              </h2>
              <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
                {pendingCount} pending
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No orders yet.</div>
            ) : (
              <>
                <div className="sm:hidden divide-y divide-gray-50">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-gray-900 text-sm">#{order.id.slice(0, 8)}</p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status]}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items?.map(i => `${i.product?.title ?? "Product"} (×${i.quantity})`).join(", ")}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">₹{Number(order.total_amount).toLocaleString("en-IN")}</span>
                        <div className="flex items-center gap-2">
                          {updatingOrderId === order.id ? (
                            <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                          ) : (
                            <>
                              {order.status === "pending" && (
                                <>
                                  <button onClick={() => handleUpdateStatus(order.id, "processing")} className="text-xs text-green-600 font-bold hover:underline">Process →</button>
                                  <button onClick={() => handleUpdateStatus(order.id, "cancelled")} className="text-xs text-red-500 font-bold hover:underline">Cancel</button>
                                </>
                              )}
                              {order.status === "processing" && (
                                <button onClick={() => handleUpdateStatus(order.id, "completed")} className="text-xs text-green-600 font-bold hover:underline">Complete →</button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Order</th>
                        <th className="px-6 py-4">Items</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50/30 transition">
                          <td className="px-6 py-4 font-bold text-gray-900 text-sm">#{order.id.slice(0, 8)}</td>
                          <td className="px-6 py-4 text-gray-600 text-sm max-w-[200px] truncate">
                            {order.items?.map(i => `${i.product?.title ?? "Product"} (×${i.quantity})`).join(", ")}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">₹{Number(order.total_amount).toLocaleString("en-IN")}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[order.status]}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {updatingOrderId === order.id ? (
                              <Loader2 className="w-4 h-4 text-green-600 animate-spin inline-block" />
                            ) : order.status === "pending" ? (
                              <div className="flex items-center justify-end gap-3">
                                <button onClick={() => handleUpdateStatus(order.id, "processing")} className="text-green-600 font-bold text-sm hover:underline">Process</button>
                                <button onClick={() => handleUpdateStatus(order.id, "cancelled")} className="text-red-500 font-bold text-sm hover:underline">Cancel</button>
                              </div>
                            ) : order.status === "processing" ? (
                              <button onClick={() => handleUpdateStatus(order.id, "completed")} className="text-green-600 font-bold text-sm hover:underline">Complete</button>
                            ) : order.status === "cancelled" ? (
                              <span className="text-red-400 text-sm font-bold">Cancelled ✕</span>
                            ) : (
                              <span className="text-gray-300 text-sm font-bold">Done ✓</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
