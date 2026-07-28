export type Role = "Owner" | "Admin" | "Sales" | "Production" | "Accounts" | "Viewer";

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  timezone: string;
  language: string;
  keyboardShortcutsEnabled: boolean;
  commandPaletteEnabled: boolean;
  defaultDashboard: string;
}

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushAlerts: boolean;
  dailyDigest: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: Role;
  status: "active" | "suspended" | "pending";
  createdAt: number;
  lastLogin: number;
  preferences: UserPreferences;
  notificationPreferences: NotificationPreferences;
  favoritePages: string[];
  pinnedCompanies: string[];
  recentSearches: string[];
}
