import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { AlertMessage } from "../message/AlertMessage";
import { supabase } from "../../lib/supabaseClient";
import { Lock, Mail, ArrowRight, Eye, EyeOff, Building2 } from "lucide-react";

export function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados para visibilidad de contraseña y datos de configuración dinámicos
  const [showPassword, setShowPassword] = useState(false);
  const [empresaNombre, setEmpresaNombre] = useState("AppInmo");
  const [empresaLogo, setEmpresaLogo] = useState<string | null>(null);

  // Estados para modales de alerta
  const [modalState, setModalState] = useState<
    "success_loader" | "error" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Funcion para la configuración de la empresa al montar el componente
  useEffect(() => {
    async function fetchConfiguracion() {
      try {
        const { data, error } = await supabase
          .from("configuracion")
          .select("nombre_empresa, logo_url")
          .eq("id", 1)
          .single();

        if (!error && data) {
          if (data.nombre_empresa) setEmpresaNombre(data.nombre_empresa);
          if (data.logo_url) setEmpresaLogo(data.logo_url);
        }
      } catch (err) {
        console.error("Error al cargar la configuración:", err);
      }
    }
    fetchConfiguracion();
  }, []);

  // Submit para el envio de las credenciales
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await signIn(email, password);

    setIsLoading(false);

    if (result.success) {
      setModalState("success_loader");
    } else {
      setErrorMessage(result.error || "Credenciales inválidas.");
      setModalState("error");
    }
  };

  return (
    <div className="min-h-screen bg-(--color-app-bg) flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-(--color-app-card) border border-zinc-700/40 rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Cabecera dinámica con Logo e Identidad */}
        <div className="space-y-3 text-center flex flex-col items-center">
          {empresaLogo ? (
            <img
              src={empresaLogo}
              alt="Logo Inmobiliaria"
              className="w-32 h-32 object-contain rounded-2xl shadow-mds p-1"
            />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center shadow-inner">
              <Building2 className="size-7" />
            </div>
          )}

          <h2 className="text-xl font-black uppercase tracking-wider text-(--color-primary)">
            {empresaNombre}
          </h2>
          <p className="text-xs text-(--color-app-text-muted)">
            Ingresa tus credenciales para acceder al sistema
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-(--color-app-text) uppercase tracking-wide">
              Correo Electrónico
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-(--color-app-text-muted)">
                <Mail className="size-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full bg-(--color-app-input) text-(--color-app-text) placeholder:text-zinc-500 text-xs rounded-xl pl-10 pr-4 py-3 border border-zinc-700/40 focus:outline-none focus:border-(--color-primary) transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-(--color-app-text) uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-(--color-app-text-muted)">
                <Lock className="size-4" />
              </span>

              {/* Input con tipo dinámico para ver/ocultar contraseña */}
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-(--color-app-input) text-(--color-app-text) placeholder:text-zinc-500 text-xs rounded-xl pl-10 pr-10 py-3 border border-zinc-700/40 focus:outline-none focus:border-(--color-primary) transition-all"
              />

              {/* Botón interactivo del ojo */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-(--color-app-text-muted) hover:text-(--color-primary) transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-(--color-primary) hover:bg-(--color-primary-hover) text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? "Verificando..." : "Iniciar Sesión"}</span>
            <ArrowRight className="size-4" />
          </button>
        </form>
      </div>

      {/* Alerta de éxito con el loader */}
      <AlertMessage
        isOpen={modalState === "success_loader"}
        type="success_loader"
        title="¡Bienvenido de nuevo!"
        message="Credenciales correctas. Cargando tu sesión y panel de control..."
        onClose={() => setModalState(null)}
      />

      {/* Alerta de error */}
      <AlertMessage
        isOpen={modalState === "error"}
        type="error"
        title="Error de Acceso"
        message={errorMessage}
        confirmText="Reintentar"
        cancelText="Cerrar"
        onClose={() => setModalState(null)}
        onConfirm={() => setModalState(null)}
      />
    </div>
  );
}
