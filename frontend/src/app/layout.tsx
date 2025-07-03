import "./globals.css";
import "./manifest.js";
import AuthProvider from "../context/AuthContext";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body>
        <AuthProvider>
          <UserProvider>{children}</UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
