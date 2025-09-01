import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const getVisiblePages = () => {
    // Always show three page numbers: previous, current, next
    let pages = [];
    if (totalPages <= 1) return [1];
    if (currentPage === 1) {
      pages = [1, 2, 3].filter(p => p <= totalPages);
    } else if (currentPage === totalPages) {
      pages = [totalPages - 2, totalPages - 1, totalPages].filter(p => p > 0);
    } else {
      pages = [currentPage - 1, currentPage, currentPage + 1].filter(p => p > 0 && p <= totalPages);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <section className="py-12 sm:py-16 md:py-20 relative overflow-hidden">
      {/* Glass Morphism Container */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      
      <div className="container mx-auto px-3 sm:px-4 relative">
  <div className="flex flex-row items-center justify-between w-full px-2 sm:px-8">
          {/* Prev Button left */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="group flex items-center justify-center space-x-2 px-6 py-3 text-base font-semibold rounded-xl border-2 border-orange-200 bg-white text-orange-700 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md w-24 sm:w-auto mr-4 sm:mr-8"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Prev</span>
          </button>

          {/* Page Numbers center - straight line for mobile */}
          <div className="flex flex-row items-center justify-center gap-2 mx-0 sm:mx-2">
            {getVisiblePages().map((page, index) => (
              <div key={index}>
                {page === "..." ? (
                  <span className="px-1 text-orange-200 text-base select-none font-semibold opacity-70">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 p-0 text-base sm:text-lg font-bold rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400
                      ${page === currentPage
                        ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-500 shadow-[0_4px_16px_rgba(255,165,0,0.18)] scale-110"
                        : "bg-white text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300 active:bg-orange-50"}
                    `}
                    style={page === currentPage ? { boxShadow: '0 0 16px 2px rgba(255,165,0,0.18)' } : {}}
                    aria-current={page === currentPage ? "page" : undefined}
                  >
                    {page}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Next Button right */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="group flex items-center justify-center space-x-2 px-6 py-3 text-base font-semibold rounded-xl border-2 border-orange-200 bg-white text-orange-700 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md w-24 sm:w-auto ml-4 sm:ml-8"
          >
            <span>Next</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
  {/* End pagination row */}
        </div>
        
        {/* Page Info */}
        <div className="text-center mt-4 sm:mt-6">
          <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/50 backdrop-blur-md rounded-full border border-orange-200/40 shadow-card">
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full animate-pulse-slow" />
            <span className="text-xs sm:text-sm font-medium text-orange-700">
              Page {currentPage} of {totalPages}
            </span>
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full animate-pulse-slow" />
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-20 w-16 h-16 bg-orange-200/20 rounded-full blur-xl" />
        <div className="absolute bottom-10 right-20 w-20 h-20 bg-orange-300/20 rounded-full blur-2xl" />
      </div>
    </section>
  );
}
