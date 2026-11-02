import { useEffect, useState } from "react";
import {
  Trophy,
  Award,
  Calendar,
  Filter,
  FileSpreadsheet,
  FileText,
  Eye,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface AgenteRendimientoReal {
  id: string;
  nombres: string;
  apellido: string;
  cargo: string;
  avatar: string;
  propiedadesMovidas: number;
  ingresoAgente: number;
  ingresoInmobiliaria: number;
}

export function RankingAgentes() {
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState("mes-actual");
  const [gestionSeleccionada, setGestionSeleccionada] = useState("2026");
  const [agentesRanking, setAgentesRanking] = useState<AgenteRendimientoReal[]>(
    [],
  );
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function cargarAgentesReales() {
      try {
        setLoading(true);

        // 1. Consultamos perfiles y traemos el nombre del cargo desde la tabla relacionada 'cargos'
        const { data: perfiles, error } = await supabase.from("perfiles")
          .select(`
            id,
            nombres,
            apellido_paterno,
            avatar_url,
            cargos ( nombre_cargo )
          `);

        if (error) throw error;

        // 2. Mapeamos los perfiles reales de la base de datos
        const resultado: AgenteRendimientoReal[] = (perfiles || []).map(
          (perfil: any, index) => {
            // Si el agente tiene avatar en Supabase Storage lo usamos, sino DiceBear de respaldo
            const avatarFinal =
              perfil.avatar_url && perfil.avatar_url.trim() !== ""
                ? perfil.avatar_url
                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${perfil.nombres || "Agente"}`;

            // Extraemos el nombre del cargo desde la relación con la tabla 'cargos'
            // (perfil.cargos es un objeto o null según devuelva Supabase)
            const cargoTexto = perfil.cargos?.nombre || "Agente Inmobiliario";

            // Métricas simuladas para el ejemplo visual
            const ventasSimuladas = (index + 1) * 3;
            const comisionAgente = ventasSimuladas * 700;
            const comisionInmo = ventasSimuladas * 2100;

            return {
              id: perfil.id,
              nombres: perfil.nombres || "Sin nombre",
              apellido: perfil.apellido_paterno || "",
              cargo: cargoTexto, // <--- Aquí ya toma el cargo real de tu base de datos
              avatar: avatarFinal,
              propiedadesMovidas: ventasSimuladas,
              ingresoAgente: comisionAgente,
              ingresoInmobiliaria: comisionInmo,
            };
          },
        );

        // Ordenamos de mayor a menor por cierres y tomamos el Top 5
        resultado.sort((a, b) => b.propiedadesMovidas - a.propiedadesMovidas);
        setAgentesRanking(resultado.slice(0, 5));
      } catch (err) {
        console.error("Error al cargar agentes reales para el ranking:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarAgentesReales();
  }, []);

  const handleExportPDF = () => {
    alert("Exportando reporte general de rendimiento a PDF...");
  };

  const handleExportExcel = () => {
    alert("Exportando reporte general de rendimiento a Excel...");
  };

  const handleVerDetallesGenerales = () => {
    alert("Navegando a la lista completa de agentes...");
  };

  const handleVerDetalleAgente = (agenteId: string, nombreAgente: string) => {
    alert(
      `Viendo cierres y comisiones del agente: ${nombreAgente} (ID: ${agenteId})`,
    );
  };

  if (loading) {
    return (
      <div className="bg-(--color-app-card) border border-zinc-700/40 p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-75">
        <div className="flex items-center gap-2 text-(--color-app-text-muted) text-xs font-semibold">
          <Loader2 className="size-5 animate-spin text-(--color-primary)" />
          <span>Cargando agentes registrados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-(--color-app-card) border border-zinc-700/40 p-6 rounded-2xl shadow-xl space-y-5 transition-colors duration-300">
      {/* Cabecera del widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/10 text-amber-400 p-1.5 rounded-lg border border-amber-500/20">
              <Trophy className="size-5" />
            </span>
            <h2 className="text-lg font-black tracking-tight text-(--color-app-text) uppercase">
              Top 5 - Rendimiento de Agentes
            </h2>
          </div>
          <p className="text-xs text-(--color-app-text-muted)">
            Agentes con mayor volumen de cierres (Ventas, Alquileres y
            Anticréticos).
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-(--color-app-text-muted) bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-zinc-700/30 self-start sm:self-auto">
          <Award className="size-4 text-amber-400" />
          <span>Activo</span>
        </div>
      </div>

      {/* Selectores Visuales (Periodo y Gestión) */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-zinc-700/30">
        <div className="flex items-center gap-2 bg-zinc-800/30 border border-zinc-700/40 px-3 py-2 rounded-xl">
          <Filter className="size-3.5 text-(--color-app-text-muted)" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-(--color-app-text-muted)">
            Periodo:
          </span>
          <select
            value={periodoSeleccionado}
            onChange={(e) => setPeriodoSeleccionado(e.target.value)}
            className="bg-transparent text-xs font-bold text-(--color-app-text) focus:outline-none cursor-pointer"
          >
            <option value="mes-actual" className="bg-zinc-900 text-white">
              Mes Actual
            </option>
            <option value="trimestre" className="bg-zinc-900 text-white">
              Último Trimestre
            </option>
            <option value="semestre" className="bg-zinc-900 text-white">
              Primer Semestre
            </option>
            <option value="anual" className="bg-zinc-900 text-white">
              Anual Completo
            </option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-zinc-800/30 border border-zinc-700/40 px-3 py-2 rounded-xl">
          <Calendar className="size-3.5 text-(--color-app-text-muted)" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-(--color-app-text-muted)">
            Gestión:
          </span>
          <select
            value={gestionSeleccionada}
            onChange={(e) => setGestionSeleccionada(e.target.value)}
            className="bg-transparent text-xs font-bold text-(--color-app-text) focus:outline-none cursor-pointer"
          >
            <option value="2026" className="bg-zinc-900 text-white">
              2026
            </option>
            <option value="2025" className="bg-zinc-900 text-white">
              2025
            </option>
            <option value="2024" className="bg-zinc-900 text-white">
              2024
            </option>
          </select>
        </div>
      </div>

      {/* Botones de Exportación general y Ver detalles generales */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
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
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-700/40 text-[11px] font-bold uppercase tracking-wider text-(--color-app-text-muted)">
              <th className="py-3 px-3 w-14">#</th>
              <th className="py-3 px-3">Agente</th>
              <th className="py-3 px-3 text-center">Cierres</th>
              <th className="py-3 px-3 text-right">Comisión</th>
              <th className="py-3 px-3 text-right">Inmobiliaria</th>
              <th className="py-3 px-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700/30 text-xs font-medium">
            {agentesRanking.map((agente, index) => {
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
                          {agente.cargo}
                        </p>
                      </div>
                      <span className="md:hidden font-bold text-(--color-app-text)">
                        {agente.nombres} {agente.apellido.charAt(0)}.
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20 text-[11px]">
                      {agente.propiedadesMovidas}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-semibold text-(--color-app-text)">
                    ${agente.ingresoAgente.toLocaleString("es-BO")}
                  </td>

                  <td className="py-3.5 px-3 text-right font-extrabold text-emerald-400">
                    ${agente.ingresoInmobiliaria.toLocaleString("es-BO")}
                  </td>

                  {/* Botón de ojo por cada agente */}
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() =>
                        handleVerDetalleAgente(agente.id, nombreCompleto)
                      }
                      className="inline-flex items-center justify-center size-8 rounded-xl bg-zinc-800/40 hover:bg-(--color-primary)/20 text-(--color-app-text-muted) hover:text-(--color-primary) border border-zinc-700/40 hover:border-(--color-primary)/30 transition-colors cursor-pointer"
                      title={`Ver detalle de cierres de ${nombreCompleto}`}
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
  );
}
