import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "../lib/supabaseClient"

export interface GenerarReportePdfProps {
  tituloReporte: string;
  usuarioGenerador?: string;
  columnas: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filas: any[][];
  nombreArchivo?: string;
}

export async function generarReportePdf({
  tituloReporte,
  usuarioGenerador = "Administrador",
  columnas,
  filas,
  nombreArchivo = "reporte-appinmo.pdf",
}: GenerarReportePdfProps) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  let nombreEmpresa = "APP INMOBILIARIA";
  let logoUrl = "";

  // --- 0. CONSULTAR CONFIGURACIÓN DESDE SUPABASE ---
  try {
    const { data, error } = await supabase
      .from("configuracion")
      .select("nombre_empresa, logo_url")
      .single();

    if (!error && data) {
      if (data.nombre_empresa) nombreEmpresa = data.nombre_empresa;
      if (data.logo_url) logoUrl = data.logo_url;
    }
  } catch (err) {
    console.warn("No se pudo cargar la configuración institucional para el PDF:", err);
  }

  

  // Función auxiliar para convertir la URL de la imagen a Base64 (necesario para jsPDF)
  const obtenerImagenBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  let imagenBase64: string | null = null;
  if (logoUrl) {
    imagenBase64 = await obtenerImagenBase64(logoUrl);
  }

  // --- 1. ENCABEZADO INSTITUCIONAL ---
  let startYContent = 18;

  // Si tenemos el logo en base64, lo insertamos a la izquierda
  if (imagenBase64) {
    try {
      // Dibujamos la imagen (pos X: 14, Y: 12, Ancho: 12, Alto: 12 aprox)
      doc.addImage(imagenBase64, "PNG", 14, 12, 12, 12);
    } catch (e) {
      console.warn("Error al incrustar el logo en el PDF:", e);
    }
  }

  // Si hay logo desplazamos un poco el texto a la derecha, si no, lo dejamos en 14
  const textLeftMargin = imagenBase64 ? 30 : 14;

  // Título de la Empresa / Organización obtenido de Supabase
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(nombreEmpresa.toUpperCase(), textLeftMargin, startYContent);

  // Subtítulo descriptivo
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text("Sistema Integral de Gestión de Propiedades y Sucursales", textLeftMargin, startYContent + 5);

  // --- 2. METADATOS (Fecha y Usuario a la derecha) ---
  const fechaActual = new Date().toLocaleDateString("es-BO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Emitido por: ${usuarioGenerador}`, pageWidth - 14, 15, { align: "right" });
  doc.text(`Fecha: ${fechaActual}`, pageWidth - 14, 20, { align: "right" });

  // --- 3. LÍNEA SEPARADORA ELEGANTE ---
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 28, pageWidth - 14, 28);

  // --- 4. TÍTULO DINÁMICO DEL REPORTE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(tituloReporte.toUpperCase(), 14, 36);

  // --- 5. TABLA DE DATOS (AutoTable) ---
  autoTable(doc, {
    startY: 41,
    head: [columnas],
    body: filas,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235], // Azul corporativo (Blue-600)
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85], // Slate-700
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate-50
    },
    margin: { left: 14, right: 14 },
    didDrawPage: (data) => {
      const pageCount = doc.internal.pages.length - 1;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Página ${data.pageNumber} de ${pageCount}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 10,
        { align: "right" }
      );
      doc.text(
        `${nombreEmpresa} - Reporte Oficial del Sistema`,
        14,
        doc.internal.pageSize.getHeight() - 10
      );
    },
  });

  // --- 6. DESCARGAR ARCHIVO ---
  doc.save(nombreArchivo);
}