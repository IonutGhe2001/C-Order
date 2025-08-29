import * as Toast from "@radix-ui/react-toast";
import React, { createContext, useContext, useState } from "react";
import { motion } from "framer-motion";

interface ToastMessage {
  title: string;
  description?: string;
  variant?: "success" | "error";
}

const ToastContext = createContext<(msg: ToastMessage) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<ToastMessage | null>(null);

  const toast = (m: ToastMessage) => {
    setMsg(m);
    setOpen(true);
  };

  return (
    <ToastContext.Provider value={toast}>
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Root role="status" open={open} onOpenChange={setOpen} asChild>
          <motion.div
            className={`bg-white rounded shadow p-4 border flex flex-col gap-1 ${
              msg?.variant === "error" ? "border-red-500" : "border-green-500"
            }`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Toast.Title className="font-medium">{msg?.title}</Toast.Title>
            {msg?.description && (
              <Toast.Description className="text-sm">
                {msg.description}
              </Toast.Description>
            )}
          </motion.div>
        </Toast.Root>
        <Toast.Viewport className="fixed bottom-0 right-0 p-4 w-80 max-w-full flex flex-col gap-2 z-50 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}