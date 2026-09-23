import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { safeJSONStorage } from "@/lib/storage";

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

interface ProfileState {
  user: UserProfile;
  updateUser: (partial: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

const initialProfile: UserProfile = {
  name: "",
  email: "",
  phone: "",
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      user: initialProfile,
      updateUser: (partial) =>
        set((state) => ({
          user: { ...state.user, ...partial },
        })),
      resetProfile: () => set({ user: initialProfile }),
    }),
    {
      name: "flame-spice-profile",
      version: 1,
      storage: createJSONStorage(() => safeJSONStorage),
      migrate: (persistedState, version) => {
        if (version === 0 || !persistedState) {
          return { user: initialProfile };
        }
        return persistedState as ProfileState;
      },
    }
  )
);
