import { AppHeader } from "@/components/app/AppHeader";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppHeader />
      <div className="mx-auto max-w-[1200px] px-6 py-section">{children}</div>
    </AuthGuard>
  );
}
