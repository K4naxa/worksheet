import React from "react";
import { User } from "lucide-react";

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

// This component replaces only the dynamic part of the navigation
const ProfileButtonSkeleton = () => {
  return (
    <div className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-card">
      <User className="w-4 h-4 text-muted" />
      <SkeletonBlock className="h-5 w-24 hidden sm:inline-block" />
    </div>
  );
};

export default ProfileButtonSkeleton;
