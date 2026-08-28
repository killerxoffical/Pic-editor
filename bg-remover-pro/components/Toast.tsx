"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { useEffect } from "react";

export type ToastKind = "error" | "success";

interface ToastProps {
  message: string;
  kind: ToastKind;
  onClose: () => void;
}

export default function Toast({ message, kind, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const isError = kind === "error";

  return (
    <div
      role="alert"
      className={cnToast(isError)}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
      ) : (
        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
      )}
      <span className="text-sm text-slate-100 leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function cnToast(isError: boolean) {
  return [
    "fixed top-6 right-6 z-50 flex items-center gap-3 max-w-sm",
    "px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md",
    "animate-fadeIn",
    isError
      ? "bg-rose-950/90 border-rose-500/30"
      : "bg-emerald-950/90 border-emerald-500/30",
  ].join(" ");
}
