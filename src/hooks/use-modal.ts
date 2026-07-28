import { create } from "zustand";

export type ModalType = 
  | "CONFIRMATION" 
  | "DELETE" 
  | "ARCHIVE" 
  | "UPLOAD" 
  | "PREVIEW" 
  | "FORM" 
  | "AI_PROMPT";

interface ModalData {
  title?: string;
  description?: string;
  entityId?: string;
  entityType?: string;
  payload?: any;
  onConfirm?: (data?: any) => void | Promise<void>;
  onCancel?: () => void;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  open: (type: ModalType, data?: ModalData) => void;
  close: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  open: (type, data = {}) => set({ isOpen: true, type, data }),
  close: () => set({ isOpen: false, type: null, data: {} }),
}));
