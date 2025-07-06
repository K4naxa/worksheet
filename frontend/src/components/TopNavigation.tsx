"use client";

import { User2, FileDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { useState, useEffect, useRef } from "react";

import { exportToExcel } from "@/utils/exportToExcel";
import { User } from "@/types";
import Link from "next/link";

export default function TopNavigation({
  userProfile,
}: {
  userProfile: User | null;
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Todo: Remake export function
  const handleExport = () => {
    // setIsLoading(true);
    // if (userProfile && userProfile.userWorkdays) {
    //   exportToExcel(userProfile, userProfile.userWorkdays);
    // } else {
    //   alert(
    //     "Käyttäjätietoja ei voitu ladata vientiä varten. Yritä päivittää sivu."
    //   );
    // }
  };

  const handleLogout = () => {
    signOut();
    setShowProfileMenu(false);
  };

  return (
    <nav className="bg-white/10 shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Export button */}
          <div className="flex items-center space-x-10">
            <Link
              href="/"
              className="text-xl md:text-2xl font-bold text-primary hover:cursor-pointer hover:text-primary-200/70 transition-colors"
            >
              Työharjoittelu Seuranta
            </Link>

            {/* Export button */}
            <button
              onClick={handleExport}
              // Button is disabled if userProfile is not available or if data is loading
              disabled={isLoading || !userProfile}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-card glass-card-hover text-primary transition-all"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>

          {/* Right side - Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-card glass-card-hover text-primary transition-all"
            >
              <User2 className="w-4 h-4" />
              <span className="hidden sm:inline">
                {userProfile?.name || userProfile?.email}
              </span>
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg border border-white/10 overflow-hidden z-50">
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-4 py-3 text-left text-primary hover:bg-white/5 transition-colors flex items-center space-x-2"
                >
                  <User2 className="w-4 h-4" />
                  <span>Profiili</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-primary hover:bg-white/5 transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Kirjaudu ulos</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
