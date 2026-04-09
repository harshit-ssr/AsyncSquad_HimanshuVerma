export default function Loading() {
  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 animate-pulse">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-xl w-40"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-200 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 h-64 bg-gray-200 rounded-3xl animate-pulse"></div>
        <div className="lg:col-span-3 h-80 bg-gray-200 rounded-3xl animate-pulse"></div>
      </div>
    </div>
  );
}
