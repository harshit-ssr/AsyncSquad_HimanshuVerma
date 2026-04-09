export default function Loading() {
  return (
    <div className="px-4 sm:px-6 md:px-10 lg:px-16 py-12 max-w-screen-xl mx-auto">
      <div className="animate-pulse mb-8">
        <div className="h-10 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-64"></div>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl h-72 animate-pulse bg-gray-200" style={{ backgroundColor: "#E5E5EE" }} />
        ))}
      </div>
    </div>
  );
}
