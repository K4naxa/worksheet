// app/not-found.tsx
import Link from "next/link";
import { AlertTriangle, Home } from "lucide-react";

export default function NotFound() {
  return (
    // Main container to center the content on the screen
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "var(--gradient-background)" }}
    >
      {/* Giant "404" in the background for styling */}
      <div
        className="absolute -top-1/4 -left-1/4 text-[40rem] font-black text-white/5 select-none -z-1"
        aria-hidden="true"
      >
        404
      </div>
      <div
        className="absolute -bottom-1/4 -right-1/4 text-[40rem] font-black text-white/5 select-none -z-1"
        aria-hidden="true"
      >
        404
      </div>

      {/* The main content card */}
      <div className="text-center">
        <div className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl max-w-lg mx-auto backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="h-16 w-16 text-amber-400" />
          </div>

          <h1 className="text-4xl font-bold text-primary mb-4">
            Sivua ei löytynyt
          </h1>

          <p className="text-secondary text-lg mb-8">
            Hups! Etsimääsi sivua ei ole olemassa. Se on saattanut siirtyä tai
            tulla poistetuksi.
          </p>

          <Link
            href="/"
            className="btn-primary inline-flex items-center space-x-2 text-lg"
          >
            <Home className="w-5 h-5" />
            <span>Palaa etusivulle</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
