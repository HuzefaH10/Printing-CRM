"use client";

import React from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormContainerProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => Promise<void> | void;
  children: React.ReactNode;
  submitLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function FormContainer<T extends FieldValues>({
  form,
  onSubmit,
  children,
  submitLabel = "Save",
  loadingLabel = "Saving...",
  isLoading = false,
  className,
}: FormContainerProps<T>) {
  
  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        <div className="space-y-6">
          {children}
        </div>
        
        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={isLoading || form.formState.isSubmitting}>
            {(isLoading || form.formState.isSubmitting) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLoading || form.formState.isSubmitting ? loadingLabel : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
