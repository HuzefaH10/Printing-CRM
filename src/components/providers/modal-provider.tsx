"use client";

import { useEffect, useState } from "react";
import { useModal } from "@/hooks/use-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);
  const { type, isOpen, close, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const handleConfirm = async () => {
    if (data.onConfirm) {
      setIsLoading(true);
      try {
        await data.onConfirm();
        close();
      } catch (error) {
        console.error("Modal confirmation error:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      close();
    }
  };

  const handleCancel = () => {
    if (data.onCancel) {
      data.onCancel();
    }
    close();
  };

  const renderConfirmationModal = () => (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data.title || "Confirm Action"}</DialogTitle>
          <DialogDescription>
            {data.description || "Are you sure you want to proceed?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderDeleteModal = () => (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{data.title || "Delete Record"}</DialogTitle>
          <DialogDescription>
            {data.description || "Are you sure you want to delete this record? This action cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Switch statement to render different modal types
  switch (type) {
    case "CONFIRMATION":
      return renderConfirmationModal();
    case "DELETE":
      return renderDeleteModal();
    // Add other types like FORM, PREVIEW, etc.
    default:
      return null;
  }
}
