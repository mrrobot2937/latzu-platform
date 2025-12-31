import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProfileType, UserPreferences, UserProgress } from "@/types/user";

interface UserState {
  // Profile
  profileType: ProfileType | null;
  tenantId: string;

  // Preferences
  preferences: UserPreferences;

  // Progress
  progress: UserProgress | null;

  // Guest Mode
  isGuest: boolean;
  guestId: string | null;

  // UI State
  sidebarCollapsed: boolean;

  // Actions
  setProfileType: (type: ProfileType) => void;
  setTenantId: (id: string) => void;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setProgress: (progress: UserProgress) => void;
  toggleSidebar: () => void;
  enableGuestMode: (profileType?: ProfileType) => void;
  disableGuestMode: () => void;
  reset: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: "dark",
  language: "es",
  notifications: {
    email: true,
    push: true,
    proactiveSuggestions: true,
  },
  learningGoals: [],
  focusAreas: [],
};

// Generate a random guest ID
const generateGuestId = () => `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // Initial state
      profileType: null,
      tenantId: "default",
      preferences: defaultPreferences,
      progress: null,
      isGuest: false,
      guestId: null,
      sidebarCollapsed: false,

      // Actions
      setProfileType: (type) => set({ profileType: type }),

      setTenantId: (id) => set({ tenantId: id }),

      setPreferences: (prefs) =>
        set((state) => ({
          preferences: { ...state.preferences, ...prefs },
        })),

      setProgress: (progress) => set({ progress }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      enableGuestMode: (profileType = "estudiante") => {
        const guestId = generateGuestId();
        set({
          isGuest: true,
          guestId,
          profileType,
          tenantId: "demo",
          progress: {
            userId: guestId,
            totalLessonsCompleted: 0,
            totalTimeSpent: 0,
            currentStreak: 0,
            longestStreak: 0,
            conceptsMastered: [],
            conceptsInProgress: [],
            lastActivityAt: new Date().toISOString(),
            skillLevels: {},
          },
        });
      },

      disableGuestMode: () =>
        set({
          isGuest: false,
          guestId: null,
        }),

      reset: () =>
        set({
          profileType: null,
          tenantId: "default",
          preferences: defaultPreferences,
          progress: null,
          isGuest: false,
          guestId: null,
          sidebarCollapsed: false,
        }),
    }),
    {
      name: "latzu-user-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profileType: state.profileType,
        preferences: state.preferences,
        sidebarCollapsed: state.sidebarCollapsed,
        isGuest: state.isGuest,
        guestId: state.guestId,
      }),
    }
  )
);

// Selectors for common use cases
export const useProfileType = () => useUserStore((state) => state.profileType);
export const usePreferences = () => useUserStore((state) => state.preferences);
export const useProgress = () => useUserStore((state) => state.progress);
export const useSidebarCollapsed = () => useUserStore((state) => state.sidebarCollapsed);
export const useIsGuest = () => useUserStore((state) => state.isGuest);
export const useGuestId = () => useUserStore((state) => state.guestId);
