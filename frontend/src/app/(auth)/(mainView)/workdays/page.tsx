import { getUserProfile, getUserWorkdays } from "@/lib/data";
import { WorkdayListPageClient } from "./WorkdayListPageClient";

export const dynamic = "force-dynamic";
export default async function WorkdaysPage() {
  const workdays = await getUserWorkdays();
  const profile = await getUserProfile();

  return (
    <div className="max-w-4xl mx-auto">
      <WorkdayListPageClient initialWorkdays={workdays} initialProfile={profile} />
    </div>
  );
}
