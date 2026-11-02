import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import {
  Building,
  FileSpreadsheet,
  FileText,
  Eye,
  Loader2,
} from "lucide-react";

interface AgenteConsignacion {
  id: string;
  nombres: string;
  apellido: string;
  avatar: string;
  totalConsignadas: number;
}

export function RankingConsignaciones() {
  const navigate = useNavigate();
  const [agentesConsignados, setAgentesConsignados] = useState<
    AgenteConsignacion[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function calcularRankingConsignaciones() {
      try {
        setLoading(true);

        // 1. Obtenemos perfiles incluyendo el campo avatar_url
        const { data: perfiles, error: errorPerfiles } = await supabase
          .from("perfiles")
          .select("id, nombres, apellido_paterno, avatar_url");

        if (errorPerfiles) throw errorPerfiles;

        // 2. Obtenemos las propiedades para contar cuántas tiene cada agente asignado (agente_id)
        const { data: propiedades, error: errorPropiedades } = await supabase
          .from("propiedades")
          .select("id, agente_id");

        if (errorPropiedades) throw errorPropiedades;

        // 3. Cruzamos los datos y sumamos las propiedades por agente
        const conteoMap: Record<string, number> = {};
        propiedades?.forEach((prop) => {
          if (prop.agente_id) {
            conteoMap[prop.agente_id] = (conteoMap[prop.agente_id] || 0) + 1;
          }
        });

        // 4. Mapeamos y armamos la lista priorizando avatar_url de Supabase Storage
        const resultado: AgenteConsignacion[] = (perfiles || []).map(
          (perfil) => {
            const avatarFinal =
              perfil.avatar_url && perfil.avatar_url.trim() !== ""
                ? perfil.avatar_url
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${perfil.nombres || "Agente"}`;

            return {
              id: perfil.id,
              nombres: perfil.nombres || "Sin nombre",
              apellido: perfil.apellido_paterno || "",
              avatar: avatarFinal,
              totalConsignadas: conteoMap[perfil.id] || 0,
            };
          },
        );

        // 5. Ordenamos de mayor a menor y limitamos al Top 5
        resultado.sort((a, b) => b.totalConsignadas - a.totalConsignadas);
        setAgentesConsignados(resultado.slice(0, 5));
      } catch (err) {
        console.error("Error al calcular ranking de consignaciones:", err);
      } finally {
        setLoading(false);
      }
    }

    calcularRankingConsignaciones();
  }, []);

  const handleExportPDF = () => {
    alert("Exportando reporte general de consignaciones a PDF...");
  };

  const handleExportExcel = () => {
    alert("Exportando reporte general de consignaciones a Excel...");
  };

  const handleVerDetallesGenerales = () => {
    navigate("/lista-agentes");
  };

  // Función para ver el detalle de propiedades de un agente específico
  const handleVerDetalleAgente = (agenteId: string, nombreAgente: string) => {
    alert(
      `Viendo propiedades consignadas del agente: ${nombreAgente} (ID: ${agenteId})`,
    );
    // Más adelante aquí puedes navegar, por ejemplo:
    // navigate(`/agente/${agenteId}/propiedades`);
  };

  if (loading) {
    return (
      <div className="bg-(--color-app-card) border border-zinc-700/40 p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-75">
        <div className="flex items-center gap-2 text-(--color-app-text-muted) text-xs font-semibold">
          <Loader2 className="size-5 animate-spin text-(--color-primary)" />
          <span>Cargando ranking de consignaciones...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-(--color-app-card) border border-zinc-700/40 p-6 rounded-2xl shadow-xl space-y-5 transition-colors duration-300 flex flex-col justify-between">
      <div>
        {/* Cabecera del widget */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-sky-500/10 text-sky-400 p-1.5 rounded-lg border border-sky-500/20">
                <Building className="size-5" />
              </span>
              <h2 className="text-lg font-black tracking-tight text-(--color-app-text) uppercase">
                Top 5 - Captación de Inmuebles
              </h2>
            </div>
            <p className="text-xs text-(--color-app-text-muted)">
              Agentes con mayor volumen de propiedades consignadas en cartera.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-(--color-app-text-muted) bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-zinc-700/30 self-start sm:self-auto">
            <span>En Cartera</span>
          </div>
        </div>

        {/* Botones de Exportación general y Ver detalles generales */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-zinc-700/30 mt-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 bg-zinc-800/40 hover:bg-zinc-800 text-(--color-app-text) px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700/40 transition-colors cursor-pointer"
              title="Exportar reporte general a PDF"
            >
              <FileText className="size-3.5 text-rose-400" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 bg-zinc-800/40 hover:bg-zinc-800 text-(--color-app-text) px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700/40 transition-colors cursor-pointer"
              title="Exportar reporte general a Excel"
            >
              <FileSpreadsheet className="size-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>
          </div>

          <button
            onClick={handleVerDetallesGenerales}
            className="flex items-center gap-1.5 bg-(--color-primary)/10 hover:bg-(--color-primary)/20 text-(--color-primary) px-3.5 py-1.5 rounded-xl text-xs font-bold border border-(--color-primary)/20 transition-colors cursor-pointer"
          >
            <Eye className="size-3.5" />
            <span>Ver detalles generales</span>
          </button>
        </div>

        {/* Tabla Adaptativa */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-700/40 text-[11px] font-bold uppercase tracking-wider text-(--color-app-text-muted)">
                <th className="py-3 px-3 w-14">#</th>
                <th className="py-3 px-3">Agente</th>
                <th className="py-3 px-3 text-center">Consignadas</th>
                <th className="py-3 px-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-700/30 text-xs font-medium">
              {agentesConsignados.map((agente, index) => {
                const puesto = index + 1;

                let badgePuestoColor =
                  "bg-zinc-800/60 text-zinc-400 border-zinc-700/40";
                if (puesto === 1)
                  badgePuestoColor =
                    "bg-amber-500/10 text-amber-400 border-amber-500/30 font-bold";
                if (puesto === 2)
                  badgePuestoColor =
                    "bg-slate-300/10 text-slate-300 border-slate-300/30 font-bold";
                if (puesto === 3)
                  badgePuestoColor =
                    "bg-amber-700/10 text-amber-600 border-amber-700/30 font-bold";

                const nombreCompleto = `${agente.nombres} ${agente.apellido}`;

                return (
                  <tr
                    key={agente.id}
                    className="hover:bg-zinc-800/20 transition-colors group"
                  >
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center justify-center size-6 rounded-lg border text-[11px] ${badgePuestoColor}`}
                      >
                        {puesto === 1
                          ? "🥇"
                          : puesto === 2
                            ? "🥈"
                            : puesto === 3
                              ? "🥉"
                              : `#${puesto}`}
                      </span>
                    </td>

                    {/* Columna Agente */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={agente.avatar}
                          alt={nombreCompleto}
                          className="size-8 rounded-full object-cover border border-zinc-700/50 shadow-sm shrink-0 bg-zinc-800"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="hidden md:block">
                          <p className="font-bold text-(--color-app-text) group-hover:text-(--color-primary) transition-colors">
                            {nombreCompleto}
                          </p>
                          <p className="text-[10px] text-(--color-app-text-muted)">
                            Agente Captador
                          </p>
                        </div>
                        <span className="md:hidden font-bold text-(--color-app-text)">
                          {agente.nombres} {agente.apellido.charAt(0)}.
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-block px-3 py-1 rounded-lg bg-sky-500/10 text-sky-400 font-extrabold border border-sky-500/20 text-xs">
                        {agente.totalConsignadas}
                      </span>
                    </td>

                    {/* Botón de ojo por cada agente para ver sus propiedades específicas */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() =>
                          handleVerDetalleAgente(agente.id, nombreCompleto)
                        }
                        className="inline-flex items-center justify-center size-8 rounded-xl bg-zinc-800/40 hover:bg-(--color-primary)/20 text-(--color-app-text-muted) hover:text-(--color-primary) border border-zinc-700/40 hover:border-(--color-primary)/30 transition-colors cursor-pointer"
                        title={`Ver propiedades consignadas de ${nombreCompleto}`}
                      >
                        <Eye className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
