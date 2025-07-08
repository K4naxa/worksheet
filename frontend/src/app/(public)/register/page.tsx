// app/profile/page.tsx
import RegisterPageClient from "@/app/(public)/register/RegisterPageClient";
import { getUserProfile } from "@/lib/data";

import { redirect } from "next/navigation";

// This page is a Server Component that fetches data and passes it to the Client Component.
// It uses Next.js's dynamic rendering to ensure the data is always fresh.
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  // Fetch data on the server
  const userProfile = await getUserProfile();

  // If there's no user, session is invalid, redirect to login
  if (!userProfile) {
    redirect("/login");
  }

  // Pass the data to the client component
  // Suspense is good practice here for better loading UX
  return <RegisterPageClient userProfile={userProfile} />;
}
