import * as XLSX from "xlsx";
import { supabase } from "../lib/supabaseClient";

export interface GenerarReporteExcelProps {
  tituloReporte: string;
  usuarioGenerador?: string;
  columnas: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filas: any[][];
  nombreArchivo?: string;
}

export async function generarReporteExcel({
  tituloReporte,
  usuarioGenerador,
  columnas,
  filas,
  nombreArchivo = "reporte-appinmo.xlsx",
}: GenerarReporteExcelProps) {
  let nombreEmpresa = "APP INMOBILIARIA";
  let nombreUsuarioFinal = usuarioGenerador;

  // --- 0. CONSULTAR CONFIGURACIÓN Y SESIÓN DESDE SUPABASE ---
  try {
    const [configRes, sessionRes] = await Promise.all([
      supabase.from("configuracion").select("nombre_empresa").single(),
      supabase.auth.getUser()
    ]);

    if (!configRes.error && configRes.data?.nombre_empresa) {
      nombreEmpresa = configRes.data.nombre_empresa;
    }

    if (!nombreUsuarioFinal && sessionRes.data?.user) {
      const metadata = sessionRes.data.user.user_metadata;
      nombreUsuarioFinal = metadata?.nombre || metadata?.full_name || sessionRes.data.user.email || "Administrador";
    }
  } catch (err) {
    console.warn("No se pudo cargar la configuración o sesión para el Excel:", err);
  }

  if (!nombreUsuarioFinal) {
    nombreUsuarioFinal = "Administrador";
  }

  const fechaActual = new Date().toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // --- 1. CONSTRUCCIÓN DE LA ESTRUCTURA INSTITUCIONAL Y TABLA ---
  const dataExcel = [
    [nombreEmpresa.toUpperCase()],
    [tituloReporte.toUpperCase()],
    [`Emitido por: ${nombreUsuarioFinal}`, `Fecha: ${fechaActual}`],
    [], // Fila en blanco separadora
    columnas, // Cabeceras de la tabla
    ...filas,  // Datos filtrados
  ];

  // --- 2. GENERAR Y DESCARGAR ARCHIVO ---
  const worksheet = XLSX.utils.aoa_to_sheet(dataExcel);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

  XLSX.writeFile(workbook, nombreArchivo);
}