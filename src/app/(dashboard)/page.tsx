"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// This page redirects to /dashboard
// The actual dashboard content is at /dashboard
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-12 h-12 rounded-full bg-primary/20 animate-pulse-glow" />
    </div>
  );
}
