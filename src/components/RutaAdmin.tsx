import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface RutaAdminProps {
  children: React.ReactNode;
}

export default function RutaAdmin({ children }: RutaAdminProps) {
  const { rol, loading } = useAuth();

  // 1. Mientras valida el rol desde Supabase, mostramos carga
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-xs font-semibold">
        Verificando permisos...
      </div>
    );
  }

  // 2. Si NO es administrador, lo expulsamos inmediatamente al catálogo de inicio
  if (rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  // 3. Si SÍ es administrador, permitimos renderizar la pantalla (el formulario)
  return <>{children}</>;
}
