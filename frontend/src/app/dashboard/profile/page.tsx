import { ProfileForm } from "@/components/dashboard/profile-form";
import { ChangePasswordForm } from "@/components/dashboard/change-password-form";

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground mt-1">Gestisci le tue informazioni personali</p>
      </div>
      <ProfileForm />
      <ChangePasswordForm />
    </div>
  );
}
