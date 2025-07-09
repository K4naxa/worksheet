import React from "react";

const Shimmer = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
);

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-lg bg-white/5 ${className}`}>
    <Shimmer />
  </div>
);

export const ProfilePageSkeleton = () => {
  return (
    <div className="animate-pulse flex flex-col gap-12 items-center justify-center p-4 h-full">
      {/* Work Settings Skeleton */}
      <div className="glass-card rounded-2xl w-full max-w-6xl">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <SkeletonBlock className="h-7 w-1/3" />
          <SkeletonBlock className="h-10 w-28" />
        </div>
        <div className="p-6 space-y-6">
          {/* Company and Instructor Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          </div>
          {/* Date Range Skeleton */}
          <div className="space-y-4">
            <SkeletonBlock className="h-6 w-1/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-1/2" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
              <div className="space-y-2">
                <SkeletonBlock className="h-5 w-1/2" />
                <SkeletonBlock className="h-11 w-full" />
              </div>
            </div>
          </div>
          {/* Work Days Skeleton */}
          <div className="space-y-3">
            <SkeletonBlock className="h-6 w-1/4" />
            <div className="flex gap-2 flex-wrap w-full md:grid grid-cols-7">
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-12 w-full min-w-14" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info Skeleton */}
      <div className="glass-card rounded-2xl w-full max-w-6xl">
        <div className="flex items-center p-6 border-b border-white/20">
          <SkeletonBlock className="h-7 w-1/4" />
        </div>
        <div className="p-6 space-y-4">
          <SkeletonBlock className="h-5 w-full" />
          <SkeletonBlock className="h-5 w-5/6" />
          <SkeletonBlock className="h-5 w-1/2 mt-2" />
          <div className="pt-2">
            <SkeletonBlock className="h-12 w-52" />
          </div>
        </div>
      </div>

      {/* Profile Deletion Skeleton */}
      <div className="glass-card border-2 border-red-500/20 rounded-2xl w-full max-w-6xl">
        <div className="flex items-center p-6 border-b border-red-500/20">
          <SkeletonBlock className="h-7 w-1/4" />
        </div>
        <div className="p-6 space-y-4">
          <SkeletonBlock className="h-5 w-full" />
          <SkeletonBlock className="h-5 w-5/6" />
          <div className="pt-2">
            <SkeletonBlock className="h-12 w-40" />
          </div>
        </div>
      </div>
    </div>
  );
};
