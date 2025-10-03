import {
  Languages,
  BookMarked,
  History,
  Settings,
  type LucideIcon,
} from "lucide-react";
import type { HistoryItem } from "../../worker/types";
export type NavLink = {
  id: "translator" | "brand-terms" | "history" | "settings";
  label: string;
  icon: LucideIcon;
};
export const NAV_LINKS: NavLink[] = [
  { id: "translator", label: "Translator", icon: Languages },
  { id: "brand-terms", label: "Brand Terms", icon: BookMarked },
  { id: "history", label: "History & Analytics", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];
export type Language = {
  id: string;
  name: string;
};
export const AVAILABLE_LANGUAGES: Language[] = [
  { id: "zh-TW", name: "Traditional Chinese (Taiwan)" },
  { id: "zh-HK", name: "Traditional Chinese (Hong Kong)" },
  { id: "en-AU", name: "English (Australia)" },
  { id: "en-HK", name: "English (Hong Kong)" },
  { id: "en-MY", name: "English (Malaysia)" },
  { id: "en-SG", name: "English (Singapore)" },
  { id: "en-IN", name: "English (India)" },
  { id: "th", name: "Thai" },
  { id: "vi", name: "Vietnamese" },
  { id: "ms", name: "Malay" },
];

export type { HistoryItem };