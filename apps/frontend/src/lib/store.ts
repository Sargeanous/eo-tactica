import { create } from "zustand";
import type { SessionUser } from "@eo-tactica/shared";
import { DEFAULT_SCENARIO, type Scenario } from "@eo-tactica/shared";

export type Locale = "en" | "ar";

const TOKEN_KEY = "eo-tactica.token";
const USER_KEY = "eo-tactica.user";
const LOCALE_KEY = "eo-tactica.locale";

function readPersistedToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function readPersistedUser(): SessionUser | null {
  try {
    const raw =
      sessionStorage.getItem(USER_KEY) ?? localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function readPersistedLocale(): Locale {
  try {
    const raw = localStorage.getItem(LOCALE_KEY);
    return raw === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

interface AppState {
  token: string | null;
  user: SessionUser | null;
  locale: Locale;
  scenario: Scenario;
  sidebarCollapsed: boolean;
  collapsedGroups: Record<string, boolean>;
  setSession: (token: string, user: SessionUser) => void;
  clearSession: () => void;
  setLocale: (l: Locale) => void;
  setScenario: (patch: Partial<Scenario>) => void;
  resetScenario: () => void;
  toggleSidebar: () => void;
  toggleGroup: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  token: readPersistedToken(),
  user: readPersistedUser(),
  locale: readPersistedLocale(),
  scenario: DEFAULT_SCENARIO,
  sidebarCollapsed: false,
  collapsedGroups: {},
  setSession: (token, user) => {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
    set({ token, user });
  },
  clearSession: () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    set({ token: null, user: null });
  },
  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* ignore */
    }
    set({ locale });
  },
  setScenario: (patch) =>
    set((state) => ({ scenario: { ...state.scenario, ...patch } })),
  resetScenario: () => set({ scenario: DEFAULT_SCENARIO }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleGroup: (id) =>
    set((state) => ({
      collapsedGroups: {
        ...state.collapsedGroups,
        [id]: !state.collapsedGroups[id],
      },
    })),
}));
