import React from "react";

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
);

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}>
    <Shimmer />
  </div>
);

export const StatisticsPageSkeleton = () => {
  return (
    <div className="animate-pulse space-y-6">
      {/* Title Skeleton */}
      <SkeletonBlock className="h-8 w-32 mb-6" />

      {/* Main Stats Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="glass-card rounded-2xl p-6 transition-all duration-300"
          >
            {/* Icon Skeleton */}
            <SkeletonBlock className="w-12 h-12 rounded-xl mb-4" />
            
            {/* Value Skeleton */}
            <SkeletonBlock className="h-9 w-16 mb-1" />
            
            {/* Label Skeleton */}
            <SkeletonBlock className="h-5 w-3/4 mb-1" />
            
            {/* Description Skeleton */}
            <SkeletonBlock className="h-4 w-full" />
          </div>
        ))}
      </div>

      {/* Meal Distribution Skeleton */}
      <div className="glass-card rounded-2xl p-6">
        {/* Header Skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <SkeletonBlock className="w-6 h-6 rounded" />
          <SkeletonBlock className="h-7 w-28" />
        </div>

        {/* Meal Distribution Items Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <SkeletonBlock className="h-5 w-20" />
                <SkeletonBlock className="h-4 w-32" />
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <SkeletonBlock className="h-2 rounded-full" style={{ width: `${Math.random() * 80 + 20}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
