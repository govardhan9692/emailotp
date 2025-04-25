import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

// Re-export with proper types
const Toaster = ({ ...props }: React.ComponentProps<typeof SonnerToaster>) => {
  return (
    <SonnerToaster
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground",
          description: "group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

// Export both Toaster and named as Sonner to support both import styles
export { Toaster, Toaster as Sonner };
