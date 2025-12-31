"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useUserStore, useSidebarCollapsed, useIsGuest } from "@/stores/userStore";
import { websocket } from "@/lib/websocket";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const collapsed = useSidebarCollapsed();
  const isGuest = useIsGuest();
  const guestId = useUserStore((state) => state.guestId);
  const setProfileType = useUserStore((state) => state.setProfileType);
  const setTenantId = useUserStore((state) => state.setTenantId);

  // Sync session data to store for authenticated users
  useEffect(() => {
    if (session?.user) {
      if (session.user.profileType) {
        setProfileType(session.user.profileType);
      }
      if (session.user.tenantId) {
        setTenantId(session.user.tenantId);
      }

      // Connect WebSocket for authenticated users
      websocket.connect(session.user.id, session.user.tenantId).catch((err) => {
        console.error("WebSocket connection failed:", err);
      });
    } else if (isGuest && guestId) {
      // Connect WebSocket for guest users
      websocket.connect(guestId, "demo").catch((err) => {
        console.error("WebSocket connection failed:", err);
      });
    }

    return () => {
      websocket.disconnect();
    };
  }, [session, isGuest, guestId, setProfileType, setTenantId]);

  // Check for onboarding (only for authenticated users, not guests)
  useEffect(() => {
    if (session?.user?.needsOnboarding && !isGuest) {
      router.push("/onboarding");
    }
  }, [session, isGuest, router]);

  // Loading state - only show when authenticating (not for guests)
  if (status === "loading" && !isGuest) {
    return (
      <div className="min-h-screen bg-gradient-latzu flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/20 animate-pulse-glow mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  // Allow access for:
  // 1. Authenticated users
  // 2. Guest users (isGuest === true)
  const hasAccess = status === "authenticated" || isGuest;

  // If not authenticated and not guest, redirect to login
  if (!hasAccess && status === "unauthenticated") {
    // Don't redirect, let them see the landing page
    // The main page.tsx will handle showing the landing for unauthenticated users
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-latzu">
      <Sidebar />

      <motion.main
        initial={false}
        animate={{ marginLeft: collapsed ? 72 : 256 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="min-h-screen"
      >
        <Header />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6"
        >
          {children}
        </motion.div>
      </motion.main>
    </div>
  );
}
