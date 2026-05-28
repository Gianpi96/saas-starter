"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, User, Settings, LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { fetchMe } from "@/lib/api";
import { useSession } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  function prefetchUser() {
    if (session?.accessToken) {
      queryClient.prefetchQuery({
        queryKey: ["user", "me"],
        queryFn: () => fetchMe(session.accessToken),
        staleTime: 5 * 60 * 1000,
      });
    }
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <aside className="flex flex-col w-64 min-h-screen border-r bg-card px-4 py-6 gap-2">
      <div className="px-2 mb-6">
        <h1 className="text-xl font-bold">SaaS Starter</h1>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onMouseEnter={prefetchUser}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            data-testid={`nav-${label.toLowerCase()}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <Button
        variant="ghost"
        className="justify-start gap-3 text-muted-foreground hover:text-destructive"
        onClick={handleLogout}
        data-testid="logout-button"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </aside>
  );
}
