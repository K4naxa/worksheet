"use client";

import { usePathname } from "next/navigation";
import { TopNavigation } from "@/components";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Pages where we don't want to show the navigation
  const excludedPages = ["/login", "/register"];
  const shouldShowNavigation = !excludedPages.includes(pathname);

  return (
    <>
      {shouldShowNavigation && <TopNavigation />}
      {children}
    </>
  );
}
