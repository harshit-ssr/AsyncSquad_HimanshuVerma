"use client";

import { useEffect, useState, useRef } from "react";
import { BarChart, Users, ShoppingBag, ShieldCheck, IndianRupee } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const mounted = useRef(false);

  useEffect(() => { mounted.current = true; }, []);

  useEffect(() => {
    if (!mounted.current) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "admin") { router.push("/buyer"); return; }

    const fetchStats = async () => {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total_amount"),
      ]);

      const totalRevenue = (ordersRes.data ?? []).reduce(
        (acc: number, o: { total_amount: number }) => acc + Number(o.total_amount), 0
      );

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalProducts: productsRes.count ?? 0,
        totalOrders: ordersRes.data?.length ?? 0,
        totalRevenue,
      });
    };

    fetchStats().catch(console.error);
   
  }, [user, router]);

  if (!mounted.current) return null;

  return (
    <div className="py-8 animate-in fade-in max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-indigo-600" /> Platform Admin
        </h1>
        <p className="text-gray-500 mt-2">Monitor marketplace activity and verify sellers.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="glass bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-600/5 card-hover">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalUsers.toLocaleString("en-IN")}</h3>
            </div>
          </div>
        </div>
        
        <div className="glass bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-green-600/5 card-hover">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-green-50 text-green-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Eco Products</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalProducts.toLocaleString("en-IN")}</h3>
            </div>
          </div>
        </div>
        
        <div className="glass bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-blue-600/5 card-hover">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 text-blue-600">
              <BarChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalOrders.toLocaleString("en-IN")}</h3>
            </div>
          </div>
        </div>

        <div className="glass bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-amber-600/5 card-hover">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 text-amber-600">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-3xl font-extrabold text-gray-900">₹{stats.totalRevenue.toLocaleString("en-IN")}</h3>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Seller Applications</h2>
      <div className="glass bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
        <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
          <p className="text-gray-500 font-medium">No pending seller applications require approval right now.</p>
        </div>
      </div>
    </div>
  );
}
