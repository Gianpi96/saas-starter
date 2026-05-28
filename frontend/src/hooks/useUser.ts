"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { fetchMe, type UserProfile } from "@/lib/api";

export function useUser() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  return useQuery<UserProfile, Error>({
    queryKey: ["user", "me"],
    queryFn: () => fetchMe(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}
