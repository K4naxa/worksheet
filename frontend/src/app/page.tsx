import { getUserProfile, getUserWorkdays } from "@/lib/data";
import { HomePageClient } from "./HomePageClient";
import { HomePageSkeleton } from "@/components/skeletons/HomePageSkeleton";
import { redirect } from "next/navigation";

export default async function Home() {
  // Fetch data on the server in parallel
  const [userProfile, userWorkdays] = await Promise.all([
    getUserProfile(),
    getUserWorkdays(),
  ]);

  // If there's no user profile, the session is likely invalid or user not found.
  // Redirect to login instead of showing a skeleton on the main page.
  if (!userProfile) {
    redirect("/login");
  }

  // The Server Component's only job is to fetch data and pass it to the Client Component.
  return (
    <HomePageClient
      initialProfile={userProfile}
      initialWorkdays={userWorkdays}
    />
  );
}
