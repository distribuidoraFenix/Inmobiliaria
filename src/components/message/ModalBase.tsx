import React from "react";

interface ModalBaseProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function ModalBase({ isOpen, children }: ModalBaseProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-(--color-app-card) border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 ">
        {children}
      </div>
    </div>
  );
}
