import { Github, KeyRound } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { LoginButtonAction } from "@/components/LoginButtonAction";
import { LoginErrorDisplay } from "@/components/LoginErrorDisplay";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--gradient-background)" }}
    >
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Image src="/pwa/icons/icon-192x192.png" alt="Työpäiväkirja Logo" width={80} height={80} priority />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Työpäiväkirja</h1>
        </div>
        <p className="text-secondary text-lg max-w-2xl mx-auto">
          Seuraa päivittäisiä tekemistäsi ja oppimistasi työharjoittelun aikana. <br />
          Saat tietosi talteen ja voit jakaa ne helposti opettajasi kanssa.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 md:p-12 shadow-2xl text-center">
          {/* --- Start of Refactored Section --- */}

          {/* Static content moved from old LoginButton to the Server Component */}
          <h2 className="text-2xl font-bold text-primary mb-2">Tervetuloa!</h2>
          <p className="text-secondary mb-8">Kirjaudu sisään jatkaaksesi.</p>

          {/* Suspense boundary for the interactive parts */}
          <Suspense
            fallback={
              // A placeholder that matches the button's size to prevent layout shift
              <div className="w-full h-[56px] bg-white/10 rounded-lg animate-pulse" />
            }
          >
            <LoginErrorDisplay />
            <LoginButtonAction />
          </Suspense>

          {/* More static content moved from old LoginButton */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <div className="flex items-center justify-center gap-2 text-muted mb-2">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-semibold text-secondary">Turvallinen Tunnistautuminen</h3>
            </div>
            <p className="text-sm text-muted max-w-xs mx-auto">
              Käytämme Keycloak-palvelua tilinhallintaan. Sinut ohjataan turvalliselle sivulle syöttämään salasanasi.
            </p>
            <p className="text-sm text-muted mt-2">
              Eikö sinulla ole tiliä? Voit rekisteröityä samassa palvelussa kirjautumisen yhteydessä.
            </p>
          </div>
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
