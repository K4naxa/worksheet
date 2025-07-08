// app/(auth)/(mainView)/workdays/page.tsx

import { getUserWorkdays } from "@/lib/data";
import { WorkDaysList } from "@/components";
// You'll need a client component to handle the modals here too.
import { WorkdayListPageClient } from "./WorkdayListPageClient";

export default async function WorkdaysPage() {
  const workdays = await getUserWorkdays();

  return (
    <div className="max-w-4xl mx-auto">
      <WorkdayListPageClient initialWorkdays={workdays} />
    </div>
  );
}
