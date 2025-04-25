import React from "react";
import { ToastProvider, ToastViewport, Toast, ToastClose, ToastTitle, ToastDescription } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";

export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(t => (
        <Toast key={t.id} {...t}>
          <ToastTitle>{t.title}</ToastTitle>
          <ToastDescription>{t.description}</ToastDescription>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
