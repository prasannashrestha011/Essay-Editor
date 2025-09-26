import { create } from "zustand";

interface EssayDraftState {
  title: string;
  content: string;
  isPublic: boolean;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setIsPublic: (isPublic: boolean) => void;
  resetDraft: () => void;
}

export const useEssayDraftStore = create<EssayDraftState>((set) => ({
  title: "",
  content: "",
  isPublic: false,
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),
  setIsPublic: (isPublic) => set({ isPublic }),
  resetDraft: () =>
    set({
      title: "",
      content: "",
      isPublic: false,
    }),
}));
