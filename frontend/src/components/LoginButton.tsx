"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function LoginButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <p>Lataa...</p>;
  }

  if (session) {
    return (
      <>
        Kirjautunut käyttäjä: {session.user?.email} <br />
        <button onClick={() => signOut()}>Kirjaudu Ulos</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button
        className="w-full p-4 btn-primary flex items-center justify-center space-x-2"
        onClick={() => signIn("keycloak")}
      >
        Kirjaudu Sisään
      </button>
    </>
  );
}
