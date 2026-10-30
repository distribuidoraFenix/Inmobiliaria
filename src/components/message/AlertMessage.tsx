import { useEffect } from "react";
import { ModalBase } from "./ModalBase";
import { CheckCircle2, Info, XCircle, Loader2 } from "lucide-react";

interface AlertMessageProps {
  isOpen: boolean;
  type: "info" | "success_loader" | "error";
  title: string;
  message: string;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function AlertMessage({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "Aceptar",
  cancelText = "Cancelar",
}: AlertMessageProps) {
  // Lógica para el cierre automático de 3 segundos con loader para éxito/login
  useEffect(() => {
    if (type === "success_loader" && isOpen) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  return (
    <ModalBase isOpen={isOpen}>
      <div className="flex items-start gap-3">
        {type === "info" && (
          <Info className="size-6 text-(--color-primary) shrink-0 mt-0.5" />
        )}
        {type === "success_loader" && (
          <CheckCircle2 className="size-6 text-(--color-success) shrink-0 mt-0.5" />
        )}
        {type === "error" && (
          <XCircle className="size-6 text-(--color-alert) shrink-0 mt-0.5" />
        )}

        <div className="space-y-1">
          {type === "info" && (
            <>
              <h4 className="text-sm font-normal tracking-tight text-(--color-primary) uppercase">
                {title}
              </h4>
            </>
          )}
          {type === "success_loader" && (
            <>
              <h4 className="text-sm font-normal tracking-tight text-(--color-success) uppercase">
                {title}
              </h4>
            </>
          )}
          {type === "error" && (
            <>
              <h4 className="text-sm font-normal tracking-tight text-(--color-alert) uppercase">
                {title}
              </h4>
            </>
          )}

          <p className="text-xs text-(--color-app-text) leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {/* Loader visual success_loader */}
      {type === "success_loader" && (
        <div className="flex items-center justify-center gap-2 py-3  rounded-xl">
          <Loader2 className="size-8 font-bold animate-spin text-(--color-success)" />
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
        {type === "error" && (
          <button
            type="button"
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            {cancelText}
          </button>
        )}

        {type !== "success_loader" && (
          <button
            type="button"
            onClick={onConfirm || onClose}
            className={`text-xs font-black px-5 py-2 rounded-xl transition-all cursor-pointer shadow-md ${
              type === "error"
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
            }`}
          >
            {confirmText}
          </button>
        )}
      </div>
    </ModalBase>
  );
}
