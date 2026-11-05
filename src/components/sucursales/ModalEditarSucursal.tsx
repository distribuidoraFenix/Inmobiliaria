import { useState, useEffect } from "react";
import { Building2, X, Save } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface Sucursal {
  id: number;
  nombre_sucursal: string;
  departamento: string;
  direccion: string;
  estado: string;
}

interface ModalEditarSucursalProps {
  isOpen: boolean;
  onClose: () => void;
  sucursal: Sucursal | null;
  onSucursalActualizada: () => void;
}

const DEPARTAMENTOS_BOLIVIA = [
  "La Paz",
  "Santa Cruz",
  "Cochabamba",
  "Tarija",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Beni",
  "Pando",
];

export function ModalEditarSucursal({
  isOpen,
  onClose,
  sucursal,
  onSucursalActualizada,
}: ModalEditarSucursalProps) {
  const [nombre, setNombre] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sucursal) {
      setNombre(sucursal.nombre_sucursal || "");
      setDepartamento(sucursal.departamento || "La Paz");
      setDireccion(sucursal.direccion || "");
    }
  }, [sucursal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sucursal) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from("sucursales")
        .update({
          nombre_sucursal: nombre,
          departamento: departamento,
          direccion: direccion,
          // Ya no tocamos el estado aquí
        })
        .eq("id", sucursal.id);

      if (error) throw error;

      onSucursalActualizada();
      onClose();
    } catch (err) {
      console.error("Error al actualizar la sucursal:", err);
      alert("Hubo un error al actualizar la sucursal.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !sucursal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Editar Sucursal
              </h2>
              <p className="text-xs text-zinc-400">ID #{sucursal.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Cerrar (ESC)"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Formulario de Edición (Sin estado) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold uppercase tracking-wider">
              Nombre de la Sucursal
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold uppercase tracking-wider">
              Departamento
            </label>
            <select
              value={departamento}
              onChange={(e) => setDepartamento(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
            >
              <option value="" disabled>
                Seleccione un departamento
              </option>
              {DEPARTAMENTOS_BOLIVIA.map((dep) => (
                <option
                  key={dep}
                  value={dep}
                  className="bg-zinc-900 text-white"
                >
                  {dep}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-zinc-400 font-semibold uppercase tracking-wider">
              Dirección Física
            </label>
            <textarea
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              rows={2}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Pie de Página / Botones */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="size-4" />
              <span>{loading ? "Guardando..." : "Guardar Cambios"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
