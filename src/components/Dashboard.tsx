// src/components/Dashboard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Users, Home, TrendingUp, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Dashboard() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si ya terminó de cargar el contexto y el rol NO es admin, lo expulsamos a propiedades
    if (!loading && profile && profile.rol !== "admin") {
      navigate("/propiedades", { replace: true });
    }
  }, [profile, loading, navigate]);

  // Si aún está cargando la sesión/perfil, mostramos un indicador limpio
  if (loading) {
    return (
      <div className="min-h-screen bg-(--color-app-bg) flex items-center justify-center text-(--color-app-text-muted) text-xs font-semibold">
        Verificando permisos de acceso...
      </div>
    );
  }

  // Si no es admin, no renderizamos nada mientras actúa el useEffect de redirección
  if (profile?.rol !== "admin") {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabecera del Panel de Control */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-(--color-app-card) border border-zinc-700/40 p-6 rounded-2xl shadow-xl transition-colors duration-300">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/10 text-blue-400 p-1.5 rounded-lg border border-blue-500/20">
              <ShieldAlert className="size-5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-(--color-app-text) uppercase">
              Panel de Administración
            </h1>
          </div>
          <p className="text-xs text-(--color-app-text-muted)">
            Bienvenido de nuevo,{" "}
            <strong className="text-(--color-app-text)">
              {profile?.nombres} {profile?.apellido_paterno}
            </strong>
            . Aquí tienes el control general del sistema.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-(--color-primary)/10 text-(--color-primary) px-4 py-2 rounded-xl text-xs font-bold border border-(--color-primary)/20">
          <Building2 className="size-4" />
          <span>Rol: Administrador</span>
        </div>
      </div>

      {/* Grid de Métricas o Accesos Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-(--color-app-card) border border-zinc-700/40 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-(--color-app-text-muted)">
            <span className="text-xs font-bold uppercase tracking-wider">
              Gestión de Agentes
            </span>
            <Users className="size-5 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-(--color-app-text)">
            Panel de Personal
          </p>
          <p className="text-[11px] text-(--color-app-text-muted)">
            Administra cuentas y permisos corporativos.
          </p>
        </div>

        <div className="bg-(--color-app-card) border border-zinc-700/40 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-(--color-app-text-muted)">
            <span className="text-xs font-bold uppercase tracking-wider">
              Propiedades
            </span>
            <Home className="size-5 text-amber-400" />
          </div>
          <p className="text-lg font-bold text-(--color-app-text)">
            Catálogo General
          </p>
          <p className="text-[11px] text-(--color-app-text-muted)">
            Control de inmuebles y estados de disponibilidad.
          </p>
        </div>

        <div className="bg-(--color-app-card) border border-zinc-700/40 p-5 rounded-2xl shadow-lg space-y-2">
          <div className="flex items-center justify-between text-(--color-app-text-muted)">
            <span className="text-xs font-bold uppercase tracking-wider">
              Métricas
            </span>
            <TrendingUp className="size-5 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-(--color-app-text)">
            Estadísticas
          </p>
          <p className="text-[11px] text-(--color-app-text-muted)">
            Monitoreo de actividad de la empresa.
          </p>
        </div>
      </div>
    </div>
  );
}
