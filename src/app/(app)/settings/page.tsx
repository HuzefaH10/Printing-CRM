"use client";

import { useState } from "react";
import { ProfileSettings } from "@/features/settings/ProfileSettings";
import { AppearanceSettings } from "@/features/settings/AppearanceSettings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "appearance", label: "Appearance" },
    { id: "preferences", label: "Preferences" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
    { id: "system", label: "System" },
  ];

  return (
    <div className="flex flex-col h-full space-y-8 max-w-5xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8 flex-1">
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex space-x-2 md:flex-col md:space-x-0 md:space-y-1 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
          
          {/* Placeholders for other tabs */}
          {["preferences", "security", "notifications", "system"].includes(activeTab) && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-medium capitalize">{activeTab}</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your {activeTab} settings.
                </p>
              </div>
              <div className="border-t"></div>
              <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed bg-card/50">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-xl opacity-50">🚧</span>
                </div>
                <h4 className="text-md font-medium mb-1">Coming Soon</h4>
                <p className="text-sm text-muted-foreground text-center">
                  This section of the OS is currently under construction.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
