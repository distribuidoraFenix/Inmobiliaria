// src/components/sucursales/ListaSucursales.tsx
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Building2, Eye, FileText, MapPin, Pencil, Trash2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { TablePageHeader } from "../common/TablePageHeader";
import { TableContainer } from "../common/TableContainer";

interface Sucursal {
  id: number;
  nombre_sucursal: string;
  departamento: string;
  direccion: string;
  created_at: string;
  estado: string;
}

export default function ListaSucursales() {
  const { rol } = useAuth();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de detalle individual (temporal para la estructura visual que pediste)
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("sucursales")
        .select("*")
        .order("id", { ascending: true });

      if (fetchError) throw fetchError;
      setSucursales(data || []);
    } catch (err: any) {
      console.error("Error al consultar sucursales:", err);
      setError(err.message || "No se pudieron sincronizar las sucursales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rol === "admin") {
      cargarSucursales();
    }
  }, [rol]);

  // Restricción administrativa
  if (rol && rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in text-(--color-app-text) select-none">
      {/* 1. Componente de Encabezado Superior Reutilizable */}
      <TablePageHeader
        titulo="Panel de Gestión de Sucursales"
        subtitulo="Control de oficinas regionales, direcciones y distribución física"
        iconoPrincipal={Building2}
        linkRegreso="/dashboard"
        textoLinkRegreso="Volver al Panel"
        onNuevo={() => alert("Próximamente modal de nueva sucursal")}
        onSincronizar={cargarSucursales}
        onExportarExcel={() => alert("Exportando Excel de sucursales...")}
        onExportarPdf={() => alert("Imprimiendo PDF de sucursales...")}
      />

      {/* 2. Componente de Tabla Base Reutilizable con Paginación y Buscador Multicampo */}
      <TableContainer
        data={sucursales}
        loading={loading}
        error={error}
        placeholderBuscador="Buscar por nombre de sucursal, departamento, estado o dirección..."
        searchFields={(s) => [
          s.nombre_sucursal,
          s.departamento,
          s.direccion,
          s.estado,
        ]}
        renderHeader={() => (
          <tr className="bg-black/20 dark:bg-zinc-950 border-b border-zinc-700/40 text-[10px] font-black uppercase tracking-wider text-(--color-app-text-muted)">
            <th className="py-3.5 px-4">ID</th>
            <th className="py-3.5 px-4">Sucursal</th>
            <th className="py-3.5 px-4">Departamento</th>
            <th className="py-3.5 px-4">Dirección Física</th>
            <th className="py-3.5 px-4">Estado</th>
            <th className="py-3.5 px-4 text-center">Acciones</th>
          </tr>
        )}
        renderRow={(sucursal) => (
          <tr
            key={sucursal.id}
            className="hover:bg-black/5 dark:hover:bg-zinc-950/40 transition-colors"
          >
            <td className="py-3.5 px-4 font-mono text-(--color-app-text-muted)">
              #{sucursal.id}
            </td>
            <td className="py-3.5 px-4 font-bold text-(--color-app-text) whitespace-nowrap flex items-center gap-2">
              <Building2 className="size-4 text-(--color-primary)" />
              {sucursal.nombre_sucursal}
            </td>
            <td className="py-3.5 px-4 whitespace-nowrap">
              <span className="bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                {sucursal.departamento}
              </span>
            </td>
            <td className="py-3.5 px-4 text-(--color-app-text-muted) flex items-center gap-1.5">
              <MapPin className="size-3.5 text-rose-500 shrink-0" />
              <span className="truncate max-w-md">{sucursal.direccion}</span>
            </td>

            {/* Badge de Estado */}
            <td className="py-3.5 px-4 text-center whitespace-nowrap">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                  sucursal.estado === "Activo"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-red-800/10 text-red-500 border-red-700/60"
                }`}
              >
                {sucursal.estado}
              </span>
            </td>

            <td className="py-3.5 px-4 text-center whitespace-nowrap">
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => setSucursalSeleccionada(sucursal)}
                  className="size-7 rounded-lg bg-(--color-app-input) border border-zinc-700/40 hover:border-(--color-primary)/40 text-(--color-app-text-muted) hover:text-(--color-primary) transition-all flex items-center justify-center cursor-pointer active:scale-90"
                  title="Ver detalle de sucursal"
                >
                  <Eye className="size-3.5" />
                </button>
                <button
                  onClick={() =>
                    alert(`Imprimiendo ficha de ${sucursal.nombre_sucursal}`)
                  }
                  className="size-7 rounded-lg bg-(--color-app-input) border border-zinc-700/40 hover:border-zinc-500 text-(--color-app-text-muted) hover:text-(--color-app-text) transition-all flex items-center justify-center cursor-pointer active:scale-90"
                  title="Imprimir boleta PDF"
                >
                  <FileText className="size-3.5" />
                </button>
                <button
                  onClick={() =>
                    alert(`Editar sucursal: ${sucursal.nombre_sucursal}`)
                  }
                  className="size-7 rounded-lg bg-(--color-app-input) border border-zinc-700/40 hover:border-amber-500/40 text-(--color-app-text-muted) hover:text-amber-400 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                  title="Editar sucursal"
                >
                  <Pencil className="size-3.5" />
                </button>

                {/* Botón Eliminar / Baja Lógica (Listo para configurar después) */}
                <button
                  onClick={() =>
                    alert(`Eliminar sucursal: ${sucursal.nombre_sucursal}`)
                  }
                  className="size-7 rounded-lg bg-(--color-app-input) border border-zinc-700/40 hover:border-rose-500/40 text-(--color-app-text-muted) hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                  title="Eliminar sucursal"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      {/* Modal visual rápido para el botón de ver detalle */}
      {sucursalSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-(--color-app-card) border border-zinc-700/40 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-base font-black text-(--color-app-text) tracking-tight mb-2">
              {sucursalSeleccionada.nombre_sucursal}
            </h3>
            <p className="text-xs text-(--color-app-text-muted) mb-4">
              Departamento de {sucursalSeleccionada.departamento}
            </p>
            <div className="p-3 bg-(--color-app-input) border border-zinc-700/40 rounded-xl space-y-2 text-xs">
              <p>
                <strong className="text-(--color-app-text-muted)">
                  Dirección:
                </strong>{" "}
                {sucursalSeleccionada.direccion}
              </p>
              <p>
                <strong className="text-(--color-app-text-muted)">
                  Registrada:
                </strong>{" "}
                {new Date(sucursalSeleccionada.created_at).toLocaleDateString(
                  "es-BO",
                )}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSucursalSeleccionada(null)}
                className="bg-(--color-app-input) hover:bg-zinc-700/40 text-(--color-app-text) text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
