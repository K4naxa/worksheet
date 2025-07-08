"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, List } from "lucide-react";
import React, { useRef, useEffect, useState } from "react";

const TABS = [
  { href: "/", label: "Kalenteri", icon: CalendarDays },
  { href: "/workdays", label: "Työpäivät", icon: List },
  { href: "/stats", label: "Tilastot", icon: BarChart3 },
];

export function MainViewTabs() {
  const pathname = usePathname();
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Find the active tab index
  const activeIndex = TABS.findIndex((tab) => tab.href === pathname);

  useEffect(() => {
    const updateHighlight = () => {
      if (activeIndex !== -1 && tabRefs.current[activeIndex] && tabsContainerRef.current) {
        const activeTabEl = tabRefs.current[activeIndex];
        const parentEl = tabsContainerRef.current;

        if (activeTabEl && parentEl) {
          const left = activeTabEl.offsetLeft;
          const width = activeTabEl.offsetWidth;

          setHighlightStyle({ left, width });
        }
      }
    };

    updateHighlight();

    // Recalculate on window resize to handle responsive changes
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [pathname, activeIndex]);

  return (
    <div className="flex justify-center mb-8">
      <div className="glass-card rounded-2xl p-1 sm:p-2">
        <div className="relative flex items-center" ref={tabsContainerRef}>
          {/* Animated highlight */}
          <div
            className="absolute top-0 left-0 h-full rounded-xl bg-gradient-primary shadow-lg z-0 transition-all duration-300 ease-in-out"
            style={highlightStyle}
          />
          {TABS.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeIndex === i;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                className={`
                  relative z-10 flex justify-center items-center gap-x-2 font-medium hover: 
                  transition-colors duration-300 ease-in-out
                  h-12 w-24 sm:w-auto sm:px-6 select-none
                `}
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? "text-white" : "text-secondary group-hover:text-primary"
                  }`}
                />
                {/* THIS IS THE KEY CHANGE: Hide text on small screens */}
                <span
                  className={`hidden sm:inline transition-colors ${
                    isActive ? "text-white" : "text-secondary group-hover:text-primary"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
