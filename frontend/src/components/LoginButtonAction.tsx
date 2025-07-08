"use client";

import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";

export function LoginButtonAction() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleLogin = () => {
    signIn("keycloak", { callbackUrl });
  };

  if (status === "loading") {
    return (
      <button
        disabled
        className="w-full p-4 btn-primary flex items-center justify-center space-x-3 text-lg disabled:opacity-70"
      >
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Tarkistetaan...</span>
      </button>
    );
  }

  return (
    <button className="w-full p-4 btn-primary flex items-center justify-center space-x-3 text-lg" onClick={handleLogin}>
      <LogIn className="w-6 h-6" />
      <span>Kirjaudu Sisään</span>
    </button>
  );
}
