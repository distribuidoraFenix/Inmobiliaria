import { useEffect, useState } from "react";

import { supabase } from "../lib/supabaseClient";
import {
  Search,
  Eye,
  Trash2,
  FileText,
  Download,
  Briefcase,
  Loader2,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  UserX,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";

// Tipado estricto mapeado idéntico a nuestra Vista de Supabase
interface AgenteDetalle {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  telefono_personal: string;
  telefono_corporativo: string | null;
  estado: "Activo" | "Inactivo" | "Suspendido";
  fecha_ingreso: string | null;
  nombre_sucursal: string | null;
  departamento: string | null;
  nombre_cargo: string | null;
  numero_propiedades: number;
}

export default function ListaAgentes() {
  const { rol } = useAuth();
  const [agentes, setAgentes] = useState<AgenteDetalle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  // Control de paginación estricta a 4 registros por hoja
  const [paginaActual, setPaginaActual] = useState<number>(1);
  const itemsPorPagina = 4;

  // Control del modal corporativo de confirmación de baja lógica
  const [agenteParaBaja, setAgenteParaBaja] = useState<AgenteDetalle | null>(
    null,
  );
  const [ejecutandoBaja, setEjecutandoBaja] = useState<boolean>(false);
  const [agenteVerDetalle, setAgenteVerDetalle] =
    useState<AgenteDetalle | null>(null);
  const cargarAgentes = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: viewError } = await supabase
        .from("vista_agentes_detalle")
        .select("*");

      if (viewError) throw viewError;
      setAgentes(data || []);
    } catch (err: any) {
      console.error("Error al consultar la vista de agentes:", err);
      setError(
        err.message ||
          "No se pudieron sincronizar los expedientes del personal.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rol === "admin") {
      cargarAgentes();
    }
  }, [rol]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda]);

  // FUNCIÓN REAL DE BAJA LÓGICA: Se conecta a Supabase y apaga al agente

  const confirmarBajaLogica = async () => {
    if (!agenteParaBaja) return;
    try {
      setEjecutandoBaja(true);

      const { error: updateError } = await supabase
        .from("perfiles")
        .update({ estado: "Inactivo" })
        .eq("id", agenteParaBaja.id);

      if (updateError) throw updateError;

      // El estado cosmético local se actualiza
      setAgentes((prev) =>
        prev.map((a) =>
          a.id === agenteParaBaja.id ? { ...a, estado: "Inactivo" } : a,
        ),
      );

      setAgenteParaBaja(null);
    } catch (err: any) {
      console.error("Error en baja lógica:", err);
    } finally {
      setEjecutandoBaja(false);
    }
  };

  // 🔍 LÓGICA DEL BUSCADOR MULTICAMPO (Mantenida intacta)
  const agentesFiltrados = agentes.filter((agente) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const nombreCompleto =
      `${agente.nombres} ${agente.apellido_paterno} ${agente.apellido_materno || ""}`.toLowerCase();
    const sucursal = (agente.nombre_sucursal || "").toLowerCase();
    const cargo = (agente.nombre_cargo || "").toLowerCase();
    const telefono = agente.telefono_personal.toLowerCase();
    const telfCorp = (agente.telefono_corporativo || "").toLowerCase();

    return (
      nombreCompleto.includes(termino) ||
      sucursal.includes(termino) ||
      cargo.includes(termino) ||
      telefono.includes(termino) ||
      telfCorp.includes(termino)
    );
  });

  const totalPaginas = Math.ceil(agentesFiltrados.length / itemsPorPagina);
  const indiceUltimoItem = paginaActual * itemsPorPagina;
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina;
  const agentesPaginados = agentesFiltrados.slice(
    indicePrimerItem,
    indiceUltimoItem,
  );

  // 1. RESTRICCIÓN ADMINISTRATIVA: Si el rol no es admin, redirige al catálogo de inmediato
  if (rol && rol !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Handlers para las demás acciones

  // 1. MOTOR DE EXPORTACIÓN A EXCEL (.XLSX) REALS
  const exportarExcelMasivo = () => {
    if (agentesFiltrados.length === 0) return;

    // Mapeamos los datos filtrados actuales de la tabla a un formato plano y prolijo para Excel
    const datosExcel = agentesFiltrados.map((a) => ({
      "Asesor Comercial": `${a.nombres} ${a.apellido_paterno} ${a.apellido_materno || ""}`,
      Cargo: a.nombre_cargo || "Sin asignar",
      Sucursal: a.nombre_sucursal || "No asignada",
      Departamento: a.departamento || "—",
      "Teléfono Móvil": a.telefono_personal,
      "Interno Corp.": a.telefono_corporativo || "—",
      Propiedades: a.numero_propiedades,
      Estado: a.estado,
    }));

    const hojaTrabajo = XLSX.utils.json_to_sheet(datosExcel);
    const libroTrabajo = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libroTrabajo, hojaTrabajo, "Asesores");

    // Descarga automática inmediata en el navegador del usuario
    XLSX.writeFile(libroTrabajo, "Reporte_General_Asesores_Inmobiliarios.xlsx");
  };

  // 2. MOTOR DE RENDERIZADO DE TABLA EN PDF (jsPDF + AutoTable)
  const exportarPdfMasivo = () => {
    if (agentesFiltrados.length === 0) return;

    // Inicializamos el documento de jsPDF en tamaño carta estándar
    const doc = new jsPDF({
      orientation: "landscape", // Cambiado a horizontal para que los datos respiren cómodamente
      unit: "mm",
      format: "letter",
    });

    // Encabezado corporativo de alto nivel
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(24, 24, 27); // Color zinc-900
    doc.text("REPORTE GENERAL DE PERSONAL INMOBILIARIO", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(113, 113, 122); // Color zinc-500
    doc.text(
      `Fecha de emisión: ${new Date().toLocaleDateString("es-BO")} - Registros encontrados: ${agentesFiltrados.length}`,
      14,
      26,
    );

    // Mapeamos las columnas y filas para la grilla
    const columnas = [
      "Asesor Comercial",
      "Cargo Corporativo",
      "Sucursal Asignada",
      "Dpto.",
      "Teléfono",
      "Propiedades",
      "Estado",
    ];
    const filas = agentesFiltrados.map((a) => [
      `${a.nombres} ${a.apellido_paterno} ${a.apellido_materno || ""}`,
      a.nombre_cargo || "—",
      a.nombre_sucursal || "—",
      a.departamento || "—",
      a.telefono_personal,
      a.numero_propiedades.toString(), // Convertido a texto para evitar advertencias de tipado
      a.estado,
    ]);

    // Invocamos el motor autoTable con los colores y márgenes completos
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
    doc.save("Reporte_General_Asesores_Inmobiliarios.pdf");
  };

  // 2. CORRECCIÓN BOTÓN DEL OJO: Buscamos el ID real del agente seleccionado en la fila y abrimos su modal
  const revisarDetalleIndividual = (id: string) => {
    const agenteSeleccionado = agentes.find((a) => a.id === id);
    if (agenteSeleccionado) {
      setAgenteVerDetalle(agenteSeleccionado); // Inyecta el objeto del trabajador correcto en el modal
    }
  };

  // 4. MOTOR DE IMPRESIÓN DE BOLETA DE EXPEDIENTE INDIVIDUAL (Icono PDF de Fila)
  const imprimirFichaIndividual = (id: string) => {
    // Buscamos los datos del agente seleccionado dentro de nuestro arreglo local
    const agenteSeleccionado = agentes.find((a) => a.id === id);
    if (!agenteSeleccionado) return;

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "letter",
    });

    // Encabezado con Estética de Ficha Corporativa Elegante
    doc.setFillColor(24, 24, 27); // Fondo superior oscuro (Zinc-900)
    doc.rect(0, 0, 216, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text("FICHA DE EXPEDIENTE CORPORATIVO", 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175); // Zinc-400
    doc.text(`ID Único de Registro: ${agenteSeleccionado.id}`, 14, 28);

    // Bloque A: Datos Generales e Identidad del Trabajador
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235); // Azul Corporativo (Blue-600)
    doc.text("A. Información de Identidad Laboral", 14, 52);

    doc.setFontSize(10);
    doc.setTextColor(39, 39, 42); // Zinc-800
    doc.text(
      `Nombre Completo: ${agenteSeleccionado.nombres} ${agenteSeleccionado.apellido_paterno} ${agenteSeleccionado.apellido_materno || ""}`,
      14,
      62,
    );
    doc.text(
      `Cargo Ejecutivo: ${agenteSeleccionado.nombre_cargo || "Sin asignar"}`,
      14,
      70,
    );
    doc.text(
      `Fecha de Ingreso: ${agenteSeleccionado.fecha_ingreso ? new Date(agenteSeleccionado.fecha_ingreso).toLocaleDateString("es-BO") : "No registrada"}`,
      14,
      78,
    );

    // Bloque B: Localización y Sucursal Física de Bolivia
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("B. Asignación Geográfica y Móviles", 14, 94);

    doc.setFontSize(10);
    doc.setTextColor(39, 39, 42);
    doc.text(
      `Sucursal Asignada: ${agenteSeleccionado.nombre_sucursal || "No asignada"}`,
      14,
      104,
    );
    doc.text(
      `Departamento Operativo: ${agenteSeleccionado.departamento || "—"}`,
      14,
      112,
    );
    doc.text(
      `Teléfono Móvil Personal: ${agenteSeleccionado.telefono_personal}`,
      14,
      120,
    );
    doc.text(
      `Línea Interna / Corp.: ${agenteSeleccionado.telefono_corporativo || "No asignado"}`,
      14,
      128,
    );

    // Bloque C: Estado y Productividad Comercial
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("C. Indicadores de Productividad y Estado", 14, 144);

    doc.setFontSize(10);
    doc.setTextColor(39, 39, 42);
    doc.text(
      `Cantidad de Inmuebles Registrados: ${agenteSeleccionado.numero_propiedades} propiedades`,
      14,
      154,
    );
    doc.text(
      `Estado Legal en el Sistema: ${agenteSeleccionado.estado}`,
      14,
      162,
    );

    // Pie de página institucional de control
    doc.setDrawColor(228, 228, 231); // Borde gris claro (Zinc-200)
    doc.line(14, 250, 202, 250);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170); // Zinc-400
    doc.text(
      `Documento emitido de forma automatizada por el Sistema de Control Inmobiliario el ${new Date().toLocaleDateString("es-BO")}.`,
      14,
      256,
    );

    // Disparar descarga directa del archivo con el nombre personalizado del agente
    doc.save(
      `Ficha_Corporativa_${agenteSeleccionado.apellido_paterno}_${agenteSeleccionado.nombres}.pdf`,
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 animate-fade-in text-white select-none">
      {/* ENCABEZADO Y BOTONES DE REPORTE MASIVO */}
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
            <Briefcase className="size-5 text-blue-500" />
            <span>Panel de Gestión de Personal</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Control jerárquico, sucursales y reportería de asesores comerciales
          </p>
        </div>

        {/* BOTONES SUPERIORES DE EXPORTACIÓN */}
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
            onClick={cargarAgentes}
            className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Sincronizar tabla"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      {/* SECCIÓN DEL BUSCADOR INTELIGENTE MULTICAMPO */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar asesor por nombre, sucursal, cargo, departamento, teléfono móvil o corporativo..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors shadow-inner"
        />
      </div>

      {/* MENSAJES DE ERROR */}
      {error && (
        <div className="p-4 rounded-xl text-xs font-semibold mb-6 border bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-start gap-3">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* CONTENEDOR DE LA TABLA OSCURA RESPONSIVA */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-zinc-500 text-xs font-semibold">
            <Loader2 className="size-5 animate-spin text-blue-500" />
            <span>Sincronizando expedientes con la base de datos...</span>
          </div>
        ) : agentesFiltrados.length === 0 ? (
          <div className="py-20 text-center text-zinc-500 text-xs font-semibold">
            No se encontraron asesores que coincidan con los criterios de
            búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4">Asesor Comercial</th>
                  <th className="py-3.5 px-4">Cargo / Rol</th>
                  <th className="py-3.5 px-4">Sucursal</th>
                  <th className="py-3.5 px-4">Teléfono Móvil</th>
                  <th className="py-3.5 px-4">Interno Corp.</th>
                  <th className="py-3.5 px-4 text-center">N° Propiedades</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-900 text-xs font-medium text-zinc-300">
                {agentesPaginados.map((agente) => (
                  <tr
                    key={agente.id}
                    className="hover:bg-zinc-950/40 transition-colors group"
                  >
                    {/* Nombre Completo */}
                    <td className="py-3.5 px-4 font-bold text-zinc-100 whitespace-nowrap">
                      {agente.nombres} {agente.apellido_paterno}{" "}
                      {agente.apellido_materno || ""}
                    </td>

                    {/* Cargo Corporativo */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-blue-400 font-bold">
                        {agente.nombre_cargo || "Sin asignar"}
                      </span>
                    </td>

                    {/* Sucursal y Departamento */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <p className="text-zinc-200 font-semibold">
                          {agente.nombre_sucursal || "No asignada"}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          {agente.departamento}
                        </p>
                      </div>
                    </td>

                    {/* Teléfono Personal */}
                    <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                      {agente.telefono_personal}
                    </td>

                    {/* Teléfono Corporativo */}
                    <td className="py-3.5 px-4 font-mono text-zinc-500 whitespace-nowrap">
                      {agente.telefono_corporativo || "—"}
                    </td>

                    {/* Conteo de Propiedades */}
                    <td className="py-3.5 px-4 text-center font-black text-zinc-100 text-sm">
                      <span className="bg-zinc-950 border border-zinc-800/80 px-2.5 py-0.5 rounded-lg">
                        {agente.numero_propiedades}
                      </span>
                    </td>

                    {/* Badge de Estado Lógico */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                          agente.estado === "Activo"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : agente.estado === "Inactivo"
                              ? "bg-zinc-800 text-zinc-500 border-zinc-700"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {agente.estado}
                      </span>
                    </td>

                    {/* BOTONES DE ACCIONES INDIVIDUALES (SINCRONIZADOS POR ID) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Acción 1: Revisar Detalle en MiPerfil (Icono Ojo) */}
                        <button
                          onClick={() => revisarDetalleIndividual(agente.id)}
                          className="size-7 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-blue-500/40 text-zinc-500 hover:text-blue-400 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                          title="Ver detalle del expediente"
                        >
                          <Eye className="size-3.5" />
                        </button>

                        {/* Acción 2: Dar de Baja Lógica (Icono Basurero) */}
                        <button
                          onClick={() => setAgenteParaBaja(agente)}
                          className="size-7 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-rose-500/40 text-zinc-500 hover:text-rose-400 transition-all flex items-center justify-center cursor-pointer active:scale-90"
                          title="Dar de baja"
                        >
                          <Trash2 className="size-3.5" />
                        </button>

                        {/* Acción 3: Imprimir Ficha de Boleta Individual (Icono PDF de Fila) */}
                        <button
                          onClick={() => imprimirFichaIndividual(agente.id)}
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

        {/* BOTONERA DE PAGINACIÓN FLOTANTE BAJA */}
        {/* 📍 UBICACIÓN: Reemplaza todo el bloque de paginación e inferiores hasta el cierre del archivo por este código: */}
        {!loading && agentesFiltrados.length > 0 && (
          <div className="bg-zinc-950/80 border-t border-zinc-800/80 px-4 py-3.5 flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold text-zinc-500 tracking-wider">
              Mostrando{" "}
              <span className="text-zinc-300">{indicePrimerItem + 1}</span> al{" "}
              <span className="text-zinc-300">
                {Math.min(indiceUltimoItem, agentesFiltrados.length)}
              </span>{" "}
              de{" "}
              <span className="text-zinc-400">{agentesFiltrados.length}</span>{" "}
              trabajadores
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

      {/* MODAL OSCURO DE CONFIRMACIÓN DE BAJA LÓGICA CORPORATIVA */}
      {agenteParaBaja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative animate-scale-in">
            <button
              onClick={() => setAgenteParaBaja(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="size-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <UserX className="size-6" />
            </div>

            <h3 className="text-base font-black text-zinc-100 tracking-tight">
              ¿Confirmar Baja Comercial?
            </h3>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Estás a punto de cambiar el estado de{" "}
              <span className="text-zinc-200 font-bold">
                {agenteParaBaja.nombres} {agenteParaBaja.apellido_paterno}
              </span>{" "}
              a{" "}
              <span className="text-zinc-500 font-bold uppercase">
                Inactivo
              </span>
              .
            </p>
            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
              El asesor perderá los permisos de acceso al panel, pero su
              historial de propiedades registradas se mantendrá intacto por
              seguridad empresarial.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setAgenteParaBaja(null)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-bold py-2 rounded-xl transition-all cursor-pointer text-center active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={ejecutandoBaja}
                onClick={confirmarBajaLogica}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:bg-zinc-800 disabled:text-zinc-600"
              >
                {ejecutandoBaja ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <span>Desactivar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {agenteVerDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setAgenteVerDetalle(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              X
            </button>
            <div className="border-b border-zinc-800 pb-3 mb-4">
              <h3 className="text-base font-black text-zinc-100 tracking-tight">
                Expediente General del Asesor
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Mapeo detallado de credenciales y registros internos
              </p>
            </div>
            <div className="space-y-4 text-xs">
              <div className="bg-zinc-950/40 p-3 border border-zinc-800 rounded-xl grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Nombres y Apellidos
                  </p>
                  <p className="text-zinc-200 font-bold mt-0.5">
                    {agenteVerDetalle.nombres}{" "}
                    {agenteVerDetalle.apellido_paterno}{" "}
                    {agenteVerDetalle.apellido_materno || ""}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-zinc-500 uppercase font-black">
                    Cargo Corporativo
                  </p>
                  <p className="text-blue-400 font-black mt-0.5">
                    {agenteVerDetalle.nombre_cargo || "—"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setAgenteVerDetalle(null)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-5 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
