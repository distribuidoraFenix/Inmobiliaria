import { Bed } from "lucide-react";
import { type Propiedad } from "../data/propiedadesData";
import { Link } from "react-router-dom";

interface PropertyCardProps {
  propiedad: Propiedad;
}

export default function PropertyCard({ propiedad }: PropertyCardProps) {
  const getBadgeStyles = (modalidad: Propiedad["modalidad"]) => {
    switch (modalidad) {
      case "Venta":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "Alquiler":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Anticrético":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Preventa":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-zinc-700 text-zinc-300";
    }
  };

  // OBTENER LA PRIMERA IMAGEN COMO PORTADA
  // Usamos un fallback por si el arreglo viene vacío accidentalmente
  const imagenPortada =
    propiedad.imagenes && propiedad.imagenes.length > 0
      ? propiedad.imagenes[0]
      : "/propiedades/default.jpg";

  return (
    <article className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:border-zinc-700 transition-all duration-300 flex flex-col w-72 shrink-0 mx-auto">
      {/* FOTOGRAFÍA */}
      <figure className="relative w-full aspect-video overflow-hidden bg-zinc-950">
        <img
          src={imagenPortada}
          alt={`Fotografía de propiedad en ${propiedad.zona}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out scale-110 group-hover:scale-100"
        />
      </figure>

      {/* INFORMACIÓN */}
      <div className="p-4 flex flex-col grow">
        {/* Modalidad, Tipo y Zona */}
        <div className="flex flex-col gap-1.5 mb-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getBadgeStyles(propiedad.modalidad)}`}
            >
              {propiedad.modalidad}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {propiedad.tipo}
            </span>
          </div>
          <span className="text-[11px] font-medium text-zinc-400 tracking-wide uppercase truncate mt-0.5">
            {propiedad.zona}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-sm font-bold text-zinc-100 mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
          {propiedad.titulo}
        </h3>

        {/* Dormitorios */}
        <div className="flex items-center gap-2 text-zinc-300 text-xs mb-4">
          <Bed className="w-3.5 h-3.5 text-zinc-500" aria-hidden="true" />
          <span className="font-semibold text-zinc-100">
            {propiedad.dormitorios}
          </span>
          <span className="text-zinc-400">
            {propiedad.dormitorios === 1 ? "dormitorio" : "dormitorios"}
          </span>
        </div>

        {/* CONTENEDOR INFERIOR: Precio, Agente y Botón */}
        <div className="mt-auto pt-3 border-t border-zinc-800/60 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            {/* Bloque Precio */}
            <div className="flex flex-col">
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">
                Precio
              </span>
              <span className="text-base font-black text-emerald-400 whitespace-nowrap">
                {propiedad.precio}
              </span>
            </div>

            {/* Bloque Agente Comercial */}
            <div className="flex flex-col items-center max-w-24">
              <img
                src={propiedad.agente.avatar}
                alt={`Agente ${propiedad.agente.nombre}`}
                className="size-8 rounded-full object-cover border border-zinc-700 shadow-sm"
              />
              <span
                className="text-[10px] text-zinc-400 font-medium mt-1 truncate w-full text-center"
                title={propiedad.agente.nombre}
              >
                {propiedad.agente.nombre}
              </span>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <Link
            to={`/propiedad/${propiedad.id}`}
            className="w-full cursor-pointer bg-zinc-800 hover:bg-blue-600 text-white text-xs font-bold py-2 rounded-xl transition-all duration-200 active:scale-95 hover:shadow-lg hover:shadow-blue-600/10 text-center block"
          >
            Ver propiedad
          </Link>
        </div>
      </div>
    </article>
  );
}
