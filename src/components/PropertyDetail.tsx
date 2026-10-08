import { useParams, Link } from "react-router-dom";
import { propiedadesIniciales } from "../data/propiedadesData";
import {
  Bed,
  Bath,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Info,
  HelpCircle,
} from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();

  // Buscar la propiedad por ID
  const propiedad = propiedadesIniciales.find((p) => p.id === id);

  if (!propiedad) {
    return (
      <div className="text-center py-20 bg-zinc-950 text-white">
        <h2 className="text-2xl font-bold text-rose-500">
          Propiedad no encontrada
        </h2>
        <Link
          to="/"
          className="text-blue-400 hover:underline mt-4 inline-flex items-center gap-2"
        >
          <ArrowLeft className="size-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const { detalles } = propiedad;

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 text-white bg-zinc-950">
      {/* Botón de retorno */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white mb-6 group transition-colors"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Volver a la lista de propiedades
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-8 shadow-xl">
        {/* COLUMNA IZQUIERDA: Imagen y Encabezado principal */}
        <section className="flex flex-col gap-4">
          <figure className="w-full aspect-video md:aspect-square rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
            <img
              src={
                propiedad.imagenes && propiedad.imagenes.length > 0
                  ? propiedad.imagenes[0]
                  : "/propiedades/default.jpg"
              }
              alt={propiedad.titulo}
              className="w-full h-full object-cover"
            />
          </figure>

          <div>
            <div className="flex gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/20">
                {propiedad.modalidad}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                {propiedad.tipo}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-100">
              {propiedad.titulo}
            </h1>
            <p className="text-zinc-400 text-sm mt-1 uppercase font-semibold">
              Zona: {propiedad.zona}
            </p>
            <p className="text-2xl font-black text-emerald-400 mt-3">
              {propiedad.precio}
            </p>
          </div>
        </section>

        {/* COLUMNA DERECHA: Ficha técnica detallada (Semántica) */}
        <section className="flex flex-col gap-6 justify-between">
          <div className="space-y-5">
            <h2 className="text-lg font-bold border-b border-zinc-800 pb-2 text-blue-400 flex items-center gap-2">
              <Info className="size-5" /> Ficha Técnica del Inmueble
            </h2>

            {/* Distribución Básica */}
            <ul className="grid grid-cols-2 gap-3 text-sm bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
              <li className="flex items-center gap-2">
                <Bed className="size-4 text-zinc-500" />
                <span>{propiedad.dormitorios} Dormitorios</span>
              </li>
              <li className="flex items-center gap-2">
                <Bath className="size-4 text-zinc-500" />
                <span>
                  {detalles.banos} {detalles.banos === 1 ? "Baño" : "Baños"}
                </span>
              </li>
              <li className="col-span-2 text-xs flex items-center gap-2 mt-1 border-t border-zinc-900 pt-2 text-zinc-400">
                <HelpCircle className="size-3.5 text-amber-500 shrink-0" />
                <span>
                  Tipo de baño:{" "}
                  <strong>
                    {detalles.banoCompartido
                      ? "Compartido con otro depto."
                      : "Privado / Independiente"}
                  </strong>
                </span>
              </li>
            </ul>

            {/* Características Físicas y Servicios */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Servicios y Áreas
              </h3>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  {detalles.garage ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <XCircle className="size-4 text-zinc-600" />
                  )}
                  <span
                    className={
                      detalles.garage
                        ? "text-zinc-200"
                        : "text-zinc-500 line-through"
                    }
                  >
                    Garaje / Parqueo
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {detalles.mascotas ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <XCircle className="size-4 text-zinc-600" />
                  )}
                  <span
                    className={
                      detalles.mascotas
                        ? "text-zinc-200"
                        : "text-zinc-500 line-through"
                    }
                  >
                    Permite Mascotas
                  </span>
                </li>
                <li className="col-span-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/30 text-xs text-zinc-300">
                  <span className="font-bold block mb-1 text-zinc-400">
                    Servicios independientes:
                  </span>
                  Luz:{" "}
                  {detalles.serviciosIndependientes.luz
                    ? "✅ Sí"
                    : "❌ Compartido"}{" "}
                  | Agua:{" "}
                  {detalles.serviciosIndependientes.agua
                    ? "✅ Sí"
                    : "❌ Compartido"}{" "}
                  | Gas:{" "}
                  {detalles.serviciosIndependientes.gasDomiciliario
                    ? "✅ Instalado"
                    : "❌ No tiene"}
                </li>
              </ul>
            </div>

            {/* Dependencias y Ubicación Estructural */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Dependencias Internas
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(detalles.dependencias).map(
                  ([key, value]) =>
                    value && (
                      <span
                        key={key}
                        className="text-xs px-2.5 py-1 bg-zinc-800 rounded-md border border-zinc-700/50 text-zinc-300 capitalize"
                      >
                        {key}
                      </span>
                    ),
                )}
                <span className="text-xs px-2.5 py-1 bg-zinc-800 rounded-md border border-zinc-700/50 text-zinc-300">
                  Ubicación:{" "}
                  {typeof detalles.piso === "number"
                    ? `Piso ${detalles.piso}`
                    : detalles.piso}
                </span>
              </div>
            </div>

            {/* Condiciones Financieras (Alquiler / Mantenimiento) */}
            {(detalles.garantia || detalles.mantenimiento) && (
              <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-1 text-xs">
                {detalles.garantia && (
                  <p className="text-zinc-300">
                    🔒 <strong>Garantía:</strong> {detalles.garantia}
                  </p>
                )}
                {detalles.mantenimiento && (
                  <p className="text-zinc-300">
                    🧹 <strong>Expensas / Mantenimiento:</strong>{" "}
                    {detalles.mantenimiento}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Información del Agente Asignado */}
          <div className="mt-4 p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={propiedad.agente.avatar}
                alt={propiedad.agente.nombre}
                className="size-10 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">
                  Asesor Inmobiliario
                </p>
                <p className="text-sm font-bold text-zinc-200">
                  {propiedad.agente.nombre}
                </p>
              </div>
            </div>
            <button className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
              Contactar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
