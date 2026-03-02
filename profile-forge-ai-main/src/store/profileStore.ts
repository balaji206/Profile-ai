import { create } from "zustand";
import { StudentProfile, defaultProfile } from "../types/profile";

// Simple store to simulate DB - will be replaced by real backend
interface ProfileStore {
  profile: StudentProfile;
  updateProfile: (updates: Partial<StudentProfile>) => void;
}

// Persist in localStorage to simulate DB
const getInitial = (): StudentProfile => {
  const stored = localStorage.getItem("forge_profile");
  return stored ? JSON.parse(stored) : defaultProfile;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: getInitial(),
  updateProfile: (updates) =>
    set((state) => {
      const updated = { ...state.profile, ...updates };
      localStorage.setItem("forge_profile", JSON.stringify(updated));
      return { profile: updated };
    }),
}));
