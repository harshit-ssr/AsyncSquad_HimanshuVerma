"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { Leaf, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const result = await login(form.email, form.password);
    if (result.error) { setError(result.error); return; }
    const dest = result.role === "seller" ? "/seller" : result.role === "admin" ? "/admin" : "/buyer";
    router.push(dest);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ backgroundColor: "#2A5F1E" }}>
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-serif text-3xl font-bold" style={{ color: "#1C1208" }}>Welcome back</h1>
          <p className="mt-2 text-sm" style={{ color: "#6B5747" }}>Sign in to your EcoMarket account</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#3D2B1F" }}>Email address</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="field" placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#3D2B1F" }}>Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="field pr-11" placeholder="Your password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9E8B7D" }}>
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg p-3 text-sm font-medium" style={{ backgroundColor: "#FBE9E2", color: "#9A4A2C" }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-wait">
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm" style={{ color: "#6B5747" }}>
          New to EcoMarket?{" "}
          <Link href="/signup" className="font-semibold hover:underline" style={{ color: "#2A5F1E" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
