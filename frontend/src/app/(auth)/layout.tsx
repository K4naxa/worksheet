import { TopNavigation } from "@/components";
import { getUserProfile } from "@/lib/data";
import { Redirect } from "next";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userProfile = await getUserProfile();

  return (
    <div>
      <TopNavigation userProfile={userProfile} />
      <main>{children}</main>
    </div>
  );
}
