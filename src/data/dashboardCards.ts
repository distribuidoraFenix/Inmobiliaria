import { Users, Home, TrendingUp, Building2, MapPin } from "lucide-react";

export interface DashboardCardConfig {
  id: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  icono: any;
  colorIcono: string; // Clases de Tailwind para el color
  rutaRedireccion: string;
  // Si requiere contar registros de una tabla de Supabase:
  tablaContador?: string; 
}

export const DASHBOARD_CARDS_CONFIG: DashboardCardConfig[] = [
  {
    id: "propiedades",
    titulo: "Propiedades",
    subtitulo: "Catálogo General",
    descripcion: "Control de inmuebles y estados de disponibilidad.",
    icono: Home,
    colorIcono: "text-amber-400",
    rutaRedireccion: "/lista-propiedades",
    tablaContador: "propiedades", // Traerá el conteo dinámico desde Supabase
  },
  {
    id: "agentes",
    titulo: "Gestión de Agentes",
    subtitulo: "Panel de Personal",
    descripcion: "Administra cuentas y permisos corporativos.",
    icono: Users,
    colorIcono: "text-blue-400",
    rutaRedireccion: "/lista-agentes",
    tablaContador: "perfiles", // Traerá el conteo dinámico desde Supabase
  },
  {
    id: "sucursales",
    titulo: "Sucursales",
    subtitulo: "Red de Oficinas",
    descripcion: "Ubicaciones y puntos de atención físicos.",
    icono: MapPin,
    colorIcono: "text-purple-400",
    rutaRedireccion: "/lista-sucursales",
    tablaContador: "sucursales", // Tabla de ejemplo (asegúrate de crearla o adaptarla luego)
  },
  {
    id: "catalogo-general",
    titulo: "Catálogo General",
    subtitulo: "Vista Global",
    descripcion: "Acceso directo al catálogo público de inmuebles.",
    icono: Building2,
    colorIcono: "text-sky-400",
    rutaRedireccion: "/propiedades",
    // Sin tablaContador: Funciona solo como enlace de redirección pura
  },
  {
    id: "operaciones",
    titulo: "Métricas",
    subtitulo: "Estadísticas",
    descripcion: "Monitoreo de actividad de la empresa.",
    icono: TrendingUp,
    colorIcono: "text-emerald-400",
    rutaRedireccion: "/dashboard", // O la ruta que prefieras más adelante
    // Sin tablaContador: Podrías ponerle valor estático o dejarlo como enlace puro
  },
];