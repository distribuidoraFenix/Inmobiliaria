// src/utils/notificationTemplates.ts

// Tipos permitidos según tu esquema en Supabase (public.tipo_notificacion)
export type TipoNotificacion = "propiedad" | "agente" | "estado" | "sistema" | "sucursal";

interface DatosNotificacion {
  titulo: string;
  mensaje: string;
  tipo: TipoNotificacion;
}

/**
 * Fábrica de mensajes para las alertas del sistema.
 * Centraliza la estructura de los textos para mantener consistencia en toda la aplicación.
 */
export const notificationTemplates = {
  // 1. Cuando se registra un nuevo usuario/agente
  nuevoUsuario: (nombre: string, correo: string, rol: string): DatosNotificacion => ({
    titulo: "NUEVO USUARIO REGISTRADO",
    mensaje: `Nombre: ${nombre}\nCorreo: ${correo}\nTipo de usuario: ${rol}`,
    tipo: "agente",
  }),

  // 2. Cuando se da de alta o se registra una propiedad
  nuevaPropiedad: (tituloPropiedad: string, operacion: string, zona?: string): DatosNotificacion => ({
    titulo: "NUEVA PROPIEDAD REGISTRADA",
    mensaje: `Se ha publicado una nueva propiedad: ${tituloPropiedad}.\nOperación: ${operacion}${zona ? `\nZona: ${zona}` : ""}`,
    tipo: "propiedad",
  }),

  // 3. Cuando cambia el estado de una propiedad (ej. Disponible -> Vendido / Alquilado / Inactivo)
  cambioEstadoPropiedad: (tituloPropiedad: string, nuevoEstado: string): DatosNotificacion => ({
    titulo: "CAMBIO DE ESTADO DE PROPIEDAD",
    mensaje: `La propiedad "${tituloPropiedad}" ha actualizado su estado a: ${nuevoEstado.toUpperCase()}.`,
    tipo: "estado",
  }),

   // 4. Cuando se da de alta o se registra una sucursal
  nuevaSucursal: (tituloSucursal: string, operacion: string, departamento?: string): DatosNotificacion => ({
    titulo: "NUEVA SUCURSAL REGISTRADA",
    mensaje: `Se ha publicado una nueva sucursal: ${tituloSucursal}.\nOperación: ${operacion}${departamento ? `\nDepartamento: ${departamento}` : ""}`,
    tipo: "sucursal",
  }),

  // 5. Alertas generales del sistema
  sistemaAviso: (titulo: string, descripcion: string): DatosNotificacion => ({
    titulo: titulo.toUpperCase(),
    mensaje: descripcion,
    tipo: "sistema",
  }),
};