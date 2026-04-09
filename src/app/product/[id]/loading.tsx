export default function Loading() {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-10 max-w-5xl mx-auto">
      <div className="card overflow-hidden flex flex-col md:flex-row bg-white border border-gray-100 rounded-3xl animate-pulse">
        <div className="md:w-1/2 h-64 sm:h-72 md:h-[500px] bg-gray-200" />
        <div className="md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col gap-4">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="flex gap-2 mb-4">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-24"></div>
          </div>
          <div className="h-24 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-32 border-b border-gray-100 pb-8 mb-8"></div>
          <div className="mt-auto">
            <div className="h-10 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
