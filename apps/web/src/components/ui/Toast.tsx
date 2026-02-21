"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";

type ToastType = "info" | "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
  visible: boolean;
};

type ToastContextValue = {
  push: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      const newToast = { id, message, type, visible: false };
      
      setToasts((prev) => [...prev, newToast]);
      
      // Show animation
      setTimeout(() => {
        setToasts((prev) => 
          prev.map(toast => 
            toast.id === id ? { ...toast, visible: true } : toast
          )
        );
      }, 10);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => 
          prev.map(toast => 
            toast.id === id ? { ...toast, visible: false } : toast
          )
        );
        setTimeout(() => remove(id), 300);
      }, 2800);
    },
    [remove]
  );

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite" aria-atomic>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.visible ? 'toast-visible' : 'toast-hidden'}`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return ctx;
}
