import { getProductById } from "@/lib/services/products";
import { notFound } from "next/navigation";
import AddToCartButton from "@/components/AddToCartButton";
import { Leaf, Store, Package } from "lucide-react";

function ProductDetailImage({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2" style={{ backgroundColor: "#E8F5E3" }}>
        <Leaf className="w-16 h-16" style={{ color: "#2A5F1E", opacity: 0.3 }} />
        <span className="text-sm font-medium" style={{ color: "#6B5747" }}>No image available</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
  );
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-10 max-w-5xl mx-auto">
      <div className="card overflow-hidden flex flex-col md:flex-row" style={{ borderRadius: "24px" }}>
        <div className="md:w-1/2 h-64 sm:h-72 md:h-auto bg-gray-50 overflow-hidden" style={{ minHeight: "280px" }}>
          <ProductDetailImage src={product.image_url} alt={product.title} />
        </div>

        <div className="md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col">
          {product.seller?.store_name && (
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Store className="w-4 h-4" style={{ color: "#9E8B7D" }} />
              <span className="text-sm font-semibold uppercase tracking-widest" style={{ color: "#9E8B7D" }}>
                {product.seller.store_name}
              </span>
            </div>
          )}

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4 sm:mb-5" style={{ color: "#1C1208" }}>
            {product.title}
          </h1>

          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {product.eco_tags.map((tag) => (
              <span key={tag} className="eco-tag">
                <Leaf className="w-2.5 h-2.5" /> {tag}
              </span>
            ))}
          </div>

          <p className="leading-relaxed text-sm sm:text-base mb-6 sm:mb-8" style={{ color: "#6B5747" }}>{product.description}</p>

          <div className="flex items-center gap-6 mb-6 sm:mb-8 pb-6 sm:pb-8" style={{ borderBottom: "1px solid #E5DDD5" }}>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" style={{ color: "#9E8B7D" }} />
              <span className="text-sm font-medium" style={{ color: product.stock_quantity > 0 ? "#2A5F1E" : "#B85C38" }}>
                {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : "Out of stock"}
              </span>
            </div>
          </div>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: "#B85C38" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              <span className="text-sm" style={{ color: "#9E8B7D" }}>incl. all taxes</span>
            </div>
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
