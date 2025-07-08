"use client";

import { User2, FileDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { useState, useEffect, useRef } from "react";

import { exportToExcel } from "@/utils/exportToExcel";
import { User } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { getUserWorkdaysAction } from "@/app/actions";

const logoutRedirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;

export default function TopNavigation({ userProfile }: { userProfile: User }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Todo: Remake export function
  const handleExport = async () => {
    try {
      setIsLoading(true);
      const userWorkdays = await getUserWorkdaysAction();

      if (!userWorkdays.success) {
        throw new Error(userWorkdays.error || "Failed to fetch workdays.");
      }

      exportToExcel(userProfile, userWorkdays.workdays || []);
    } catch (error) {
      console.error("Error exporting workdays:", error);
      alert("Työpäivien vienti epäonnistui.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: logoutRedirectUrl, redirect: true });

    setShowProfileMenu(false);
  };

  return (
    <nav className="bg-white/10 shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-2 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Export button */}
          <div className="flex items-center space-x-4 md:space-x-6">
            <Link
              href="/"
              className="flex items-center space-x-3 transition-transform duration-300 ease-in-out hover:scale-[1.03] hover:opacity-90"
            >
              <Image src="/pwa/icons/icon-192x192.png" alt="Työpäiväkirja Logo" width={40} height={40} priority />
              <span className="hidden sm:inline text-xl font-bold text-primary">Työpäiväkirja</span>
            </Link>

            {/* Export button */}
            <button
              onClick={handleExport}
              disabled={!userProfile || isLoading}
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg glass-card glass-card-hover text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Export</span>
                </>
              )}
            </button>
          </div>

          {/* Right side - Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-card glass-card-hover text-primary transition-all"
            >
              <User2 className="w-4 h-4" />
              <span className="hidden sm:inline">{userProfile?.name || userProfile?.email}</span>
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg border border-white/10 overflow-hidden z-50">
                {/* Profile link */}
                <Link
                  href="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full px-4 py-3 text-left text-primary hover:bg-white/5 transition-colors flex items-center space-x-2"
                >
                  <User2 className="w-4 h-4" />
                  <span>Profiili</span>
                </Link>

                {/* Export button */}
                <button
                  onClick={handleExport}
                  disabled={!userProfile || isLoading}
                  className="flex md:hidden w-full px-4 py-3 text-left text-primary hover:bg-white/5 transition-colors items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Exporting...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4" />
                      <span>Export</span>
                    </>
                  )}
                </button>
                {/* Logout button */}
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
