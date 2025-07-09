import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function CalendarPageLoading() {
  const WEEKDAY_NAMES = ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"];

  return (
    <div className="container mx-auto">
      {/* Header (if you have one, you can add a skeleton for it here) */}

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Skeleton (Left Column) */}
          <div className="lg:col-span-2">
            <div className="glass-card rounded-2xl p-4 sm:p-6 animate-pulse">
              {/* Header: Month/Year and Navigation */}
              <div className="flex items-center justify-between mb-6">
                <div className="h-8 w-48 bg-white/10 rounded-md"></div>
                <div className="flex space-x-2">
                  <div className="h-10 w-10 bg-white/10 rounded-xl"></div>
                  <div className="h-10 w-10 bg-white/10 rounded-xl"></div>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {WEEKDAY_NAMES.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-transparent p-2">
                    {/* Render the text but make it transparent to hold space */}
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Create 35 placeholders for a 5-week view */}
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-12 w-full bg-white/10 rounded-lg"></div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-success-500/50 rounded-full"></div>
                  <div className="h-4 w-16 bg-white/10 rounded-md"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 border-2 border-white/20 rounded-full"></div>
                  <div className="h-4 w-12 bg-white/10 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton (Right Column) */}
          <div className="space-y-6">
            {/* "Lisää tämän päivän työ" Button Skeleton */}
            <div className="btn-primary-skeleton p-4 space-x-2">Lisää tämän päivän työ</div>

            {/* "Pikavinkit" Card Skeleton */}
            <div className="glass-card rounded-2xl p-6 animate-pulse">
              <div className="h-6 w-32 bg-white/20 rounded-md mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 w-full bg-white/10 rounded-md"></div>
                <div className="h-4 w-5/6 bg-white/10 rounded-md"></div>
                <div className="h-4 w-full bg-white/10 rounded-md"></div>
                <div className="h-4 w-4/5 bg-white/10 rounded-md"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
