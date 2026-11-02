import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Loader2 } from "lucide-react";
import {
  DASHBOARD_CARDS_CONFIG,
  type DashboardCardConfig,
} from "../../data/dashboardCards";

export function ListCardInfo() {
  const navigate = useNavigate();
  const [conteos, setConteos] = useState<Record<string, number>>({});
  const [loadingCounters, setLoadingCounters] = useState<boolean>(true);

  useEffect(() => {
    async function obtenerConteosDinamicos() {
      try {
        setLoadingCounters(true);
        const resultadosTemp: Record<string, number> = {};

        // Recorremos las tarjetas configuradas que requieran consulta a BD
        for (const card of DASHBOARD_CARDS_CONFIG) {
          if (card.tablaContador) {
            // Usamos { count: 'exact', head: true } para optimizar y traer solo el número de filas
            const { count, error } = await supabase
              .from(card.tablaContador)
              .select("*", { count: "exact", head: true });

            if (!error && count !== null) {
              resultadosTemp[card.id] = count;
            } else {
              // Si la tabla (como sucursales) aún no existe o da error, manejamos un 0 elegante
              resultadosTemp[card.id] = 0;
            }
          }
        }

        setConteos(resultadosTemp);
      } catch (err) {
        console.error("Error al obtener contadores del dashboard:", err);
      } finally {
        setLoadingCounters(false);
      }
    }

    obtenerConteosDinamicos();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {DASHBOARD_CARDS_CONFIG.map((card: DashboardCardConfig) => {
        const IconComponent = card.icono;
        const tieneContador = card.tablaContador !== undefined;
        const valorContador = conteos[card.id];

        return (
          <div
            key={card.id}
            onClick={() => navigate(card.rutaRedireccion)}
            className="group bg-(--color-app-card) border border-zinc-700/40 p-5 rounded-2xl shadow-lg space-y-3 cursor-pointer transition-all duration-200 hover:border-(--color-primary)/50 hover:shadow-xl hover:-translate-y-0.5"
          >
            {/* Cabecera de la tarjeta: Título secundario + Icono */}
            <div className="flex items-center justify-between text-(--color-app-text-muted)">
              <span className="text-xs font-bold uppercase tracking-wider">
                {card.subtitulo}
              </span>
              <span className="p-2 rounded-xl bg-zinc-800/40 group-hover:bg-zinc-800/80 transition-colors">
                <IconComponent className={`size-5 ${card.colorIcono}`} />
              </span>
            </div>

            {/* Contenido principal: Título y Número dinámico (si aplica) */}
            <div className="flex items-baseline justify-between">
              <p className="text-lg font-bold text-(--color-app-text)">
                {card.titulo}
              </p>

              {/* Si la tarjeta requiere traer info de base de datos, mostramos el número */}
              {tieneContador && (
                <div className="text-xl font-extrabold text-(--color-app-text)">
                  {loadingCounters ? (
                    <Loader2 className="size-4 animate-spin text-(--color-app-text-muted)" />
                  ) : (
                    <span>{valorContador ?? 0}</span>
                  )}
                </div>
              )}
            </div>

            {/* Descripción corta */}
            <p className="text-[11px] text-(--color-app-text-muted) leading-relaxed">
              {card.descripcion}
            </p>
          </div>
        );
      })}
    </div>
  );
}
