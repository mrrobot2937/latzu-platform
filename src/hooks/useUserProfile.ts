"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/stores/userStore";
import { api } from "@/lib/api";
import type { ProfileType, UserPreferences, UserProgress, OnboardingData } from "@/types/user";

interface UserProfileData {
  profileType: ProfileType | null;
  preferences: UserPreferences;
  progress: UserProgress | null;
}

export function useUserProfile() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const {
    profileType,
    preferences,
    progress,
    setProfileType,
    setPreferences,
    setProgress,
    setTenantId,
  } = useUserStore();

  // Sync session data to store
  useEffect(() => {
    if (session?.user) {
      if (session.user.profileType) {
        setProfileType(session.user.profileType);
      }
      if (session.user.tenantId) {
        setTenantId(session.user.tenantId);
      }
    }
  }, [session, setProfileType, setTenantId]);

  // Fetch user profile from backend
  const {
    data: backendProfile,
    isLoading: isLoadingProfile,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      try {
        const response = await api.get<{
          profile_type: ProfileType;
          preferences: UserPreferences;
          tenant_id: string;
        }>(`/api/users/${session.user.id}/profile`);

        return response;
      } catch {
        return null;
      }
    },
    enabled: status === "authenticated" && !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user progress
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["userProgress", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      try {
        const response = await api.get<UserProgress>(
          `/api/users/${session.user.id}/progress`
        );
        return response;
      } catch {
        return null;
      }
    },
    enabled: status === "authenticated" && !!session?.user?.id,
    staleTime: 60 * 1000, // 1 minute
  });

  // Update local store when backend data changes
  useEffect(() => {
    if (backendProfile) {
      if (backendProfile.profile_type) {
        setProfileType(backendProfile.profile_type);
      }
      if (backendProfile.preferences) {
        setPreferences(backendProfile.preferences);
      }
    }
  }, [backendProfile, setProfileType, setPreferences]);

  useEffect(() => {
    if (userProgress) {
      setProgress(userProgress);
    }
  }, [userProgress, setProgress]);

  // Update profile type mutation
  const updateProfileTypeMutation = useMutation({
    mutationFn: async (newProfileType: ProfileType) => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      await api.patch(`/api/users/${session.user.id}/profile`, {
        profile_type: newProfileType,
      });

      return newProfileType;
    },
    onSuccess: (newProfileType) => {
      setProfileType(newProfileType);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<UserPreferences>) => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      await api.patch(`/api/users/${session.user.id}/preferences`, newPreferences);

      return newPreferences;
    },
    onSuccess: (newPreferences) => {
      setPreferences(newPreferences);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: async (data: OnboardingData) => {
      if (!session?.user?.id) throw new Error("Not authenticated");

      await api.post(`/api/users/${session.user.id}/onboarding`, data);

      return data;
    },
    onSuccess: (data) => {
      setProfileType(data.profileType);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  return {
    // Current state
    profileType,
    preferences,
    progress,
    isAuthenticated: status === "authenticated",
    isLoading: isLoadingProfile || isLoadingProgress,

    // User info
    userId: session?.user?.id,
    userName: session?.user?.name,
    userEmail: session?.user?.email,
    userImage: session?.user?.image,

    // Actions
    updateProfileType: updateProfileTypeMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    completeOnboarding: completeOnboardingMutation.mutate,
    refetchProfile,

    // Loading states
    isUpdatingProfileType: updateProfileTypeMutation.isPending,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    isCompletingOnboarding: completeOnboardingMutation.isPending,
  };
}



