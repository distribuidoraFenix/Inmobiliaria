// src/components/common/TablePageHeader.tsx
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  FileText,
  RefreshCw,
  Plus,
  Eye,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TablePageHeaderProps {
  titulo: string;
  subtitulo: string;
  iconoPrincipal: LucideIcon;
  linkRegreso?: string;
  textoLinkRegreso?: string;
  onExportarExcel?: () => void;
  onExportarPdf?: () => void;
  onNuevo?: () => void;
  textoBotonNuevo?: string;
  onSincronizar?: () => void;
  onVerDetalles?: () => void;
  textoBotonDetalles?: string;
}

export function TablePageHeader({
  titulo,
  subtitulo,
  iconoPrincipal: Icono,
  linkRegreso = "/",
  textoLinkRegreso = "Volver al Catálogo",
  onExportarExcel,
  onExportarPdf,
  onNuevo,
  textoBotonNuevo = "Nuevo Registro",
  onSincronizar,
  onVerDetalles,
  textoBotonDetalles = "Ver Detalles",
}: TablePageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <Link
          to={linkRegreso}
          className="inline-flex items-center gap-2 text-xs font-bold text-(--color-app-text-muted) hover:text-(--color-primary) transition-colors group cursor-pointer mb-2"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>{textoLinkRegreso}</span>
        </Link>
        <h2 className="text-xl font-black text-(--color-app-text) tracking-tight flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-(--color-primary)/10 text-(--color-primary) border border-(--color-primary)/20">
            <Icono className="size-5" />
          </span>
          <span>{titulo}</span>
        </h2>
        <p className="text-xs text-(--color-app-text-muted) mt-0.5">
          {subtitulo}
        </p>
      </div>

      {/* Botones de acción masiva */}
      <div className="flex flex-wrap items-center gap-2">
        {onNuevo && (
          <button
            onClick={onNuevo}
            className="cursor-pointer bg-(--color-primary) hover:bg-(--color-primary-hover) text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-600/10 active:scale-95"
          >
            <Plus className="size-4" />
            <span>{textoBotonNuevo}</span>
          </button>
        )}
        {onVerDetalles && (
          <button
            onClick={onVerDetalles}
            className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/40 text-zinc-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md active:scale-95"
          >
            <Eye className="size-4 text-blue-400" />
            <span>{textoBotonDetalles}</span>
          </button>
        )}
        {onExportarExcel && (
          <button
            onClick={onExportarExcel}
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-600/10 active:scale-95"
          >
            <Download className="size-4" />
            <span>Exportar Excel</span>
          </button>
        )}
        {onExportarPdf && (
          <button
            onClick={onExportarPdf}
            className="cursor-pointer bg-(--color-app-card) hover:bg-(--color-alert) border border-zinc-700/40 hover:border-transparent text-(--color-app-text) hover:text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md active:scale-95 group"
          >
            <FileText className="size-4 text-(--color-app-text-muted) group-hover:text-white" />
            <span>Imprimir Reporte PDF</span>
          </button>
        )}
        {onSincronizar && (
          <button
            onClick={onSincronizar}
            className="p-2.5 bg-(--color-app-card) border border-zinc-700/40 rounded-xl text-(--color-app-text-muted) hover:text-(--color-app-text) transition-colors cursor-pointer"
            title="Sincronizar tabla"
          >
            <RefreshCw className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
