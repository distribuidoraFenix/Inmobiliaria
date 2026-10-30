import { useState } from "react";
import { AlertMessage } from "./AlertMessage";

export default function TestMessageView() {
  const [modalType, setModalType] = useState<
    "info" | "success_loader" | "error" | null
  >(null);

  return (
    <div className="min-h-screen bg-(--color-app-background, #09090b) text-white flex flex-col items-center justify-center p-6 space-y-6">
      <div className="max-w-md w-full bg-(--color-app-card, #18181b) border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 text-center">
        <h2 className="text-sm font-black uppercase tracking-widest text-blue-500">
          Laboratorio de Mensajes y Alertas
        </h2>
        <p className="text-xs text-zinc-400">
          Haz clic en cualquiera de los botones para probar el comportamiento
          visual en modo oscuro.
        </p>

        <div className="flex flex-col gap-3 pt-2">
          {/* Botón 1: Información */}
          <button
            onClick={() => setModalType("info")}
            className="w-full bg-blue-600 hover:bg-blue-500 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/20"
          >
            1. Probar Alerta de Información
          </button>

          {/* Botón 2: Éxito con Loader (Login simulado) */}
          <button
            onClick={() => setModalType("success_loader")}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            2. Probar Éxito / Login (Loader 3s)
          </button>

          {/* Botón 3: Error */}
          <button
            onClick={() => setModalType("error")}
            className="w-full bg-rose-600 hover:bg-rose-500 text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg shadow-rose-600/20"
          >
            3. Probar Alerta de Error
          </button>
        </div>
      </div>

      {/* Renderizado condicional de la alerta según el estado */}
      <AlertMessage
        isOpen={modalType === "info"}
        type="info"
        title="Aviso del Sistema"
        message="Esta es una notificación informativa general para el usuario dentro de la plataforma."
        onClose={() => setModalType(null)}
      />

      <AlertMessage
        isOpen={modalType === "success_loader"}
        type="success_loader"
        title="¡Bienvenido de nuevo!"
        message="Credenciales validadas correctamente. Redirigiendo a tu panel principal..."
        onClose={() => setModalType(null)}
      />

      <AlertMessage
        isOpen={modalType === "error"}
        type="error"
        title="Error de Autenticación"
        message="Las credenciales ingresadas son incorrectas o el usuario no se encuentra registrado."
        cancelText="Cancelar"
        confirmText="Reintentar"
        onClose={() => setModalType(null)}
        onConfirm={() => setModalType(null)}
      />
    </div>
  );
}
