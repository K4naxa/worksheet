// app/(auth)/(mainView)/layout.tsx

import { MainViewTabs } from "./MainViewTabs";

export default function MainViewLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* The shared tab navigation */}
      <MainViewTabs />

      {/* The content of the specific page (/ or /workdays or /stats) */}
      <div className="max-w-6xl mx-auto">{children}</div>
    </div>
  );
}
