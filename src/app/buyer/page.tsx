"use client";

import { useEffect, useState } from "react";
import { useProductStore } from "@/lib/productStore";
import { Product } from "@/types";
import Link from "next/link";
import { LayoutGrid, Map, Search, Leaf } from "lucide-react";
import dynamic from "next/dynamic";

const NearbyMap = dynamic(() => import("@/components/NearbyMap"), { ssr: false });

function ProductImage({ src, alt }: { src?: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ backgroundColor: "#F0F0F8" }}>
        <Leaf className="w-10 h-10" style={{ color: "#6b6b8a", opacity: 0.4 }} />
        <span className="text-xs font-medium" style={{ color: "#9E8B7D" }}>No image</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} onError={() => setErr(true)} className="product-img" loading="lazy" />
  );
}

const ECO_COLORS: Record<string, { bg: string; text: string }> = {
  handmade:       { bg: "#FBE9E2", text: "#9A4A2C" },
  upcycled:       { bg: "#FBE9E2", text: "#9A4A2C" },
  "plastic-free": { bg: "#EDEDF5", text: "#4a4a6a" },
  biodegradable:  { bg: "#EDEDF5", text: "#4a4a6a" },
  organic:        { bg: "#E8F5E3", text: "#2A5F1E" },
  local:          { bg: "#EDE9E3", text: "#6B5747" },
  default:        { bg: "#EDE9E3", text: "#6B5747" },
};
function tagStyle(tag: string) { return ECO_COLORS[tag.toLowerCase()] ?? ECO_COLORS.default; }

export default function BuyerDashboard() {
  const { products, fetchFromDB, usingMock } = useProductStore();
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchFromDB();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!search.trim()) { setFiltered(products); return; }
    const q = search.toLowerCase();
    setFiltered(products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.eco_tags.some(t => t.toLowerCase().includes(q)) ||
      p.seller?.store_name?.toLowerCase().includes(q)
    ));
  }, [search, products]);

  if (!mounted) {
    return (
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl h-72 animate-pulse" style={{ backgroundColor: "#E5E5EE" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-8 sm:py-10 max-w-screen-xl mx-auto">

      <div className="mb-6 sm:mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: "#111118" }}>
          The Market
        </h1>
        <p className="mt-2 text-sm sm:text-base" style={{ color: "#6B5747" }}>
          {filtered.length} sustainable {filtered.length === 1 ? "product" : "products"} from local artisans
        </p>
      </div>

      {usingMock && (
        <div className="mb-6 rounded-lg p-3 text-sm font-medium" style={{ backgroundColor: "#FBE9E2", color: "#9A4A2C" }}>
          Notice: Unable to connect to database. Showing temporary offline products.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#9E8B7D" }} />
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, stores, eco-tags…"
            className="field"
            style={{ paddingLeft: "40px" }}
          />
        </div>

        <div
          className="flex overflow-hidden rounded-xl self-start sm:self-auto shrink-0"
          style={{ border: "1px solid #E5DDD5", backgroundColor: "#FFFFFF" }}
        >
          {[
            { v: "grid" as const, label: "Grid", Icon: LayoutGrid },
            { v: "map"  as const, label: "Map",  Icon: Map },
          ].map(({ v, label, Icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold"
              style={{
                backgroundColor: view === v ? "#252535" : "transparent",
                color: view === v ? "#FFFFFF" : "#6B5747",
                transition: "background-color 0.2s ease, color 0.2s ease",
              }}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>
      </div>

      {view === "map" && (
        <div className="mb-10">
          <NearbyMap products={products} />
        </div>
      )}

      {view === "grid" && (
        filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">{products.length === 0 ? "🌱" : "🌿"}</p>
            <h3 className="font-serif text-2xl font-bold" style={{ color: "#252535" }}>
              {products.length === 0 ? "The shelves are empty — for now" : "Nothing found"}
            </h3>
            <p className="mt-2 max-w-md mx-auto" style={{ color: "#9E8B7D" }}>
              {products.length === 0
                ? "No products have been listed yet. Check back soon — local artisans are setting up shop!"
                : "Try a different search term or browse all products."}
            </p>
            {search.trim() && (
              <button
                onClick={() => setSearch("")}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{ backgroundColor: "#252535", color: "#FFFFFF" }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <article className="product-card flex flex-col h-full">
                  <div className="relative h-44 sm:h-48 overflow-hidden" style={{ borderRadius: "16px 16px 0 0" }}>
                    <ProductImage src={product.image_url} alt={product.title} />

                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      {product.eco_tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: tagStyle(tag).bg, color: tagStyle(tag).text }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 flex-1 flex flex-col">
                    {product.seller?.store_name && (
                      <p
                        className="text-[10px] font-bold uppercase tracking-widest mb-1 sm:mb-1.5"
                        style={{ color: "#9E8B7D" }}
                      >
                        {product.seller.store_name}
                      </p>
                    )}
                    <h3
                      className="font-serif font-bold leading-snug mb-auto text-sm sm:text-base"
                      style={{
                        color: "#111118",
                        transition: "color 0.2s ease",
                      }}
                    >
                      {product.title}
                    </h3>

                    <div
                      className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3"
                      style={{ borderTop: "1px solid #EDEDF5" }}
                    >
                      <span className="font-bold text-base sm:text-lg" style={{ color: "#B85C38" }}>
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.stock_quantity === 0 && (
                        <span className="text-xs font-semibold" style={{ color: "#9E8B7D" }}>
                          Sold out
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
