import "./globals.css";
import "./manifest.js";
import AuthProvider from "../context/AuthContext";
import { UserProvider } from "@/context/UserContext";
import { ConditionalLayout } from "@/components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body
        style={{ background: "var(--gradient-background)" }}
        className="min-h-screen"
      >
        <AuthProvider>
          <UserProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
