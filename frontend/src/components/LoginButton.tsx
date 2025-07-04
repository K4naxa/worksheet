"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginButton() {
  const { data: session, status } = useSession();
  const route = useRouter();

  const handleLogin = async () => {
    await signIn("keycloak", { callbackUrl: "/" });
  };

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
        onClick={() => handleLogin()}
      >
        Kirjaudu Sisään
      </button>
    </>
  );
}
