import { create } from "zustand";
import { AVAILABLE_LANGUAGES } from "@/lib/constants";
import type { BrandTerm, HistoryItem } from "../../worker/types";
import { toast } from "@/components/ui/sonner";
type Settings = {
  defaultLanguages: string[];
  theme: "light" | "dark" | "system";
};
type LokaState = {
  brandTerms: BrandTerm[];
  brandTermsLoading: boolean;
  brandTermsError: string | null;
  history: HistoryItem[];
  historyLoading: boolean;
  historyError: string | null;
  settings: Settings;
  fetchBrandTerms: () => Promise<void>;
  addBrandTerm: (term: Omit<BrandTerm, 'id' | 'translations'>) => Promise<void>;
  updateBrandTerm: (term: BrandTerm) => Promise<void>;
  deleteBrandTerm: (id: string) => Promise<void>;
  updateBrandTermTranslations: (termId: string, translations: Record<string, string>) => Promise<void>;
  fetchHistory: () => Promise<void>;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'date'>) => Promise<void>;
  toggleDefaultLanguage: (langId: string) => void;
  setTheme: (theme: Settings["theme"]) => void;
};
export const useLokaStore = create<LokaState>((set, get) => ({
  brandTerms: [],
  brandTermsLoading: false,
  brandTermsError: null,
  history: [],
  historyLoading: false,
  historyError: null,
  settings: {
    defaultLanguages: AVAILABLE_LANGUAGES.slice(0, 2).map((l) => l.id),
    theme: "system"
  },
  fetchBrandTerms: async () => {
    set({ brandTermsLoading: true, brandTermsError: null });
    try {
      const response = await fetch("/api/brand-terms");
      if (!response.ok) throw new Error("Failed to fetch brand terms");
      const result = await response.json();
      if (result.success) {
        set({ brandTerms: result.data });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      set({ brandTermsError: message });
      toast.error("Error fetching brand terms", { description: message });
    } finally {
      set({ brandTermsLoading: false });
    }
  },
  addBrandTerm: async (termData) => {
    try {
      const response = await fetch("/api/brand-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...termData, translations: {} })
      });
      if (!response.ok) throw new Error("Failed to add brand term");
      const result = await response.json();
      if (result.success) {
        toast.success("Brand term added successfully!");
        await get().fetchBrandTerms();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error adding brand term", { description: message });
    }
  },
  updateBrandTerm: async (term) => {
    try {
      const response = await fetch(`/api/brand-terms/${term.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(term)
      });
      if (!response.ok) throw new Error("Failed to update brand term");
      const result = await response.json();
      if (result.success) {
        toast.success("Brand term updated successfully!");
        await get().fetchBrandTerms();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error updating brand term", { description: message });
    }
  },
  deleteBrandTerm: async (id) => {
    try {
      const response = await fetch(`/api/brand-terms/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) throw new Error("Failed to delete brand term");
      const result = await response.json();
      if (result.success) {
        toast.success("Brand term deleted successfully!");
        await get().fetchBrandTerms();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error deleting brand term", { description: message });
    }
  },
  updateBrandTermTranslations: async (termId, translations) => {
    try {
      const response = await fetch(`/api/brand-terms/${termId}/translations`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(translations),
      });
      if (!response.ok) throw new Error("Failed to update translations");
      const result = await response.json();
      if (result.success) {
        toast.success("Translations updated successfully!");
        await get().fetchBrandTerms();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error updating translations", { description: message });
    }
  },
  fetchHistory: async () => {
    set({ historyLoading: true, historyError: null });
    try {
      const response = await fetch("/api/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      const result = await response.json();
      if (result.success) {
        set({ history: result.data });
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      set({ historyError: message });
      toast.error("Error fetching history", { description: message });
    } finally {
      set({ historyLoading: false });
    }
  },
  addHistoryItem: async (itemData) => {
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error("Failed to save history item");
      const result = await response.json();
      if (result.success) {
        // No toast needed here, it's handled in the component
        await get().fetchHistory(); // Refresh history list
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred";
      toast.error("Error saving translation", { description: message });
    }
  },
  toggleDefaultLanguage: (langId) =>
  set((state) => {
    const currentDefaults = state.settings.defaultLanguages;
    const newDefaults = currentDefaults.includes(langId) ?
    currentDefaults.filter((id) => id !== langId) :
    [...currentDefaults, langId];
    return {
      settings: { ...state.settings, defaultLanguages: newDefaults }
    };
  }),
  setTheme: (theme) =>
  set((state) => ({
    settings: { ...state.settings, theme }
  }))
}));