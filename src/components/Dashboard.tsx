// src/components/Dashboard.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Building2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ListCardInfo } from "./dashboard/ListCardInfo";
import { RankingAgentes } from "./dashboard/RankingAgentes";
import { RankingConsignaciones } from "./dashboard/RankingConsignaciones";
import { GraficoProduccion } from "./dashboard/GraficoProduccion";

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

      {/* Renderizado modular de tarjetas informativas y de acceso rápido */}
      <ListCardInfo />
      {/* Sección de Widgets en dos columnas para pantallas medianas/grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RankingAgentes />
        <RankingConsignaciones />
      </div>
      {/* Sección grafico */}
      <GraficoProduccion />
    </div>
  );
}
