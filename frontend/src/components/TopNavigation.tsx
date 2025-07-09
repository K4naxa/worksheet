"use client";

import { User2, FileDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import { useState, useEffect, useRef } from "react";

import { exportToExcel } from "@/utils/exportToExcel";
import { User } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { getUserWorkdaysAction } from "@/app/actions";
import Portal from "./Portal";

export default function TopNavigation({ userProfile }: { userProfile: User }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate dropdown position when it opens
  useEffect(() => {
    if (showProfileMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap below button
        right: window.innerWidth - rect.right,
      });
    }
  }, [showProfileMenu]);

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
      setShowProfileMenu(false); // Close the menu after export
    }
  };

  const handleLogout = () => {
    try {
      const issuerUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}`;
      const logoutUrl = new URL(`${issuerUrl}/protocol/openid-connect/logout`);
      const postLogoutRedirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}`;

      logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUrl);
      logoutUrl.searchParams.set("client_id", process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!);

      signOut({ redirect: false });
      window.location.href = logoutUrl.toString();

      setShowProfileMenu(false);
    } catch (error) {
      console.error("Error logging out:", error);
      signOut({ callbackUrl: "/" });
    }
  };

  return (
    <nav className="bg-white/10 shadow-lg border-b border-white/10 sticky top-0 z-50 backdrop-blur-md">
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
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg glass-card glass-card-hover text-primary transition-all"
            >
              <User2 className="w-4 h-4" />
              <span className="hidden sm:inline">{userProfile?.name || userProfile?.email}</span>
            </button>

            {/* Profile dropdown menu - rendered in portal */}
            {showProfileMenu && (
              <Portal>
                <div
                  ref={dropdownRef}
                  className="fixed w-48 glass-card rounded-lg shadow-lg border border-white/10 overflow-hidden z-[9999]"
                  style={{
                    top: `${dropdownPosition.top}px`,
                    right: `${dropdownPosition.right}px`,
                  }}
                >
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
              </Portal>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
