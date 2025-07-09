import { getUserProfile } from "@/lib/data";
import { ProfilePageClient } from "./ProfilePageClient";
import { ProfilePageSkeleton } from "@/components/skeletons/ProfilePageSkeleton";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// This page is a Server Component that fetches data and passes it to the Client Component.
// It uses Next.js's dynamic rendering to ensure the data is always fresh.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profiili",
  description: "Täältä voit tarkastella ja muokata profiilitietojasi.",
};

export default async function ProfilePage() {
  // Fetch data on the server
  const userProfile = await getUserProfile();

  // If there's no user, session is invalid, redirect to login
  if (!userProfile) {
    redirect("/login");
  }

  // Pass the data to the client component
  // Suspense is good practice here for better loading UX
  return (
    <Suspense fallback={<ProfilePageSkeleton />}>
      <ProfilePageClient initialProfile={userProfile} />
    </Suspense>
  );
}
