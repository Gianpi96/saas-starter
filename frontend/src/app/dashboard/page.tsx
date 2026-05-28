import { WelcomeCard } from "@/components/dashboard/welcome-card";

export default function DashboardPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your account</p>
      </div>
      <WelcomeCard />
    </div>
  );
}
