import { getUserProfile, getUserWorkdays } from "@/lib/data";
import { Statistics } from "@/components";
import { calculateStats } from "@/utils/stats";
import { WorkPracticeSettings } from "@/types";
import { redirect } from "next/navigation";
import { formatDate } from "@/utils/formatUtils";

export const dynamic = "force-dynamic";
export default async function StatsPage() {
  const [profile, workdays] = await Promise.all([getUserProfile(), getUserWorkdays()]);

  if (!profile) {
    redirect("/login");
  }

  const settings: WorkPracticeSettings = {
    workDays: profile.workdays || [],
    startDate: profile.start_date ? formatDate(profile.start_date) : undefined,
    endDate: profile.end_date ? formatDate(profile.end_date) : undefined,
  };

  const stats = calculateStats(workdays, settings);

  return <Statistics stats={stats} />;
}
