"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/user.service";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Monitor, Moon, Sun } from "lucide-react";

export function AppearanceSettings() {
  const { profile } = useAuth();
  const { setTheme, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (!profile) return;
    
    setIsLoading(true);
    try {
      await UserService.updateProfile(profile.uid, {
        preferences: {
          ...profile.preferences,
          theme: newTheme,
        },
      });
      toast.add({
        title: "Theme updated",
        description: `Theme has been set to ${newTheme}.`,
      });
    } catch (error) {
      toast.add({
        type: "error",
        title: "Error",
        description: "Failed to save theme preference.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the Printing OS looks on your device.
        </p>
      </div>
      <div className="border-t"></div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-3">Theme Preference</h4>
          <div className="grid grid-cols-3 gap-4">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleThemeChange("light")}
              disabled={isLoading}
            >
              <Sun className="h-6 w-6" />
              <span>Light</span>
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleThemeChange("dark")}
              disabled={isLoading}
            >
              <Moon className="h-6 w-6" />
              <span>Dark</span>
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => handleThemeChange("system")}
              disabled={isLoading}
            >
              <Monitor className="h-6 w-6" />
              <span>System</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
