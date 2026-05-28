"use client";

import { useUser } from "@/hooks/useUser";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export function WelcomeCard() {
  const { data: user, isLoading, isError } = useUser();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to load your profile. Please try again.");
    }
  }, [isError]);

  if (isLoading) {
    return (
      <Card data-testid="welcome-card-skeleton">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card data-testid="welcome-card-empty">
        <CardHeader>
          <CardTitle>No profile data</CardTitle>
          <CardDescription>We couldn&apos;t load your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="welcome-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <UserCircle className="h-10 w-10 text-muted-foreground" />
          <div>
            <CardTitle>Welcome back, {user.full_name ?? user.email.split("@")[0]}!</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Account status</span>
          <span className={user.is_active ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {user.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Email verified</span>
          <span className={user.is_verified ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
            {user.is_verified ? "Verified" : "Pending verification"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Member since</span>
          <span className="font-medium">
            {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
