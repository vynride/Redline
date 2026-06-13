"use client";

import { NewDrill } from "@/components/drill/NewDrill";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-section">
      <section className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-h1">Start a drill</h1>
          <p className="text-body-lg text-secondary">
            {user ? `Ready when you are, ${user.display_name.split(" ")[0]}.` : "Pick a crisis and talk your way out."}
          </p>
        </div>
        <NewDrill />
      </section>
    </div>
  );
}
