"use client";

import { useEffect, useState, useRef } from "react";
import { Package, Plus, Pencil, Trash2, Search, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { getProductsBySeller, deleteProduct } from "@/lib/services/products";
import { Product } from "@/types";
import { useRouter } from "next/navigation";

export default function SellerProductsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => { mounted.current = true; }, []);

  useEffect(() => {
    if (!mounted.current) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "seller" && user.role !== "admin") { router.push("/buyer"); return; }

    setLoading(true);
    getProductsBySeller(user.id).then(setProducts).catch(console.error).finally(() => setLoading(false));
  }, [user, router]);

  if (!mounted.current) return null;

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setShowDeleteConfirm(null);
    } catch (e) {
      console.error("Failed to delete product:", e);
      alert("Failed to delete product. It may have existing orders.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="py-8 animate-in fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/seller" className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold text-gray-900">My Products</h1>
          <p className="text-gray-500 text-sm">{products.length} product{products.length !== 1 ? "s" : ""} listed</p>
        </div>
        <Link
          href="/seller/products/new"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20 active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {search ? "No products match your search" : "No products yet"}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {search ? "Try a different search term." : "Add your first product to get started!"}
          </p>
          {!search && (
            <Link href="/seller/products/new" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold transition text-sm">
              <Plus className="w-4 h-4" /> Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 sm:p-5">
              <div className="flex items-center gap-4">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-gray-300" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{p.title}</h3>
                  <p className="text-sm text-gray-500 truncate mt-0.5">{p.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-bold text-green-700 text-sm">₹{Number(p.price).toLocaleString("en-IN")}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className={`text-xs font-semibold ${p.stock_quantity > 0 ? "text-blue-600" : "text-red-500"}`}>
                      {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : "Out of stock"}
                    </span>
                    {p.eco_tags?.length > 0 && (
                      <>
                        <span className="text-xs text-gray-400 hidden sm:inline">•</span>
                        <div className="hidden sm:flex items-center gap-1.5">
                          {p.eco_tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">{tag}</span>
                          ))}
                          {p.eco_tags.length > 2 && <span className="text-xs text-gray-400">+{p.eco_tags.length - 2}</span>}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/seller/products/${p.id}/edit`}
                    className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition"
                    title="Edit product"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>

                  {showDeleteConfirm === p.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition disabled:opacity-50"
                      >
                        {deletingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(p.id)}
                      className="p-2.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
