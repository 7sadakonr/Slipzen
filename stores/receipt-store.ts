import { create } from 'zustand';
import { ResolvedCategory } from '../features/categories/hooks/use-resolve-category';

interface ReceiptState {
  imageUri: string | null;
  base64: string | null; // For AI processing
  source: 'camera' | 'gallery' | null;
  storagePath: string | null;
  aiResult: any | null; // Parsed JSON from AI
  resolvedCategory: ResolvedCategory | null; // Category resolution result
  error: string | null;
  setImage: (uri: string, source: 'camera' | 'gallery', base64?: string) => void;
  setStoragePath: (path: string) => void;
  setAiResult: (result: any) => void;
  setResolvedCategory: (category: ResolvedCategory) => void;
  setError: (error: string | null) => void;
  clear: () => void;
}

export const useReceiptStore = create<ReceiptState>((set) => ({
  imageUri: null,
  base64: null,
  source: null,
  storagePath: null,
  aiResult: null,
  resolvedCategory: null,
  error: null,
  setImage: (uri, source, base64) => set({ imageUri: uri, source, base64, error: null }),
  setStoragePath: (path) => set({ storagePath: path }),
  setAiResult: (result) => set({ aiResult: result }),
  setResolvedCategory: (category) => set({ resolvedCategory: category }),
  setError: (error) => set({ error }),
  clear: () => set({ imageUri: null, base64: null, source: null, storagePath: null, aiResult: null, resolvedCategory: null, error: null }),
}));
