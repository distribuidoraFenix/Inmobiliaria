import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { useAuth } from "../context/AuthContext";
import { Link, Navigate } from "react-router-dom";

import {
  Search,
  Eye,
  Trash2,
  FileText,
  Download,
  Home,
  Loader2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface PropiedadDetalle {
  id: string;
  titulo: string;
  tipo_propiedad_id: number;
  tipo_propiedad: string;
  modalidad: string;
  precio: number;
  moneda: string;
  estado: "Disponible" | "Reservado" | "Vendido" | "Inactivo";
  departamento: string;
  zona: string | null;
  fecha_registro: string | null;
  agente_id: string | null;
  nombre_agente: string | null;
  superficie_terreno: number | null;
  habitaciones: number | null;
  baños: number | null;
  descripcion: string | null;
}

export default function ListaPropiedades() {
  const { rol } = useAuth();
  if (rol !== "admin") {
    return <Navigate to="/" replace />;
  }
  const [propiedades, setPropiedades] = useState<PropiedadDetalle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  // Paginación estricta a un máximo de 10 inmuebles por hoja
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const itemsPorPagina = 10;

  // Estados dinámicos para los modales de control solicitados
  const [propiedadVerDetalle, setPropiedadVerDetalle] =
    useState<PropiedadDetalle | null>(null);
  const [propiedadParaEstado, setPropiedadParaEstado] =
    useState<PropiedadDetalle | null>(null);
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] =
    useState<string>("");
  const [guardandoEstado, setGuardandoEstado] = useState<boolean>(false);

  const cargarPropiedades = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: viewError } = await supabase
        .from("vista_propiedades_detalle")
        .select("*");

      if (viewError) throw viewError;
      setPropiedades(data || []);
    } catch (err: any) {
      console.error("Error al cargar propiedades:", err);
      setError(
        err.message || "No se pudo sincronizar el inventario inmobiliario.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPropiedades();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  const handleCambiarEstadoPropiedad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propiedadParaEstado || !nuevoEstadoSeleccionado) return;
    try {
      setGuardandoEstado(true);
      const { error: errUpdate } = await supabase
        .from("propiedades")
        .update({ estado: nuevoEstadoSeleccionado })
        .eq("id", propiedadParaEstado.id);

      if (errUpdate) throw errUpdate;

      setPropiedades((prev) =>
        prev.map((p) =>
          p.id === propiedadParaEstado.id
            ? { ...p, estado: nuevoEstadoSeleccionado as any }
            : p,
        ),
      );
      setPropiedadParaEstado(null);
      setNuevoEstadoSeleccionado("");
    } catch (err: any) {
      console.error("Error al mutar el estado del inmueble:", err);
      alert("No se pudo actualizar el estado de la propiedad en el servidor.");
    } finally {
      setGuardandoEstado(false);
    }
  };

  const exportarExcelMasivo = () => {
    if (propiedadesFiltrados.length === 0) return;
    const datosExcel = propiedadesFiltrados.map((p) => ({
      "Código ID": p.id,
      "Título de Propiedad": p.titulo,
      Tipo: p.tipo_propiedad,
      Modalidad: p.modalidad,
      Precio: p.precio,
      Moneda: p.moneda,
      Departamento: p.departamento,
      "Zona / Barrio": p.zona || "—",
      "Asesor Asignado": p.nombre_agente || "Sin asignar",
      "Estado Actual": p.estado,
    }));
    const hojaTrabajo = XLSX.utils.json_to_sheet(datosExcel);
    const libroTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, "Propiedades");
    XLSX.writeFile(libroTrabajo, "Reporte_Inventario_Propiedades.xlsx");
  };

  // 📍 UBICACIÓN EXACTA: Reemplaza la función exportarPdfMasivo completa por este bloque:

  const exportarPdfMasivo = () => {
    if (propiedadesFiltrados.length === 0) return;

    // Inicializamos el documento de jsPDF en tamaño carta estándar horizontal
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "letter",
    });

    // Encabezado corporativo de alto nivel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(24, 24, 27); // Color zinc-900
    doc.text("INVENTARIO GENERAL DE PROPIEDADES INMOBILIARIAS", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(113, 113, 122); // Color zinc-500
    doc.text(
      `Fecha de emisión: ${new Date().toLocaleDateString("es-BO")} - Registros encontrados: ${propiedadesFiltrados.length}`,
      14,
      26,
    );

    // Mapeamos las columnas y filas adaptadas a propiedades
    const columnas = [
      "Tipo",
      "Título publicitario",
      "Asesor Asignado",
      "Modalidad",
      "Precio",
      "Moneda",
      "Departamento",
      "Estado",
    ];
    const filas = propiedadesFiltrados.map((p) => [
      p.tipo_propiedad,
      p.titulo,
      p.nombre_agente || "—",
      p.modalidad,
      p.precio.toLocaleString("es-BO"),
      p.moneda,
      p.departamento,
      p.estado,
    ]);

    // Invocamos el motor autoTable fijando los colores RGB exactos
    autoTable(doc, {
      startY: 32,
      head: [columnas],
      body: filas,
      theme: "striped",
      headStyles: {
        fillColor: [39, 39, 42], // ⬅️ COLOR FIJADO: Gris oscuro sólido profesional (Zinc-800)
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    // Guardamos y disparamos la descarga nativa en el navegador
    doc.save("Reporte_General_Inventario_Propiedades.pdf");
  };

  const imprimirFichaIndividual = (id: string) => {
    const p = propiedades.find((item) => item.id === id);
    if (!p) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });
    doc.setFillColor(24, 24, 27);
    doc.rect(0, 0, 216, 35, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("FICHA TÉCNICA DE PROPIEDAD", 14, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(`ID Referencia Inmueble: ${p.id}`, 14, 26);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(37, 99, 235);
    doc.text("Detalles de la Oferta Comercial", 14, 48);
    doc.setFontSize(9.5);
    doc.setTextColor(39, 39, 42);
    doc.text(`Título publicitario: ${p.titulo}`, 14, 56);
    doc.text(`Tipo de Inmueble: ${p.tipo_propiedad} en ${p.modalidad}`, 14, 63);
    doc.text(
      `Precio de Operación: ${p.precio.toLocaleString("es-BO")} ${p.moneda}`,
      14,
      70,
    );
    doc.text(
      `Ubicación Geográfica: Depto. ${p.departamento} - Zona: ${p.zona || "No especificada"}`,
      14,
      77,
    );
    doc.text(
      `Asesor encargado del Cierre: ${p.nombre_agente || "Sin asignar"}`,
      14,
      84,
    );
    doc.text(`Estado del Inmueble en Sistema: ${p.estado}`, 14, 91);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Características Técnicas e Infraestructura", 14, 105);
    doc.setFontSize(9.5);
    doc.setTextColor(39, 39, 42);
    doc.text(
      `Superficie de Terreno/Construcción: ${p.superficie_terreno || "—"} m²`,
      14,
      113,
    );
    doc.text(
      `Distribución Interna: ${p.habitaciones || 0} Habitaciones / ${p.baños || 0} Baños`,
      14,
      120,
    );
    doc.text(
      `Descripción Adicional: ${p.descripcion || "Sin comentarios."}`,
      14,
      127,
    );

    doc.setDrawColor(228, 228, 231);
    doc.line(14, 245, 202, 245);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170);
    doc.text(
      `Documento de control automatizado de portafolio inmobiliario emitido el ${new Date().toLocaleDateString("es-BO")}.`,
      14,
      251,
    );
    doc.save(`Ficha_Inmueble_${p.id}.pdf`);
  };

  const propiedadesFiltrados = propiedades.filter((p) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;
    const titulo = p.titulo.toLowerCase();
    const tipo = p.tipo_propiedad.toLowerCase();
    const agente = (p.nombre_agente || "").toLowerCase();
    const depto = p.departamento.toLowerCase();
    const mod = p.modalidad.toLowerCase();
    return (
      titulo.includes(termino) ||
      tipo.includes(termino) ||
      agente.includes(termino) ||
      depto.includes(termino) ||
      mod.includes(termino)
    );
  });

  const totalPaginas = Math.ceil(propiedadesFiltrados.length / itemsPorPagina);
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const propiedadesPaginados = propiedadesFiltrados.slice(
    indicePrimerItem,
    indiceUltimoItem,
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in text-white select-none">
      {/* ENCABEZADO Y REPORTE MASIVO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-blue-400 transition-colors group cursor-pointer mb-2"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            <span>Volver al Catálogo</span>
          </Link>
          <h2 className="text-xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
            <Home className="size-5 text-blue-500" />
            <span>Panel de Gestión de Propiedades</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Control de portafolio, estados comerciales y reportería general de
            inmuebles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportarExcelMasivo}
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-lg shadow-emerald-600/10 active:scale-95"
          >
            <Download className="size-4" />
            <span>Exportar Excel</span>
          </button>
          <button
            onClick={exportarPdfMasivo}
            className="cursor-pointer bg-zinc-800 hover:bg-rose-600 border border-zinc-700 hover:border-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md active:scale-95 group"
          >
            <FileText className="size-4 text-zinc-400 group-hover:text-white" />
            <span>Imprimir Reporte PDF</span>
          </button>
          <button
            onClick={cargarPropiedades}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Sincronizar catálogo"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* BUSCADOR MULTICAMPO */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título, tipo de propiedad, modalidad de oferta, departamento o asesor encargado..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors shadow-inner"
        />
      </div>

      {error && (
        <div className="p-4 rounded-xl text-xs font-semibold mb-6 border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* CONTENEDOR DE LA TABLA OSCURA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-semibold">
            <Loader2 className="size-5 animate-spin text-blue-500" />
            <span>Sincronizando inventario con la base de datos...</span>
          </div>
        ) : propiedadesFiltrados.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 text-xs font-semibold">
            No se encontraron inmuebles que coincidan con los criterios de
            búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4">Tipo Inmueble</th>
                  <th className="py-3.5 px-4">Título Publicitario</th>
                  <th className="py-3.5 px-4">Asesor Encargado</th>
                  <th className="py-3.5 px-4">Modalidad</th>
                  <th className="py-3.5 px-4">Precio Operación</th>
                  <th className="py-3.5 px-4">Departamento</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-900 text-xs font-medium text-zinc-300">
                {propiedadesPaginados.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-zinc-950/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-bold text-blue-400 whitespace-nowrap">
                      {p.tipo_propiedad}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-100 max-w-xs truncate">
                      {p.titulo}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-300">
                      {p.nombre_agente || "Sin asignar"}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          p.modalidad === "Venta"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        }`}
                      >
                        {p.modalidad}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-200 whitespace-nowrap">
                      {p.precio.toLocaleString("es-BO")}{" "}
                      <span className="text-zinc-500 font-sans text-[10px]">
                        {p.moneda}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400 font-semibold">
                      {p.departamento}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          p.estado === "Disponible"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : p.estado === "Reservado"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : p.estado === "Vendido"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                : "bg-zinc-800 text-zinc-500 border-zinc-700"
                        }`}
                      >
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPropiedadVerDetalle(p)}
                          className="size-7 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-blue-500/40 text-zinc-500 hover:text-blue-400 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                          title="Ver ficha técnica"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setPropiedadParaEstado(p);
                            setNuevoEstadoSeleccionado(p.estado);
                          }}
                          className="size-7 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-amber-500/40 text-zinc-500 hover:text-amber-400 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                          title="Cambiar estado comercial"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => imprimirFichaIndividual(p.id)}
                          className="size-7 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-zinc-300 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                          title="Imprimir ficha PDF"
                        >
                          <FileText className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIÓN CON LIMITE DE 10 PROPIEDADES */}
        {!loading && propiedadesFiltrados.length > 0 && (
          <div className="bg-zinc-950/80 border-t border-zinc-800/80 px-4 py-3.5 flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold text-zinc-500 tracking-wider">
              Mostrando{" "}
              <span className="text-zinc-300">{indicePrimerItem + 1}</span> al{" "}
              <span className="text-zinc-300">
                {Math.min(indiceUltimoItem, propiedadesFiltrados.length)}
              </span>{" "}
              de{" "}
              <span className="text-zinc-400">
                {propiedadesFiltrados.length}
              </span>{" "}
              inmuebles
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual((prev) => prev - 1)}
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
                onClick={() => setPaginaActual((prev) => prev + 1)}
                className="size-8 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:bg-zinc-900/30 disabled:border-zinc-800/50 disabled:text-zinc-600 transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 👁️ MODAL OSCURO: DETALLE EXPANDIDO DE LA PROPIEDAD */}
      {propiedadVerDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPropiedadVerDetalle(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <div className="border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-black text-zinc-100 tracking-tight">
                Ficha Técnica Completa
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                ID Inmueble: {propiedadVerDetalle.id}
              </p>
            </div>
            <div className="space-y-4 text-xs">
              <div className="bg-zinc-950/40 p-3 border border-zinc-800 rounded-xl grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Título Comercial
                  </p>
                  <p className="text-zinc-200 font-bold mt-0.5">
                    {propiedadVerDetalle.titulo}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Operación
                  </p>
                  <p className="text-blue-400 font-black mt-0.5">
                    {propiedadVerDetalle.tipo_propiedad} en{" "}
                    {propiedadVerDetalle.modalidad}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Precio del Inmueble
                  </p>
                  <p className="text-zinc-200 font-mono font-bold mt-0.5">
                    {propiedadVerDetalle.precio.toLocaleString("es-BO")}{" "}
                    {propiedadVerDetalle.moneda}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Ubicación
                  </p>
                  <p className="text-zinc-400 font-medium mt-0.5">
                    {propiedadVerDetalle.departamento} -{" "}
                    {propiedadVerDetalle.zona || "—"}
                  </p>
                </div>
              </div>
              <div className="bg-zinc-950/40 p-3 border border-zinc-800 rounded-xl grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Superficie
                  </p>
                  <p className="text-zinc-300 font-bold mt-0.5">
                    {propiedadVerDetalle.superficie_terreno || "—"} m²
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Habitaciones
                  </p>
                  <p className="text-zinc-300 font-bold mt-0.5">
                    {propiedadVerDetalle.habitaciones || 0}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Baños
                  </p>
                  <p className="text-zinc-300 font-bold mt-0.5">
                    {propiedadVerDetalle.baños || 0}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase font-black px-1">
                  Descripción del Asesor
                </p>
                <p className="bg-zinc-950/40 p-3 border border-zinc-800 rounded-xl text-zinc-300 mt-1 whitespace-pre-line leading-relaxed">
                  {propiedadVerDetalle.descripcion ||
                    "Sin descripción registrada."}
                </p>
              </div>
              <div className="text-[10px] text-zinc-500 px-1">
                Asesor asignado al cierre de operaciones:{" "}
                <span className="text-zinc-400 font-bold">
                  {propiedadVerDetalle.nombre_agente || "Sin asignar"}
                </span>
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setPropiedadVerDetalle(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer active:scale-95"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🛠️ MODAL OSCURO: CAMBIO DINÁMICO DE ESTADO (LISTA SOLICITADA) */}
      {propiedadParaEstado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setPropiedadParaEstado(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
            >
              <X className="size-4" />
            </button>
            <h3 className="text-base font-black text-zinc-100 tracking-tight">
              Modificar Estado Comercial
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Selecciona el nuevo estado para el inmueble en el catálogo
              corporativo:
            </p>

            <form
              onSubmit={handleCambiarEstadoPropiedad}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                  Opciones de Disponibilidad
                </label>
                <select
                  value={nuevoEstadoSeleccionado}
                  onChange={(e) => setNuevoEstadoSeleccionado(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  <option value="Disponible">Disponible (En catálogo)</option>
                  <option value="Reservado">Reservado (Con adelanto)</option>
                  <option value="Vendido">Vendido (Operación cerrada)</option>
                  <option value="Inactivo">Inactivo (Ocultar oferta)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPropiedadParaEstado(null)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEstado}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center cursor-pointer active:scale-95 disabled:bg-zinc-800"
                >
                  {guardandoEstado ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <span>Actualizar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
