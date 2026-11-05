import { useState, useEffect } from "react";
import {
  Building2,
  Eye,
  FileText,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Plus,
  Download,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { generarReportePdf } from "../../utils/pdfReportTemplate";
import { generarReporteExcel } from "../../utils/generarReporteExcel";
import { ModalDetalleSucursal } from "../sucursales/ModalDetalleSucursal";
import { ModalEditarSucursal } from "./ModalEditarSucursal";
import { AlertMessage } from "../message/AlertMessage";

interface Sucursal {
  id: number;
  nombre_sucursal: string;
  departamento: string;
  direccion: string;
  estado: string;
}

export default function SucursalesTable() {
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sucursalAEditar, setSucursalAEditar] = useState<Sucursal | null>(null);
  const [isModalEditarOpen, setIsModalEditarOpen] = useState(false);
  const [alertaConfig, setAlertaConfig] = useState({
    isOpen: false,
    type: "info" as "info" | "success_loader" | "error",
    title: "",
    message: "",
    onConfirm: undefined as (() => void) | undefined,
  });

  const [paginaActual, setPaginaActual] = useState<number>(1);
  const itemsPorPagina = 4;

  const cargarSucursales = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: sbError } = await supabase
        .from("sucursales")
        .select("*")
        .order("id", { ascending: true });

      if (sbError) throw sbError;
      setSucursales(data || []);
    } catch (err: any) {
      console.error("Error al cargar sucursales:", err);
      setError(err.message || "No se pudieron obtener las sucursales.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSucursales();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  // Filtrado de sucursales según el buscador
  const sucursalesFiltradas = sucursales.filter((sucursal) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    return (
      sucursal.nombre_sucursal.toLowerCase().includes(termino) ||
      sucursal.departamento.toLowerCase().includes(termino) ||
      sucursal.direccion.toLowerCase().includes(termino) ||
      sucursal.estado.toLowerCase().includes(termino)
    );
  });

  const totalPaginas =
    Math.ceil(sucursalesFiltradas.length / itemsPorPagina) || 1;
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const sucursalesPaginadas = sucursalesFiltradas.slice(
    indicePrimerItem,
    indiceUltimoItem,
  );
  // Función para manejar la exportación del PDF general de sucursales
  const handleGenerarPdfGeneral = async () => {
    const columnas = ["ID", "Sucursal", "Departamento", "Dirección", "Estado"];
    const filas = sucursalesFiltradas.map((s) => [
      s.id,
      s.nombre_sucursal,
      s.departamento,
      s.direccion,
      s.estado,
    ]);

    await generarReportePdf({
      tituloReporte: "REPORTE - LISTA GENERAL DE SUCURSALES",
      columnas,
      filas,
      nombreArchivo: "reporte-sucursales.pdf",
    });
  };
  // Función para manejar la exportación a Excel con los datos filtrados actuales
  const handleGenerarExcelGeneral = async () => {
    const columnas = ["ID", "Sucursal", "Departamento", "Dirección", "Estado"];
    const filas = sucursalesFiltradas.map((s) => [
      s.id,
      s.nombre_sucursal,
      s.departamento,
      s.direccion,
      s.estado,
    ]);

    await generarReporteExcel({
      tituloReporte: "REPORTE - LISTA GENERAL DE SUCURSALES",
      columnas,
      filas,
      nombreArchivo: "reporte-sucursales.xlsx",
    });
  };

  // --- FUNCIÓN PARA EL REPORTE DETALLADO (BOTÓN NARANJA) ---
  const handleGenerarReporteDetallado = async () => {
    try {
      const idsSucursales = sucursalesFiltradas.map((s) => s.id);

      if (idsSucursales.length === 0) {
        alert("No hay sucursales visibles para generar el reporte detallado.");
        return;
      }

      // 1. Consultamos sucursales, perfiles (agentes) y sus propiedades
      const { data: datosDetallados, error } = await supabase
        .from("sucursales")
        .select(
          `
          id,
          nombre_sucursal,
          departamento,
          direccion,
          estado,
          perfiles (
            id,
            nombres,
            apellido_paterno,
            fecha_ingreso,
            estado,
            propiedades (id)
          )
        `,
        )
        .in("id", idsSucursales);

      if (error) throw error;

      // 2. Construimos el arreglo de filas para jsPDF-autotable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filasPdf: any[][] = [];

      datosDetallados?.forEach((sucursal) => {
        // A. Fila de Encabezado / Subtítulo por Sucursal
        filasPdf.push([
          {
            content: `SUCURSAL: ${sucursal.nombre_sucursal} (${sucursal.departamento}) - Estado: ${sucursal.estado}`,
            colSpan: 6,
            styles: {
              fillColor: [41, 128, 185],
              textColor: [255, 255, 255],
              fontStyle: "bold",
            },
          },
        ]);

        // B. Cabecera de la sub-tabla de agentes
        filasPdf.push([
          "Nombre del Agente",
          "Antigüedad",
          "Prop. Consignadas",
          "Cierres",
          "Mov.",
          "Ganancias",
        ]);

        // C. Listado de Agentes de esta sucursal
        if (sucursal.perfiles && sucursal.perfiles.length > 0) {
          sucursal.perfiles.forEach((agente: any) => {
            // Cálculo simple de antigüedad en base a fecha_ingreso
            const anios = agente.fecha_ingreso
              ? Math.floor(
                  (new Date().getTime() -
                    new Date(agente.fecha_ingreso).getTime()) /
                    (1000 * 60 * 60 * 24 * 365),
                )
              : 0;
            const antiguedadTexto =
              anios > 0 ? `${anios} año(s)` : "Menos de 1 año";

            // Conteo de propiedades consignadas
            const totalPropiedades = agente.propiedades
              ? agente.propiedades.length
              : 0;

            filasPdf.push([
              `${agente.nombres} ${agente.apellido_paterno}`,
              antiguedadTexto,
              totalPropiedades,
              0, // Cierres (pendiente de integrar si hay tabla de ventas)
              0, // Movimientos
              "$ 0.00", // Ganancias
            ]);
          });
        } else {
          filasPdf.push([
            {
              content: "No hay agentes registrados en esta sucursal.",
              colSpan: 6,
              styles: { fontStyle: "italic", textColor: [100, 100, 100] },
            },
          ]);
        }

        // Fila en blanco de separación entre sucursales
        filasPdf.push([
          { content: "", colSpan: 6, styles: { fillColor: [255, 255, 255] } },
        ]);
      });

      // 3. Llamamos a nuestra utilidad de PDF general pasándole las filas jerárquicas
      await generarReportePdf({
        tituloReporte:
          "REPORTE - LISTA GENERAL DETALLADA POR SUCURSALES Y AGENTES",
        columnas: [
          "Información General / Agente",
          "Antigüedad",
          "Propiedades",
          "Cierres",
          "Mov.",
          "Ganancias",
        ],
        filas: filasPdf,
        nombreArchivo: "reporte-detallado-sucursales.pdf",
      });
    } catch (err) {
      console.error("Error al generar el reporte detallado:", err);
    }
  };
  // --- FUNCIÓN PARA EL REPORTE INDIVIDUAL DE SUCURSAL (BOTÓN DE FILA) ---
  const handleGenerarReporteIndividual = async (
    sucursalId: number,
    nombreSucursal: string,
  ) => {
    try {
      // 1. Consultamos en Supabase únicamente la sucursal seleccionada con sus agentes y propiedades
      const { data: datosSucursal, error } = await supabase
        .from("sucursales")
        .select(
          `
          id,
          nombre_sucursal,
          departamento,
          direccion,
          estado,
          perfiles (
            id,
            nombres,
            apellido_paterno,
            fecha_ingreso,
            estado,
            propiedades (id)
          )
        `,
        )
        .eq("id", sucursalId)
        .single();

      if (error) throw error;
      if (!datosSucursal) {
        alert("No se encontró información de la sucursal.");
        return;
      }

      // 2. Construimos el arreglo de filas para jsPDF-autotable
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filasPdf: any[][] = [];

      // A. Encabezado / Subtítulo de la sucursal
      filasPdf.push([
        {
          content: `SUCURSAL: ${datosSucursal.nombre_sucursal} (${datosSucursal.departamento}) - Estado: ${datosSucursal.estado}`,
          colSpan: 6,
          styles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
        },
      ]);

      // B. Cabecera de la sub-tabla de agentes
      filasPdf.push([
        "Nombre del Agente",
        "Antigüedad",
        "Prop. Consignadas",
        "Cierres",
        "Mov.",
        "Ganancias",
      ]);

      // C. Listado de Agentes de esta sucursal
      if (datosSucursal.perfiles && datosSucursal.perfiles.length > 0) {
        datosSucursal.perfiles.forEach((agente: any) => {
          const anios = agente.fecha_ingreso
            ? Math.floor(
                (new Date().getTime() -
                  new Date(agente.fecha_ingreso).getTime()) /
                  (1000 * 60 * 60 * 24 * 365),
              )
            : 0;
          const antiguedadTexto =
            anios > 0 ? `${anios} año(s)` : "Menos de 1 año";
          const totalPropiedades = agente.propiedades
            ? agente.propiedades.length
            : 0;

          filasPdf.push([
            `${agente.nombres} ${agente.apellido_paterno}`,
            antiguedadTexto,
            totalPropiedades,
            0,
            0,
            "$ 0.00",
          ]);
        });
      } else {
        filasPdf.push([
          {
            content: "No hay agentes registrados en esta sucursal.",
            colSpan: 6,
            styles: { fontStyle: "italic", textColor: [100, 100, 100] },
          },
        ]);
      }

      // 3. Llamamos a nuestra utilidad de PDF con el título dinámico solicitado
      await generarReportePdf({
        tituloReporte: `REPORTE - DETALLE DE SUCURSAL - ${nombreSucursal.toUpperCase()}`,
        columnas: [
          "Información General / Agente",
          "Antigüedad",
          "Propiedades",
          "Cierres",
          "Mov.",
          "Ganancias",
        ],
        filas: filasPdf,
        nombreArchivo: `reporte-sucursal-${sucursalId}.pdf`,
      });
    } catch (err) {
      console.error(
        "Error al generar el reporte individual de la sucursal:",
        err,
      );
    }
  };

  const handleIntentarEliminar = async (sucursal: Sucursal) => {
    // 1. Condición: Bloquear si es la sucursal principal (ID 1)
    if (sucursal.id === 1) {
      setAlertaConfig({
        isOpen: true,
        type: "error",
        title: "Acción Denegada",
        message:
          "No se puede dar de baja la sucursal principal (Illimani - Central).",
        onConfirm: undefined,
      });
      return;
    }

    try {
      // 2. Verificar cuántos agentes están asignados a esta sucursal
      const { data: agentes, error: errorAgentes } = await supabase
        .from("perfiles")
        .select("id")
        .eq("sucursal_id", sucursal.id);

      if (errorAgentes) throw errorAgentes;

      const totalAgentes = agentes?.length || 0;
      const mensajeAdvertencia =
        totalAgentes > 0
          ? `Esta sucursal tiene ${totalAgentes} agente(s) activo(s). Al darla de baja, serán reasignados automáticamente a la sucursal principal (ID 1) y el estado cambiará a BAJA.`
          : `¿Está seguro de dar de baja la sucursal "${sucursal.nombre_sucursal}"?`;

      // 3. Mostrar el AlertMessage de confirmación
      setAlertaConfig({
        isOpen: true,
        type: "info",
        title: "Confirmar Baja de Sucursal",
        message: mensajeAdvertencia,
        onConfirm: async () => {
          try {
            // Si tiene agentes, los reasignamos a la sucursal ID 1
            if (totalAgentes > 0) {
              const { error: errorReasignacion } = await supabase
                .from("perfiles")
                .update({ sucursal_id: 1 })
                .eq("sucursal_id", sucursal.id);

              if (errorReasignacion) throw errorReasignacion;
            }

            // Cambiar el estado de la sucursal a BAJA
            const { error: errorBaja } = await supabase
              .from("sucursales")
              .update({ estado: "BAJA" })
              .eq("id", sucursal.id);

            if (errorBaja) throw errorBaja;

            // Cerramos la alerta y refrescamos la tabla
            setAlertaConfig((prev) => ({ ...prev, isOpen: false }));
            cargarSucursales();
          } catch (err) {
            console.error("Error al procesar la baja de la sucursal:", err);
            alert("Hubo un error al procesar la solicitud.");
          }
        },
      });
    } catch (err) {
      console.error("Error al verificar los agentes de la sucursal:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 animate-fade-in text-white select-none">
      {/* BARRA SUPERIOR: Buscador y Botones adaptados para Tablet (md) y PC (lg) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        {/* Buscador */}
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar sucursal por nombre, departamento o dirección..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors shadow-inner"
          />
        </div>

        {/* Botones de acción (Íconos solos en tablet, con texto a partir de lg) */}
        <div className="flex flex-wrap items-center justify-end gap-2 w-full md:w-1/2">
          {/* 1. Botón Nuevo */}
          <button
            type="button"
            onClick={() => navigate("/registrar-sucursal")} // O la ruta exacta que tengas configurada para el formulario
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-(--color-primary) text-white text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
            title="Nueva Sucursal"
          >
            <Plus className="size-4 shrink-0" />
            <span className="hidden lg:inline">Nueva</span>
          </button>

          {/* 2. Botón Excel */}
          <button
            type="button"
            onClick={handleGenerarExcelGeneral} // <--- Añade esta línea aquí
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
            title="Lista Excel"
          >
            <Download className="size-4 shrink-0" />
            <span className="hidden lg:inline">Lista Excel</span>
          </button>

          {/* 3. Botón PDF */}
          <button
            type="button"
            onClick={handleGenerarPdfGeneral} // <--- Añade esta línea aquí
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
            title="Lista PDF"
          >
            <FileText className="size-4 shrink-0" />
            <span className="hidden lg:inline">Lista PDF</span>
          </button>

          {/* 4. Botón Detalle (Naranja) */}
          <button
            type="button"
            onClick={handleGenerarReporteDetallado}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
            title="Lista Detalle"
          >
            <FileText className="size-4 shrink-0" />
            <span className="hidden lg:inline">Lista Detalle</span>
          </button>

          {/* 5. Botón Actualizar */}
          <button
            type="button"
            onClick={() => {
              setBusqueda("");
              cargarSucursales();
            }}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-bold shadow-lg transition-all cursor-pointer active:scale-95"
            title="Actualizar"
          >
            <RefreshCw className="size-4 shrink-0" />
            <span className="hidden lg:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Mensaje de error si ocurre */}
      {error && (
        <div className="p-4 rounded-xl text-xs font-semibold mb-6 border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Contenedor principal de la tabla */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-semibold">
            <Loader2 className="size-5 animate-spin text-blue-500" />
            <span>Sincronizando sucursales con la base de datos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4 text-center">ID</th>
                  <th className="py-3.5 px-4">Sucursal</th>
                  <th className="py-3.5 px-4">Departamento</th>
                  <th className="py-3.5 px-4">Dirección</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-900 text-xs font-medium text-zinc-300">
                {sucursalesPaginadas.length > 0 ? (
                  sucursalesPaginadas.map((sucursal) => (
                    <tr
                      key={sucursal.id}
                      className="hover:bg-zinc-950/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 text-center text-zinc-400 font-mono text-xs">
                        {sucursal.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-zinc-100 flex items-center gap-2">
                        <Building2 className="size-4 text-blue-500" />
                        {sucursal.nombre_sucursal}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300">
                        {sucursal.departamento}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 text-xs">
                        {sucursal.direccion}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                            sucursal.estado?.toUpperCase() === "ACTIVO"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {sucursal.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5 cursor-poi">
                          <button
                            onClick={() => {
                              setSucursalSeleccionada(sucursal);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                            title="Ver detalles"
                          >
                            <Eye className="size-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSucursalAEditar(sucursal);
                              setIsModalEditarOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                            title="Editar Sucrsal"
                          >
                            <Pencil className="size-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleIntentarEliminar(sucursal)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-400 transition-colors cursor-pointer"
                            title="Dar de baja sucursal"
                          >
                            <Trash2 className="size-4" />
                          </button>

                          {/* Botón de Reporte Individual (Icono de documento/file) */}
                          <button
                            type="button"
                            onClick={() =>
                              handleGenerarReporteIndividual(
                                sucursal.id,
                                sucursal.nombre_sucursal,
                              )
                            }
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
                            title="Generar Reporte de Sucursal"
                          >
                            <FileText className="size-4" />{" "}
                            {/* O el icono que utilices para este botón */}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-zinc-500 text-xs"
                    >
                      No se encontraron sucursales registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Componente Modal de Detalles integrado al final */}
            <ModalDetalleSucursal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              sucursal={sucursalSeleccionada}
            />{" "}
            <ModalEditarSucursal
              isOpen={isModalEditarOpen}
              onClose={() => setIsModalEditarOpen(false)}
              sucursal={sucursalAEditar}
              onSucursalActualizada={() => {
                cargarSucursales();
              }}
            />
            <AlertMessage
              isOpen={alertaConfig.isOpen}
              type={alertaConfig.type}
              title={alertaConfig.title}
              message={alertaConfig.message}
              onClose={() =>
                setAlertaConfig((prev) => ({ ...prev, isOpen: false }))
              }
              onConfirm={alertaConfig.onConfirm}
              confirmText="Sí, proceder"
              cancelText="Cancelar"
            />
          </div>
        )}

        {/* Paginación exacta */}
        {!loading && sucursalesFiltradas.length > 0 && (
          <div className="bg-zinc-950/80 border-t border-zinc-800/80 px-4 py-3.5 flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold text-zinc-500 tracking-wider">
              Mostrando{" "}
              <span className="text-zinc-300">{indicePrimerItem + 1}</span> al{" "}
              <span className="text-zinc-300">
                {Math.min(indiceUltimoItem, sucursalesFiltradas.length)}
              </span>{" "}
              de{" "}
              <span className="text-zinc-400">
                {sucursalesFiltradas.length}
              </span>{" "}
              sucursales
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                className="size-8 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:bg-zinc-900/30 disabled:border-zinc-800/50 disabled:text-zinc-600 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95"
              >
                <ChevronLeft className="size-4" />
              </button>

              <div className="bg-zinc-900 border border-zinc-800 px-3 h-8 rounded-lg flex items-center text-xs font-black text-blue-400 tracking-wide">
                <span>{paginaActual}</span>
                <span className="text-zinc-600 mx-1.5">/</span>
                <span className="text-zinc-500">{totalPaginas}</span>
              </div>

              <button
                type="button"
                disabled={paginaActual === totalPaginas}
                onClick={() =>
                  setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))
                }
                className="size-8 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:bg-zinc-900/30 disabled:border-zinc-800/50 disabled:text-zinc-600 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95"
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
