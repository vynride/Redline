import { AppHeader } from "@/components/app/AppHeader";
import { AppContainer } from "@/components/app/AppContainer";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-ink">
        <AppHeader />
        <AppContainer>{children}</AppContainer>
      </div>
    </AuthGuard>
  );
}
