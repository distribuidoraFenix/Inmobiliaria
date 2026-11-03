// src/components/common/TableContainer.tsx
import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

interface TableContainerProps<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  placeholderBuscador?: string;
  searchFields: (item: T) => string[];
  renderHeader: () => React.ReactNode;
  renderRow: (item: T, index: number) => React.ReactNode;
  itemsPorPagina?: number;
  mensajeVacio?: string;
}

export function TableContainer<T>({
  data,
  loading,
  error,
  placeholderBuscador = "Buscar registros...",
  searchFields,
  renderHeader,
  renderRow,
  itemsPorPagina = 4,
  mensajeVacio = "No se encontraron registros que coincidan con los criterios de búsqueda.",
}: TableContainerProps<T>) {
  const [busqueda, setBusqueda] = useState<string>("");
  const [paginaActual, setPaginaActual] = useState<number>(1);

  // Reiniciar a la página 1 cuando cambia la búsqueda
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  // Filtrado multicampo genérico
  const datosFiltrados = data.filter((item) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const campos = searchFields(item);
    return campos.some((campo) =>
      (campo || "").toLowerCase().includes(termino),
    );
  });

  const totalPaginas = Math.ceil(datosFiltrados.length / itemsPorPagina);
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const datosPaginados = datosFiltrados.slice(
    indicePrimerItem,
    indiceUltimoItem,
  );

  return (
    <div className="space-y-4">
      {/* Buscador Inteligente Multicampo */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-(--color-app-text-muted)" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={placeholderBuscador}
          className="w-full bg-(--color-app-input) border border-zinc-700/40 rounded-2xl py-3 pl-12 pr-4 text-xs text-(--color-app-text) placeholder:text-zinc-500 focus:outline-none focus:border-(--color-primary) transition-colors shadow-inner"
        />
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="p-4 rounded-xl text-xs font-semibold border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Contenedor de la Tabla */}
      <div className="bg-(--color-app-card) border border-zinc-700/40 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-(--color-app-text-muted) text-xs font-semibold">
            <Loader2 className="size-5 animate-spin text-(--color-primary)" />
            <span>Sincronizando información con la base de datos...</span>
          </div>
        ) : datosFiltrados.length === 0 ? (
          <div className="py-20 text-center text-(--color-app-text-muted) text-xs font-semibold">
            {mensajeVacio}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>{renderHeader()}</thead>
              <tbody className="divide-y divide-zinc-700/30 text-xs font-medium text-(--color-app-text)">
                {datosPaginados.map((item, index) =>
                  renderRow(item, indicePrimerItem + index),
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación Flotante */}
        {!loading && datosFiltrados.length > 0 && (
          <div className="bg-black/10 dark:bg-zinc-950/80 border-t border-zinc-700/30 px-4 py-3.5 flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold text-(--color-app-text-muted) tracking-wider">
              Mostrando{" "}
              <span className="text-(--color-app-text)">
                {indicePrimerItem + 1}
              </span>{" "}
              al{" "}
              <span className="text-(--color-app-text)">
                {Math.min(indiceUltimoItem, datosFiltrados.length)}
              </span>{" "}
              de{" "}
              <span className="text-(--color-app-text-muted)">
                {datosFiltrados.length}
              </span>{" "}
              registros
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => prev - 1)}
                className="size-8 rounded-lg border border-zinc-700/40 bg-(--color-app-input) text-(--color-app-text-muted) hover:text-(--color-app-text) hover:bg-zinc-700/20 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95"
              >
                <ChevronLeft className="size-4" />
              </button>

              <div className="bg-(--color-app-input) border border-zinc-700/40 px-3 h-8 rounded-lg flex items-center text-xs font-black text-(--color-primary) tracking-wide">
                <span>{paginaActual}</span>
                <span className="text-zinc-500 mx-1.5">/</span>
                <span className="text-(--color-app-text-muted)">
                  {totalPaginas}
                </span>
              </div>

              <button
                type="button"
                disabled={paginaActual === totalPaginas}
                onClick={() => setPaginaActual((prev) => prev + 1)}
                className="size-8 rounded-lg border border-zinc-700/40 bg-(--color-app-input) text-(--color-app-text-muted) hover:text-(--color-app-text) hover:bg-zinc-700/20 disabled:opacity-30 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
