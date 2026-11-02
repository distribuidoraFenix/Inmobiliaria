import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  Filter,
  Calendar,
  MapPin,
  Building2,
  Users,
  FileSpreadsheet,
  FileText,
  Eye,
} from "lucide-react";

// Datos de ejemplo simulados para los 5 meses centrados en el actual
const DATOS_GRAFICO_EJEMPLO = [
  { mes: "Julio", consignadas: 14, vendidas: 8, sinVender: 6 },
  { mes: "Agosto", consignadas: 18, vendidas: 11, sinVender: 7 },
  { mes: "Septiembre (Actual)", consignadas: 25, vendidas: 15, sinVender: 10 },
  { mes: "Octubre", consignadas: 20, vendidas: 12, sinVender: 8 },
  { mes: "Noviembre", consignadas: 22, vendidas: 14, sinVender: 8 },
];

export function GraficoProduccion() {
  // Estados visuales para los filtros
  const [periodo, setPeriodo] = useState("mensual");
  const [gestion, setGestion] = useState("2026");
  const [departamento, setDepartamento] = useState("todos");
  const [sucursal, setSucursal] = useState("todas");
  const [agente, setAgente] = useState("todos");

  // Funciones simuladas para botones
  const handleExportPDF = () =>
    alert("Exportando gráfico de producción a PDF...");
  const handleExportExcel = () =>
    alert("Exportando datos del gráfico a Excel...");
  const handleVerDetalles = () =>
    alert("Abriendo vista detallada de producción...");

  return (
    <div className="bg-(--color-app-card) border border-zinc-700/40 p-6 rounded-2xl shadow-xl space-y-6 transition-colors duration-300">
      {/* Cabecera del widget */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/10 text-purple-400 p-1.5 rounded-lg border border-purple-500/20">
              <BarChart3 className="size-5" />
            </span>
            <h2 className="text-lg font-black tracking-tight text-(--color-app-text) uppercase">
              Flujo de Producción Inmobiliaria
            </h2>
          </div>
          <p className="text-xs text-(--color-app-text-muted)">
            Comparativa trimestral (2 meses previos, mes actual y 2 meses
            proyectados/posteriores).
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-(--color-app-text-muted) bg-zinc-800/40 px-3 py-1.5 rounded-xl border border-zinc-700/30 self-start sm:self-auto">
          <span>Dinámico</span>
        </div>
      </div>

      {/* Barra de Filtros Visuales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-zinc-700/30">
        {/* Periodo */}
        <div className="flex items-center gap-1.5 bg-zinc-800/30 border border-zinc-700/40 px-2.5 py-2 rounded-xl">
          <Filter className="size-3.5 text-(--color-app-text-muted) shrink-0" />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-(--color-app-text) focus:outline-none cursor-pointer w-full"
          >
            <option value="mensual" className="bg-zinc-900 text-white">
              Mensual
            </option>
            <option value="trimestral" className="bg-zinc-900 text-white">
              Trimestral
            </option>
          </select>
        </div>

        {/* Gestión */}
        <div className="flex items-center gap-1.5 bg-zinc-800/30 border border-zinc-700/40 px-2.5 py-2 rounded-xl">
          <Calendar className="size-3.5 text-(--color-app-text-muted) shrink-0" />
          <select
            value={gestion}
            onChange={(e) => setGestion(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-(--color-app-text) focus:outline-none cursor-pointer w-full"
          >
            <option value="2026" className="bg-zinc-900 text-white">
              2026
            </option>
            <option value="2025" className="bg-zinc-900 text-white">
              2025
            </option>
          </select>
        </div>

        {/* Departamento */}
        <div className="flex items-center gap-1.5 bg-zinc-800/30 border border-zinc-700/40 px-2.5 py-2 rounded-xl">
          <MapPin className="size-3.5 text-(--color-app-text-muted) shrink-0" />
          <select
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-(--color-app-text) focus:outline-none cursor-pointer w-full"
          >
            <option value="todos" className="bg-zinc-900 text-white">
              Dpto: Todos
            </option>
            <option value="la-paz" className="bg-zinc-900 text-white">
              La Paz
            </option>
            <option value="santa-cruz" className="bg-zinc-900 text-white">
              Santa Cruz
            </option>
            <option value="cochabamba" className="bg-zinc-900 text-white">
              Cochabamba
            </option>
          </select>
        </div>

        {/* Sucursal */}
        <div className="flex items-center gap-1.5 bg-zinc-800/30 border border-zinc-700/40 px-2.5 py-2 rounded-xl">
          <Building2 className="size-3.5 text-(--color-app-text-muted) shrink-0" />
          <select
            value={sucursal}
            onChange={(e) => setSucursal(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-(--color-app-text) focus:outline-none cursor-pointer w-full"
          >
            <option value="todas" className="bg-zinc-900 text-white">
              Sucursal: Todas
            </option>
            <option value="central" className="bg-zinc-900 text-white">
              Oficina Central
            </option>
            <option value="el-alto" className="bg-zinc-900 text-white">
              El Alto
            </option>
          </select>
        </div>

        {/* Agente */}
        <div className="flex items-center gap-1.5 bg-zinc-800/30 border border-zinc-700/40 px-2.5 py-2 rounded-xl col-span-2 sm:col-span-1">
          <Users className="size-3.5 text-(--color-app-text-muted) shrink-0" />
          <select
            value={agente}
            onChange={(e) => setAgente(e.target.value)}
            className="bg-transparent text-[11px] font-bold text-(--color-app-text) focus:outline-none cursor-pointer w-full"
          >
            <option value="todos" className="bg-zinc-900 text-white">
              Agente: Todos
            </option>
            <option value="carlos" className="bg-zinc-900 text-white">
              Carlos Mendoza
            </option>
            <option value="ana" className="bg-zinc-900 text-white">
              Ana María Rojas
            </option>
          </select>
        </div>
      </div>

      {/* Botones de Exportación y Ver Detalles */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 bg-zinc-800/40 hover:bg-zinc-800 text-(--color-app-text) px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700/40 transition-colors cursor-pointer"
            title="Exportar gráfico a PDF"
          >
            <FileText className="size-3.5 text-rose-400" />
            <span>PDF</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 bg-zinc-800/40 hover:bg-zinc-800 text-(--color-app-text) px-3 py-1.5 rounded-xl text-xs font-bold border border-zinc-700/40 transition-colors cursor-pointer"
            title="Exportar datos a Excel"
          >
            <FileSpreadsheet className="size-3.5 text-emerald-400" />
            <span>Excel</span>
          </button>
        </div>

        <button
          onClick={handleVerDetalles}
          className="flex items-center gap-1.5 bg-(--color-primary)/10 hover:bg-(--color-primary)/20 text-(--color-primary) px-3.5 py-1.5 rounded-xl text-xs font-bold border border-(--color-primary)/20 transition-colors cursor-pointer"
        >
          <Eye className="size-3.5" />
          <span>Ver detalles</span>
        </button>
      </div>

      {/* Contenedor del Gráfico de Recharts */}
      <div className="w-full h-80 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={DATOS_GRAFICO_EJEMPLO}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#3f3f46"
              opacity={0.4}
            />
            <XAxis
              dataKey="mes"
              stroke="#a1a1aa"
              fontSize={11}
              tickLine={false}
            />
            <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#3f3f46",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

            {/* Barra Azul: Consignadas */}
            <Bar
              dataKey="consignadas"
              name="Consignadas"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />

            {/* Barra Verde: Vendidas */}
            <Bar
              dataKey="vendidas"
              name="Vendidas / Alquiladas"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
            />

            {/* Barra Roja: Sin Vender (En cartera) */}
            <Bar
              dataKey="sinVender"
              name="Sin Vender (Stock)"
              fill="#f43f5e"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
