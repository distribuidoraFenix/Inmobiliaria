// src/components/Propiedades.tsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import PropertyCard from "./PropertyCard";
import { Loader2 } from "lucide-react";

export function Propiedades() {
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function obtenerPropiedades() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("propiedades")
          .select(
            `
            id,
            titulo,
            modalidad,
            precio,
            moneda,
            zona,
            superficie_total,
            imagenes,
            tipos_propiedad ( nombre ),
            agente:perfiles ( nombres, apellido_paterno )
          `,
          )
          .eq("estado", "Disponible");

        if (error) throw error;

        const propiedadesAdaptadas = data.map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          modalidad: p.modalidad,
          tipo: p.tipos_propiedad?.nombre || "Inmueble",
          zona: p.zona,
          dormitorios: Math.round(p.superficie_total),
          precio: `${p.moneda === "USD" ? "$us" : "Bs"} ${Number(p.precio).toLocaleString("es-BO")}`,
          imagenes: p.imagenes || [],
          agente: {
            nombre: `${p.agente?.nombres} ${p.agente?.apellido_paterno || ""}`,
            avatar: `https://dicebear.com{p.agente?.nombres || "A"}`,
            telefono: "59100000000",
          },
        }));

        setPropiedades(propiedadesAdaptadas);
      } catch (err) {
        console.error("Error al cargar el catálogo:", err);
      } finally {
        setLoading(false);
      }
    }

    obtenerPropiedades();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-(--color-app-text-muted) text-xs font-semibold gap-2">
        <Loader2 className="size-4 animate-spin text-(--color-primary)" />
        <span>Cargando propiedades...</span>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-(--color-app-text) sm:text-3xl">
          Propiedades Destacadas
        </h2>
        <p className="text-sm text-(--color-app-text-muted) mt-1">
          Encuentra tu próximo espacio ideal en las mejores zonas de Bolivia de
          forma real.
        </p>
      </header>

      {propiedades.length === 0 ? (
        <div className="text-center py-12 text-(--color-app-text-muted) text-xs font-medium">
          No hay propiedades disponibles en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {propiedades.map((p) => (
            <PropertyCard key={p.id} propiedad={p} />
          ))}
        </div>
      )}
    </main>
  );
}
