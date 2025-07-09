export default function WorkdaysLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4 h-full flex flex-col min-h-[600px]">
        {/* Header */}
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="h-8 w-32 bg-white/20 rounded-md animate-pulse"></div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-white/10 rounded-md animate-pulse"></div>
              <div className="h-8 w-8 bg-white/10 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="h-12 w-full bg-white/10 rounded-lg animate-pulse"></div>
        </div>

        {/* Work Days List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-white/20 rounded"></div>
                  <div className="h-6 w-32 bg-white/20 rounded-md"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-white/10 rounded-lg"></div>
                  <div className="h-8 w-8 bg-white/10 rounded-lg"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-white/20 rounded-md"></div>
                  <div className="h-4 w-full bg-white/10 rounded-md"></div>
                  <div className="h-4 w-3/4 bg-white/10 rounded-md"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-white/20 rounded-md"></div>
                  <div className="h-4 w-full bg-white/10 rounded-md"></div>
                  <div className="h-4 w-2/3 bg-white/10 rounded-md"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="h-4 w-16 bg-white/10 rounded-md"></div>
                  <div className="h-4 w-20 bg-white/10 rounded-md"></div>
                </div>
                <div className="h-3 w-12 bg-white/10 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
