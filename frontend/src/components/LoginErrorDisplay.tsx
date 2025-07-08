"use client";

import { useSearchParams } from "next/navigation";

export function LoginErrorDisplay() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  return (
    <p className="text-center text-sm font-medium text-destructive mb-4">Kirjautuminen epäonnistui. Yritä uudelleen.</p>
  );
}
