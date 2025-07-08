import LoginButton from "@/components/LoginButton";
import { Github } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    // Use flexbox to center the content both vertically and horizontally
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--gradient-background)" }}
    >
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Image
            src="/pwa/icons/icon-192x192.png" // Path to your logo in the public folder
            alt="Työpäiväkirja Logo"
            width={80} // Specify width
            height={80} // Specify height
            priority // Add priority=true for images "above the fold" to load them faster
          />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Työpäiväkirja</h1>
        </div>
        <p className="text-secondary text-lg max-w-2xl mx-auto">
          Seuraa päivittäisiä tekemistäsi ja oppimistasi työharjoittelun aikana. <br />
          Saat tietosi talteen ja voit jakaa ne helposti opettajasi kanssa.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md">
        {/* Use the glass-card style for a consistent look */}
        <div className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl">
          <LoginButton />
        </div>
      </div>

      {/* Signature */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted">
          Luoja:
          <a
            href="https://github.com/K4naxa"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1 font-medium text-primary/80 hover:text-primary transition-colors group"
          >
            <Github className="w-4 h-4 transition-transform group-hover:scale-110" />

            <span className="underline underline-offset-4">K4naxa</span>
          </a>
        </p>
      </div>
    </div>
  );
}
