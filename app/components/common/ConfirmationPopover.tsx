"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ConfirmationPopoverProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationPopover({
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmationPopoverProps) {
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setAnimateIn(true);
    return () => setAnimateIn(false);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          animateIn ? "opacity-100" : "opacity-0"
        )}
        onClick={onCancel}
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative w-full max-w-xs bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 border border-zinc-200 dark:border-zinc-800",
          animateIn ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        )}
      >
        <div className="p-6 text-center">
          <h4 className="text-zinc-900 dark:text-zinc-100 text-lg font-bold mb-2">{title}</h4>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-md shadow-red-500/20"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
