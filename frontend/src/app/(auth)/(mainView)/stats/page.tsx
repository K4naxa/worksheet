import { getUserProfile, getUserWorkdays } from "@/lib/data";
import { Statistics } from "@/components";
import { calculateStats } from "@/utils/stats";
import { WorkPracticeSettings } from "@/types";
import { redirect } from "next/navigation";

export default async function StatsPage() {
  const [profile, workdays] = await Promise.all([getUserProfile(), getUserWorkdays()]);

  if (!profile) {
    redirect("/login");
  }

  const settings: WorkPracticeSettings = {
    workDays: profile.workdays || [],
    startDate: profile.start_date ? profile.start_date.toISOString() : undefined,
    endDate: profile.end_date ? profile.end_date.toISOString() : undefined,
  };

  const stats = calculateStats(workdays, settings);

  return <Statistics stats={stats} />;
}
