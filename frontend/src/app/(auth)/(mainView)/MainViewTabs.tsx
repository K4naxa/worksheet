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
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  // Find the active tab index
  const activeIndex = TABS.findIndex((tab) => tab.href === pathname);

  useEffect(() => {
    if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
      const el = tabRefs.current[activeIndex];
      const parent = el?.parentElement;
      if (el && parent) {
        const elRect = el.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        setHighlightStyle({
          left: elRect.left - parentRect.left,
          width: elRect.width,
        });
      }
    }
  }, [pathname, activeIndex]);

  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className="glass-card rounded-2xl p-2">
          <div className="relative flex space-x-2 min-w-[220px]">
            {/* Animated highlight */}
            <div
              className="absolute top-0 left-0 h-full rounded-xl bg-gradient-primary z-0 transition-all duration-300"
              style={{
                left: highlightStyle.left,
                width: highlightStyle.width,
                pointerEvents: "none",
                height: "100%",
              }}
            />
            {TABS.map((tab, i) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  className={`relative z-10 flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-3 rounded-xl font-medium transition-all
                    ${isActive ? "text-white shadow-lg" : "text-secondary glass-card-hover"}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
