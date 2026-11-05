import { useEffect, useState } from "react";
import { Building2, X, Printer, Users } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { generarReportePdf } from "../../utils/pdfReportTemplate"; 

interface Sucursal {
  id: number;
  nombre_sucursal: string;
  departamento: string;
  direccion: string;
  estado: string;
}

interface ModalDetalleSucursalProps {
  isOpen: boolean;
  onClose: () => void;
  sucursal: Sucursal | null;
}

export function ModalDetalleSucursal({
  isOpen,
  onClose,
  sucursal,
}: ModalDetalleSucursalProps) {
  const [loading, setLoading] = useState(false);
  const [datosDetalle, setDatosDetalle] = useState<any>(null);

  useEffect(() => {
    if (isOpen && sucursal) {
      cargarDetalleSucursal(sucursal.id);
    } else {
      setDatosDetalle(null);
    }
  }, [isOpen, sucursal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const cargarDetalleSucursal = async (sucursalId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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
      setDatosDetalle(data);
    } catch (err) {
      console.error("Error al cargar el detalle de la sucursal:", err);
    } finally {
      setLoading(false);
    }
  };

  // Función para generar el PDF usando tu plantilla institucional oficial
  const handleGenerarPdf = async () => {
    if (!datosDetalle) return;

    try {
      const filasPdf: any[][] = [];

      // 1. Fila de Encabezado / Subtítulo de la sucursal
      filasPdf.push([
        {
          content: `SUCURSAL: ${datosDetalle.nombre_sucursal} (${datosDetalle.departamento}) - Estado: ${datosDetalle.estado}`,
          colSpan: 6,
          styles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
        },
      ]);

      // 2. Listado de Agentes de esta sucursal
      if (datosDetalle.perfiles && datosDetalle.perfiles.length > 0) {
        datosDetalle.perfiles.forEach((agente: any) => {
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

      // 3. Llamado directo a tu plantilla institucional oficial
      await generarReportePdf({
        tituloReporte: `REPORTE - DETALLE DE SUCURSAL - ${datosDetalle.nombre_sucursal.toUpperCase()}`,
        columnas: [
          "Información General / Agente",
          "Antigüedad",
          "Propiedades",
          "Cierres",
          "Mov.",
          "Ganancias",
        ],
        filas: filasPdf,
        nombreArchivo: `reporte-sucursal-${datosDetalle.id}.pdf`,
      });
    } catch (err) {
      console.error("Error al generar el reporte PDF:", err);
    }
  };

  if (!isOpen || !sucursal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Vista Previa - Detalle de Sucursal
              </h2>
              <p className="text-xs text-zinc-400">
                {sucursal.nombre_sucursal} ({sucursal.departamento})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title="Cerrar (ESC)"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Cuerpo del Modal (Vista previa limpia y tal cual la tenías) */}
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Users className="size-4 text-blue-400" />
              Agentes Asignados y Métricas
            </h3>

            {loading ? (
              <div className="py-12 text-center text-xs text-zinc-400">
                Cargando información...
              </div>
            ) : (
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-blue-600 text-white font-bold">
                      <th
                        colSpan={6}
                        className="px-4 py-3 text-sm tracking-wide"
                      >
                        SUCURSAL: {sucursal.nombre_sucursal} (
                        {sucursal.departamento}) - Estado: {sucursal.estado}
                      </th>
                    </tr>
                    <tr className="bg-zinc-800/50 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
                      <th className="px-4 py-3">Nombre del Agente</th>
                      <th className="px-4 py-3">Antigüedad</th>
                      <th className="px-4 py-3 text-center">
                        Prop. Consignadas
                      </th>
                      <th className="px-4 py-3 text-center">Cierres</th>
                      <th className="px-4 py-3 text-center">Mov.</th>
                      <th className="px-4 py-3 text-right">Ganancias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {datosDetalle?.perfiles &&
                    datosDetalle.perfiles.length > 0 ? (
                      datosDetalle.perfiles.map((agente: any) => {
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

                        return (
                          <tr
                            key={agente.id}
                            className="hover:bg-zinc-800/20 transition-colors"
                          >
                            <td className="px-4 py-3 font-medium text-white">
                              {agente.nombres} {agente.apellido_paterno}
                            </td>
                            <td className="px-4 py-3 text-zinc-400">
                              {antiguedadTexto}
                            </td>
                            <td className="px-4 py-3 text-center font-medium text-blue-400">
                              {totalPropiedades}
                            </td>
                            <td className="px-4 py-3 text-center text-zinc-400">
                              0
                            </td>
                            <td className="px-4 py-3 text-center text-zinc-400">
                              0
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-emerald-400">
                              $ 0.00
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-zinc-500 italic"
                        >
                          No hay agentes registrados en esta sucursal.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pie de Página / Acciones */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleGenerarPdf}
            disabled={loading || !datosDetalle}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Printer className="size-4" />
            <span>Imprimir / Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
