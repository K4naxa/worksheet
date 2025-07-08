"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarDays, List } from "lucide-react";

const TABS = [
  { href: "/", label: "Kalenteri", icon: CalendarDays },
  { href: "/workdays", label: "Työpäivät", icon: List },
  { href: "/stats", label: "Tilastot", icon: BarChart3 },
];

export function MainViewTabs() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className="glass-card rounded-2xl p-2">
          <div className="flex space-x-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              // Determine if the current link is active
              const isActive = pathname === tab.href;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-3 rounded-xl 
                    font-medium transition-all
                    ${isActive ? "text-white shadow-lg bg-gradient-primary" : "text-secondary glass-card-hover"}
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
