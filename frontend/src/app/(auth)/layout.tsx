import { TopNavigation } from "@/components";
import { getUserProfile } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const userProfile = await getUserProfile();

  if (!userProfile) {
    // If user profile is not found, redirect to login
    return redirect("/login");
  }

  return (
    <div className="space-y-6 sm:space-y-10">
      {userProfile && <TopNavigation userProfile={userProfile} />}
      <main>{children}</main>
    </div>
  );
}
