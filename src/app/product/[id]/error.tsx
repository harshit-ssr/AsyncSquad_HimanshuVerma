"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product detail error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
      <p className="text-gray-500 mb-6 max-w-md">We couldn't load the product details. It might have been deleted or there was a network error.</p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition"
      >
        Try again
      </button>
    </div>
  );
}
