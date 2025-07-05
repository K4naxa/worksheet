// src/components/skeletons/HomePageSkeleton.tsx

import React from "react";

// A reusable shimmer component for the pulsing effect
const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
);

// A reusable skeleton block
const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}
  >
    <Shimmer />
  </div>
);

export const HomePageSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="container mx-auto p-4">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <SkeletonBlock className="h-6 w-3/4 mx-auto" />
        </div>

        {/* Navigation Tabs Skeleton */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="glass-card rounded-2xl p-2">
              <div className="flex space-x-2">
                <SkeletonBlock className="h-[48px] w-[120px]" />
                <SkeletonBlock className="h-[48px] w-[120px]" />
                <SkeletonBlock className="h-[48px] w-[120px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton (mimicking the Calendar view) */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Calendar Skeleton */}
              <SkeletonBlock className="h-[400px] w-full" />
            </div>
            <div className="space-y-6">
              {/* Button Skeleton */}
              <SkeletonBlock className="h-[56px] w-full" />
              {/* Quick Tips Card Skeleton */}
              <div className="glass-card rounded-2xl p-6 space-y-3">
                <SkeletonBlock className="h-5 w-1/3" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-5/6" />
                <SkeletonBlock className="h-4 w-full" />
                <SkeletonBlock className="h-4 w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
