"use client";

import { User, FileDown, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export default function TopNavigation() {
  const { userProfile } = useUser();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export functionality not implemented yet");
    alert("Vienti-toiminto toteutetaan pian!");
  };

  const handleProfile = () => {
    router.push("/profile");
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    signOut();
    setShowProfileMenu(false);
  };

  return (
    <nav className="bg-white/10 shadow-lg border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Site name and Export button */}
          <div className="flex items-center space-x-10">
            <h1
              className="text-xl md:text-2xl font-bold text-primary hover:cursor-pointer hover:text-primary-200/70 transition-colors"
              onClick={() => router.push("/")}
            >
              Työharjoittelu Seuranta
            </h1>
            <button
              onClick={handleExport}
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
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">
                {userProfile?.name || userProfile?.email}
              </span>
            </button>

            {/* Profile dropdown menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 glass-card rounded-lg shadow-lg border border-white/10 overflow-hidden z-50">
                <button
                  onClick={handleProfile}
                  className="w-full px-4 py-3 text-left text-primary hover:bg-white/5 transition-colors flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profiili</span>
                </button>
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
