import "./globals.css";
import "./manifest.js";
import AuthProvider from "../context/AuthContext";
import { getUserProfile } from "@/lib/data";
import ConditionalLayout from "@/Layouts/ConditionalLayout";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getUserProfile();

  return (
    <html lang="fi">
      <body
        style={{ background: "var(--gradient-background)" }}
        className="min-h-screen"
      >
        <AuthProvider>
          <ConditionalLayout userProfile={userProfile}>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
