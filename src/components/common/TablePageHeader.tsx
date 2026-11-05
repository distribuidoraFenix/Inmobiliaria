import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TablePageHeaderProps {
  titulo: string;
  subtitulo: string;
  iconoPrincipal: LucideIcon;
  linkRegreso?: string;
  textoLinkRegreso?: string;
}

export function TablePageHeader({
  titulo,
  subtitulo,
  iconoPrincipal: Icono,
  linkRegreso = "/",
  textoLinkRegreso = "Volver al Catálogo",
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
    </div>
  );
}
