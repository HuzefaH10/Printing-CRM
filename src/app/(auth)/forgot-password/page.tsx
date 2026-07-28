"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthService } from "@/services/auth.service";
import { toast } from "@/components/ui/toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await AuthService.resetPassword(data.email);
      setIsSubmitted(true);
      toast.add({
        title: "Reset link sent",
        description: "If an account exists, you will receive an email shortly.",
      });
    } catch (error: any) {
      toast.add({
        type: "error",
        title: "Error",
        description: "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 rounded-lg bg-primary mx-auto flex items-center justify-center mb-6 shadow-sm">
            <span className="text-primary-foreground text-xl font-bold">OS</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm p-6 sm:p-8">
          {isSubmitted ? (
            <div className="space-y-4 text-center">
              <div className="bg-muted p-4 rounded-lg inline-block mb-2">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Check your email</h3>
              <p className="text-sm text-muted-foreground">
                We have sent a password reset link to <br />
                <span className="font-medium text-foreground">{form.getValues().email}</span>
              </p>
              <Button variant="outline" className="w-full mt-4" onClick={() => setIsSubmitted(false)}>
                Try another email
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="operator@printingos.com"
                  type="email"
                  disabled={isLoading}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Send reset link
              </Button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
