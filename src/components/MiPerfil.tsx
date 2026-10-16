import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ArrowLeft,
  Loader2,
  Home,
} from "lucide-react";
import { Link } from "react-router-dom";

// Tipado estricto basado en tu tabla de Supabase (ACTUALIZADO con avatar_url)
interface PerfilDatos {
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  fecha_nacimiento: string;
  telefono_personal: string;
  telefono_corporativo: string | null;
  departamento: string;
  direccion: string | null;
  referencia: string | null;
  parentezco: string | null;
  telefono_referencia: string | null;
  telefono_referencia_dos: string | null;
  fecha_ingreso: string | null;
  rol: "user" | "admin";
  avatar_url: string | null; // <-- Agregado para TypeScript
}

export default function MiPerfil() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PerfilDatos | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarPerfil() {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error: fbError } = await supabase
          .from("perfiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fbError) throw fbError;
        setPerfil(data);
      } catch (err: any) {
        console.error("Error al cargar perfil:", err);
        setError(err.message || "No se pudieron cargar los datos del perfil.");
      } finally {
        setLoading(false);
      }
    }

    cargarPerfil();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-zinc-400 text-xs font-semibold gap-2">
        <Loader2 className="size-4 animate-spin text-blue-500" />
        <span>Cargando datos de perfil...</span>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-semibold text-center">
        {error || "Ocurrió un error inesperado al mapear los datos."}
      </div>
    );
  }

  // Helper para formatear fechas legibles
  const formatearFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "No registrada";
    return new Date(fechaStr).toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  // LÓGICA DE DETECCIÓN MULTIMEDIA PARA EL AVATAR

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 animate-fade-in">
      {/* BOTÓN REGRESAR */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-blue-400 transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        <span>Volver al Catálogo</span>
      </Link>

      {/* TARJETA PRINCIPAL */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        {/* ENCABEZADO DE PERFIL */}
        <div className="p-6 bg-linear-to-r from-zinc-900 to-zinc-800/50 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* CONTENEDOR MULTIMEDIA DEL AVATAR DINÁMICO */}

            <div className="size-16 rounded-full overflow-hidden border border-blue-500/30 shadow-inner shrink-0 bg-zinc-950 flex items-center justify-center">
              <img
                src={
                  perfil?.avatar_url ||
                  "https://ltivmoqjhoxfmlbplkee.supabase.co/storage/v1/object/public/avatares/usuario.webp"
                }
                alt={`Avatar de ${perfil?.nombres || "Agente"}`}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  // Fallback por si la URL de la base de datos falla o se corrompe en el viaje
                  (e.target as HTMLImageElement).src =
                    "https://ltivmoqjhoxfmlbplkee.supabase.co/storage/v1/object/public/avatares/usuario.webp";
                }}
              />
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-lg font-black text-zinc-100 tracking-tight">
                {perfil.nombres} {perfil.apellido_paterno}{" "}
                {perfil.apellido_materno || ""}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* BADGE DE ROL */}
          <span
            className={`text-[10px] font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 uppercase tracking-wider ${
              perfil.rol === "admin"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}
          >
            <Shield className="size-3" />
            {perfil.rol}
          </span>
        </div>

        {/* CONTENIDO / DETALLES */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BLOQUE 1: DATOS PERSONALES */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
              Datos Personales
            </h3>

            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Fecha de Nacimiento
                </p>
                <p className="text-xs text-zinc-200 font-medium mt-0.5">
                  {formatearFecha(perfil.fecha_nacimiento)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="size-4 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Departamento / Ubicación
                </p>
                <p className="text-xs text-zinc-200 font-medium mt-0.5">
                  {perfil.departamento}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Home className="size-4 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Dirección de Domicilio
                </p>
                <p className="text-xs text-zinc-200 font-medium mt-0.5">
                  {perfil.direccion || "No especificada"}
                </p>
                {perfil.referencia && (
                  <p className="text-[11px] text-zinc-400 italic mt-1">
                    Ref: {perfil.referencia}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* BLOQUE 2: CONTACTO Y EMPRESA */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
              Contacto & Registro
            </h3>

            <div className="flex items-start gap-3">
              <Phone className="size-4 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Teléfono Personal
                </p>
                <p className="text-xs text-zinc-200 font-medium mt-0.5">
                  {perfil.telefono_personal}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="size-4 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Teléfono Corporativo
                </p>
                <p className="text-xs text-zinc-200 font-medium mt-0.5">
                  {perfil.telefono_corporativo || "No asignado"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="size-4 text-zinc-500 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Fecha de Ingreso al Sistema
                </p>
                <p className="text-xs text-zinc-200 font-medium mt-0.5">
                  {formatearFecha(perfil.fecha_ingreso)}
                </p>
              </div>
            </div>
          </div>

          {/* BLOQUE MULTICOLUMNA INTERNO: REFERENCIAS DE EMERGENCIA */}
          {(perfil.telefono_referencia || perfil.parentezco) && (
            <div className="md:col-span-2 bg-zinc-950/40 border border-zinc-800/60 rounded-xl p-4 space-y-3 mt-2">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                Contacto de Referencia / Emergencia
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase">
                    Parentesco
                  </p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {perfil.parentezco || "No especificado"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase">
                    Teléfono Ref 1
                  </p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {perfil.telefono_referencia || "No registrado"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase">
                    Teléfono Ref 2
                  </p>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    {perfil.telefono_referencia_dos || "No registrado"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
