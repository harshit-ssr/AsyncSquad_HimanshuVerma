"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { getProductById, updateProduct } from "@/lib/services/products";
import { Product } from "@/types";
import { ArrowLeft, Loader2, CheckCircle, Lock, UploadCloud, ImageIcon, X } from "lucide-react";
import Link from "next/link";

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) return URL.createObjectURL(file);
  const data = await res.json();
  return data.url as string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState({ title: "", description: "", price: "", stock: "", tags: "" });
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) { router.push("/login"); return; }
    if (user.role !== "seller" && user.role !== "admin") { router.push("/buyer"); return; }

    getProductById(productId).then((p) => {
      if (!p) { setError("Product not found"); setLoading(false); return; }
      if (p.seller_id !== user.id && user.role !== "admin") { setError("You don't own this product"); setLoading(false); return; }
      setProduct(p);
      setForm({
        title: p.title,
        description: p.description,
        price: String(p.price),
        stock: String(p.stock_quantity),
        tags: (p.eco_tags ?? []).join(", "),
      });
      setImageUrl(p.image_url || null);
      setImagePreview(p.image_url || null);
      setLoading(false);
    }).catch(() => { setError("Failed to load product"); setLoading(false); });
  }, [mounted, user, productId, router]);

  if (!mounted) return null;

  if (!user) {
    return (
      <div className="section py-24 text-center">
        <Lock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900">Sign in required</h2>
        <Link href="/login" className="text-green-600 font-bold hover:underline">Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="section py-24 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-900">{error}</h2>
        <Link href="/seller/products" className="text-green-600 font-bold hover:underline">Back to Products</Link>
      </div>
    );
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    try { setImageUrl(await uploadImage(file)); }
    catch { alert("Upload failed. Using local preview."); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading || !product) return;

    setSaving(true);
    try {
      const tags = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
      await updateProduct(product.id, {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock) || 0,
        eco_tags: tags,
        image_url: imageUrl ?? undefined,
      });
      setDone(true);
      setTimeout(() => router.push("/seller/products"), 2000);
    } catch (err) {
      console.error("Failed to update product:", err);
      alert("Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-5">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold mb-2 text-gray-900">Product Updated!</h2>
        <p className="text-gray-500">Changes are live. Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-2xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/seller/products" className="p-2 rounded-xl hover:bg-gray-100 transition">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Edit Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update your product details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Image upload */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Product Photo</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all border-2 border-dashed ${dragOver ? "border-green-500 bg-green-50" : imagePreview ? "border-green-300 bg-green-50/50" : "border-gray-200 bg-gray-50"}`}
          >
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

            {imagePreview ? (
              <div className="relative h-56">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                )}
                <button type="button" onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageUrl(null); }} className="absolute top-3 right-3 rounded-full p-1.5 text-white bg-black/50 hover:bg-black/70 transition">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center gap-2 text-gray-400">
                <div className="w-14 h-14 rounded-2xl bg-gray-200 flex items-center justify-center mb-1">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <p className="font-semibold text-sm text-gray-500">Drop image here or click to upload</p>
                <p className="text-xs flex items-center gap-1"><UploadCloud className="w-3 h-3" /> PNG, JPG, WEBP up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Product Title</label>
          <input
            required type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
            placeholder="e.g. Handmade Beeswax Candle"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
          <textarea
            required rows={4}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition resize-none"
            placeholder="Tell the story of your product…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Price & Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Price (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-sm text-gray-400">₹</span>
              <input
                required type="number" min="1" step="1"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
                placeholder="499"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Stock Qty</label>
            <input
              required type="number" min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
              placeholder="10"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </div>
        </div>

        {/* Eco Tags */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Eco Tags <span className="font-normal text-xs text-gray-400">(comma separated)</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 transition"
            placeholder="e.g. handmade, plastic-free, upcycled"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>

        <div className="flex gap-3">
          <Link href="/seller/products" className="flex-1 text-center py-3 px-4 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition text-sm">
            Cancel
          </Link>
          <button type="submit" disabled={uploading || saving} className="flex-1 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold transition disabled:opacity-60 disabled:cursor-wait text-sm flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
