// src/components/navigation/SidebarMenu.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  X,
  Building2,
  ChevronDown,
  Users,
  Store,
  Home,
  FolderKanban,
  Settings,
} from "lucide-react";
import { menuSecciones } from "../../data/navigationConfig";

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  rol: string | null;
  nombreEmpresa: string;
}

export function SidebarMenu({
  isOpen,
  onClose,
  rol,
  nombreEmpresa,
}: SidebarMenuProps) {
  const [seccionesAbiertas, setSeccionesAbiertas] = useState<
    Record<string, boolean>
  >({
    Propiedades: true,
  });

  if (!isOpen) return null;

  const toggleSeccion = (label: string) => {
    setSeccionesAbiertas((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Función para retornar el icono correspondiente según la sección
  const obtenerIconoSeccion = (label: string) => {
    switch (label.toLowerCase()) {
      case "agentes":
        return <Users className="w-4 h-4 text-blue-400 shrink-0" />;
      case "sucursales":
        return <Store className="w-4 h-4 text-emerald-400 shrink-0" />;
      case "clientes":
        return <Users className="w-4 h-4 text-purple-400 shrink-0" />;
      case "propiedades":
        return <Home className="w-4 h-4 text-amber-400 shrink-0" />;
      case "proyectos / desarrollos":
        return <FolderKanban className="w-4 h-4 text-cyan-400 shrink-0" />;
      case "configuración":
        return <Settings className="w-4 h-4 text-indigo-400 shrink-0" />;
      default:
        return <Building2 className="w-4 h-4 text-zinc-400 shrink-0" />;
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-30 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 left-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 z-40 p-3 transition-transform flex flex-col shadow-2xl">
        {/* Cabecera del Sidebar con Nombre de Empresa dinámico */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-bold text-xs text-blue-400 truncate uppercase tracking-wide">
              {nombreEmpresa}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-colors shrink-0"
            aria-label="Cerrar menú"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Listado tipo Acordeón con iconos y tamaño reducido */}
        <nav className="flex flex-col gap-1.5 overflow-y-auto grow pr-1 scrollbar-thin">
          {menuSecciones.map((seccion, index) => {
            if (seccion.soloAdmin && rol !== "admin") return null;

            const estaAbierta = !!seccionesAbiertas[seccion.label];

            return (
              <div key={index} className="border-b border-zinc-900/80 pb-1">
                {/* Cabecera desplegable de la Sección */}
                <button
                  onClick={() => toggleSeccion(seccion.label)}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {obtenerIconoSeccion(seccion.label)}
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 group-hover:text-white truncate">
                      {seccion.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 shrink-0 ${
                      estaAbierta ? "transform rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Sub-enlaces colapsables */}
                {estaAbierta && (
                  <div className="flex flex-col gap-1 pl-6 mt-1 border-l border-zinc-800/60 ml-3 animate-fade-in">
                    {seccion.enlaces.map((enlace, linkIdx) => {
                      if (enlace.soloAdmin && rol !== "admin") return null;

                      const claseEnlace =
                        "px-2 py-1 rounded-md text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer text-[11px] font-medium block truncate";

                      if (enlace.to) {
                        return (
                          <Link
                            key={linkIdx}
                            to={enlace.to}
                            onClick={onClose}
                            className={claseEnlace}
                          >
                            {enlace.label}
                          </Link>
                        );
                      }

                      return (
                        <a
                          key={linkIdx}
                          href={enlace.href}
                          onClick={onClose}
                          className={claseEnlace}
                        >
                          {enlace.label}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </>
  );
}
