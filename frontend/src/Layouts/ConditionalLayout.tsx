"use client";
import { usePathname } from "next/navigation";
import { TopNavigation } from "@/components";
import { User } from "@/types";

interface ConditionalLayoutProps {
  children: React.ReactNode;
  userProfile: User | null; // It now accepts the user profile
}

export default function ConditionalLayout({
  children,
  userProfile,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Pages where we don't want to show the navigation
  const excludedPages = ["/login", "/register"];
  const shouldShowNavigation = !excludedPages.includes(pathname);

  return (
    <div className="sm:space-y-10">
      {shouldShowNavigation && <TopNavigation userProfile={userProfile} />}
      {children}
    </div>
  );
}
