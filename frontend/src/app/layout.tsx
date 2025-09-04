import "./globals.css";
import AuthProvider from "../context/AuthContext";
import { title } from "process";

export const metadata = {
  manifest: "/manifest.json",
  title: {
    default: "Työpäiväkirja",
    template: "%s | Työpäiväkirja",
  },
  description: "Seuraa päivittäisiä aktiviteettejasi ja edistymistäsi työharjoittelun aikana.",
};
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi">
      <head>
        <meta name="theme-color" content="#581c87" />
      </head>
      <body style={{ background: "var(--gradient-background)" }} className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
