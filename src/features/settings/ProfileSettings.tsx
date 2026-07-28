"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  timezone: z.string(),
  language: z.string(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      timezone: profile?.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: profile?.preferences?.language || "en",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    if (!profile) return;
    setIsLoading(true);
    try {
      await UserService.updateProfile(profile.uid, {
        displayName: data.displayName,
        preferences: {
          ...profile.preferences,
          timezone: data.timezone,
          language: data.language,
        },
      });
      toast({
        title: "Profile updated",
        description: "Your profile changes have been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">
          Update your personal information and basic settings.
        </p>
      </div>
      <div className="border-t"></div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input id="displayName" {...form.register("displayName")} />
          {form.formState.errors.displayName && (
            <p className="text-xs text-destructive">{form.formState.errors.displayName.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile?.email || ""} disabled />
          <p className="text-xs text-muted-foreground">Email addresses are tied to your authentication provider.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" {...form.register("timezone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Input id="language" {...form.register("language")} />
          </div>
        </div>

        <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </div>
  );
}
