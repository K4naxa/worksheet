// src/components/LoginButton.tsx

"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { KeyRound, LogIn, Loader2 } from "lucide-react"; // Import icons

export default function LoginButton() {
  const { status } = useSession();

  const handleLogin = () => {
    // No need for async/await here as signIn triggers a full page redirect
    signIn("keycloak", { callbackUrl: "/" });
  };

  // While the session is being checked, show a disabled loading button
  if (status === "loading") {
    return (
      <button
        disabled
        className="w-full p-4 btn-primary flex items-center justify-center space-x-3 text-lg disabled:opacity-70"
      >
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Tarkistetaan istuntoa...</span>
      </button>
    );
  }

  // This component will only be shown on the login page, so we don't need the `if (session)` part.
  // The middleware will redirect authenticated users away.

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-primary mb-2">Tervetuloa!</h2>
      <p className="text-secondary mb-8">Kirjaudu sisään jatkaaksesi.</p>
      <button
        className="w-full p-4 btn-primary flex items-center justify-center space-x-3 text-lg"
        onClick={handleLogin}
      >
        <LogIn className="w-6 h-6" />
        <span>Kirjaudu Sisään</span>
      </button>

      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 text-muted mb-2">
          <KeyRound className="w-5 h-5" />
          <h3 className="font-semibold text-secondary">
            Turvallinen Tunnistautuminen
          </h3>
        </div>
        <p className="text-sm text-muted max-w-xs mx-auto">
          Käytämme Keycloak-palvelua tilinhallintaan. Sinut ohjataan
          turvalliselle sivulle syöttämään salasanasi.
        </p>
        <p className="text-sm text-muted mt-2">
          Eikö sinulla ole tiliä? Voit rekisteröityä samassa palvelussa
          kirjautumisen yhteydessä.
        </p>
      </div>
    </div>
  );
}
