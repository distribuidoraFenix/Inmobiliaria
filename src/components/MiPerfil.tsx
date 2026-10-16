import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import {
  Phone,
  MapPin,
  Calendar,
  Shield,
  ArrowLeft,
  Loader2,
  Home,
  Camera,
  Award,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

interface PerfilDatos {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string | null;
  telefono_personal: string;
  telefono_corporativo: string | null;
  direccion: string | null;
  referencia: string | null;
  parentezco: string | null;
  telefono_referencia: string | null;
  telefono_referencia_dos: string | null;
  fecha_ingreso: string | null;
  rol: "user" | "admin";
  avatar_url: string | null;
  estado: string;
  sucursales: {
    nombre_sucursal: string;
    departamento: string;
    direccion: string;
  } | null;
  cargos: { nombre_cargo: string } | null;
}

export default function MiPerfil() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PerfilDatos | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // NUEVO ESTADO: Control de alertas elegantes integradas en la interfaz (Reemplaza a los alerts feos)
  const [bannerAlert, setBannerAlert] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados del Formulario de Edición
  const [editForm, setEditForm] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    telefonoPersonal: "",
    telefonoCorporativo: "",
    direccion: "",
    referenciaNombre: "",
    parentezco: "",
    telefonoReferencia: "",
    telefonoReferenciaDos: "",
  });

  const [subiendoFoto, setSubiendoFoto] = useState<boolean>(false);
  const [guardandoDatos, setGuardandoDatos] = useState<boolean>(false);

  // Función asíncrona centralizada para jalar tu expediente de la nube
  const cargarPerfilCompleto = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error: fbError } = await supabase
        .from("perfiles")
        .select(
          `
          *,
          sucursales:sucursal_id (nombre_sucursal, departamento, direccion),
          cargos:cargo_id (nombre_cargo)
        `,
        )
        .eq("id", user.id)
        .single();

      if (fbError) throw fbError;

      setPerfil(data);
      setEditForm({
        nombres: data.nombres || "",
        apellidoPaterno: data.apellido_paterno || "",
        apellidoMaterno: data.apellido_materno || "",
        telefonoPersonal: data.telefono_personal || "",
        telefonoCorporativo: data.telefono_corporativo || "",
        direccion: data.direccion || "",
        referenciaNombre: data.referencia || "",
        parentezco: data.parentezco || "",
        telefonoReferencia: data.telefono_referencia || "",
        telefonoReferenciaDos: data.telefono_referencia_dos || "",
      });
    } catch (err: any) {
      console.error("Error al cargar perfil relacional:", err);
      setError(err.message || "No se pudieron mapear los datos corporativos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPerfilCompleto();
  }, [user?.id]);
  // 1. FUNCIÓN DE SUBIDA MULTIMEDIA: Actualiza la tabla y los metadatos del Navbar en vivo
  const handleCambiarFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0 || !user?.id) return;
      setSubiendoFoto(true);
      const file = e.target.files[0]; // Captura el archivo individual seleccionado

      const extensionArchivo = file.name.split(".").pop();
      const nombreUnico = `${user.id}_${Date.now()}_avatar.${extensionArchivo}`;

      // A. Subimos la nueva foto al Storage Bucket
      const { error: errorSubida } = await supabase.storage
        .from("avatares")
        .upload(nombreUnico, file);

      if (errorSubida) throw errorSubida;

      // B. Extraemos su URL pública de internet
      const { data: dataUrl } = supabase.storage
        .from("avatares")
        .getPublicUrl(nombreUnico);

      const nuevaUrlPublica = dataUrl.publicUrl;

      // C. Guardamos la URL de la nueva foto en la tabla pública de perfiles
      const { error: errorTabla } = await supabase
        .from("perfiles")
        .update({ avatar_url: nuevaUrlPublica })
        .eq("id", user.id);

      if (errorTabla) throw errorTabla;

      // D. ¡ACCION CRÍTICA!: Actualizamos los metadatos de la sesión activa de Supabase
      // Esto fuerza al Navbar a recibir la nueva URL en vivo sin hacer re-login
      const { error: errorAuth } = await supabase.auth.updateUser({
        data: { avatar_url: nuevaUrlPublica },
      });

      if (errorAuth) throw errorAuth;

      // E. Notificación elegante en pantalla
      setBannerAlert({
        type: "success",
        text: "¡Fotografía de perfil actualizada con éxito!",
      });
      setTimeout(() => setBannerAlert(null), 4000);

      // F. Recargamos el expediente local para pintar la foto grande en el acto
      await cargarPerfilCompleto();
    } catch (err: any) {
      console.error("Error al subir nueva fotografía:", err);
      setBannerAlert({
        type: "error",
        text: "No se pudo actualizar la imagen de perfil.",
      });
      setTimeout(() => setBannerAlert(null), 4000);
    } finally {
      setSubiendoFoto(false);
    }
  };

  // 2. FUNCIÓN: Guardar la edición de todos los campos de texto en Supabase
  const handleGuardarExpediente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      setGuardandoDatos(true);

      const { error: errorUpdate } = await supabase
        .from("perfiles")
        .update({
          nombres: editForm.nombres,
          apellido_paterno: editForm.apellidoPaterno,
          apellido_materno: editForm.apellidoMaterno || null,
          telefono_personal: editForm.telefonoPersonal,
          telefono_corporativo: editForm.telefonoCorporativo || null,
          direccion: editForm.direccion || null,
          referencia: editForm.referenciaNombre || null,
          parentezco: editForm.parentezco || null,
          telefono_referencia: editForm.telefonoReferencia || null,
          telefono_referencia_dos: editForm.telefonoReferenciaDos || null,
        })
        .eq("id", user.id);

      if (errorUpdate) throw errorUpdate;

      // Notificación integrada de Tailwind que reemplaza al alert() feo
      setBannerAlert({
        type: "success",
        text: "¡Expediente actualizado con éxito en la base de datos!",
      });
      setTimeout(() => setBannerAlert(null), 4000);

      await cargarPerfilCompleto();
    } catch (err: any) {
      console.error("Error al actualizar expediente:", err);
      setBannerAlert({
        type: "error",
        text: err.message || "Ocurrió un error al guardar los cambios.",
      });
      setTimeout(() => setBannerAlert(null), 4000);
    } finally {
      setGuardandoDatos(false);
    }
  };

  // 🧮 FUNCIÓN: Calcula la antigüedad exacta desglosada
  const calcularAntiguedad = (fechaIngresoStr: string | null) => {
    if (!fechaIngresoStr) return "Sin registrar";
    const ingreso = new Date(fechaIngresoStr);
    const hoy = new Date();

    let anios = hoy.getFullYear() - ingreso.getFullYear();
    let meses = hoy.getMonth() - ingreso.getMonth();
    let dias = hoy.getDate() - ingreso.getDate();

    if (dias < 0) {
      meses--;
      const ultimoDiaMesAnterior = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        0,
      ).getDate();
      dias += ultimoDiaMesAnterior;
    }
    if (meses < 0) {
      anios--;
      meses += 12;
    }

    if (anios === 0 && meses === 0) return `${dias} días`;
    if (anios === 0) return `${meses} meses y ${dias} días`;
    return `${anios} años, ${meses} meses y ${dias} días`;
  };

  const formatearFecha = (fechaStr: string | null) => {
    if (!fechaStr) return "No registrada";
    return new Date(fechaStr).toLocaleDateString("es-BO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-zinc-400 text-xs font-semibold gap-2">
        <Loader2 className="size-4 animate-spin text-blue-500" />
        <span>Sincronizando expediente del asesor comercial...</span>
      </div>
    );
  }

  if (error || !perfil) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl text-xs font-semibold text-center flex items-center justify-center gap-2">
        <AlertCircle className="size-4" />
        <span>
          {error ||
            "Ocurrió un error inesperado al mapear los datos relacionales."}
        </span>
      </div>
    );
  }

  const fotoPerfilSrc =
    perfil.avatar_url ||
    "https://ltivmoqjhoxfmlbplkee.supabase.co/storage/v1/object/public/avatares/usuario.webp";
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in relative">
      {/* 🌟 BANNER DE NOTIFICACIÓN ELEGANTE INTEGRADO */}
      {bannerAlert && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl text-xs font-black shadow-2xl border flex items-center gap-3 animate-fade-in ${
            bannerAlert.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-950/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-950/20"
          }`}
        >
          {bannerAlert.type === "success" ? (
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="size-4 text-rose-400 shrink-0" />
          )}
          <span>{bannerAlert.text}</span>
        </div>
      )}

      {/* BOTÓN REGRESAR */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-blue-400 transition-colors mb-6 group cursor-pointer"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        <span>Volver al Catálogo</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: TARJETA EMPRESARIAL / CAPA VISUAL */}
        <div className="lg:col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          {/* FOTO DE PERFIL MÁS GRANDE (SIZE-24 INTERACTIVA) */}
          <div className="relative size-24 rounded-full mx-auto border-2 border-blue-500/40 shadow-xl overflow-hidden group bg-zinc-950 flex items-center justify-center">
            {subiendoFoto ? (
              <div className="flex flex-col items-center justify-center gap-1 text-zinc-400">
                <Loader2 className="size-5 animate-spin text-blue-500" />
                <span className="text-[8px] font-bold uppercase tracking-wider">
                  Subiendo...
                </span>
              </div>
            ) : (
              <>
                <img
                  src={fotoPerfilSrc}
                  alt={perfil.nombres}
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer text-white">
                  <Camera className="size-4 text-blue-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider">
                    Cambiar
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCambiarFoto}
                    disabled={subiendoFoto}
                  />
                </label>
              </>
            )}
          </div>

          <div>
            <h2 className="text-base font-black text-zinc-100 tracking-tight">
              {perfil.nombres} {perfil.apellido_paterno}
            </h2>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">
              {perfil.cargos?.nombre_cargo || "Asesor Inmobiliario"}
            </p>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
              {user?.email}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-zinc-950 text-zinc-400 border-zinc-800 uppercase tracking-wider flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {perfil.estado}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 bg-rose-500/10 text-rose-400 border-rose-500/20">
              <Shield className="size-3" />
              {perfil.rol}
            </span>
          </div>

          {/* FICHA TÉCNICA DE INFRAESTRUCTURA DE SUCURSAL */}
          <div className="border-t border-zinc-800/80 pt-4 text-left space-y-3">
            <div className="flex gap-2.5 items-start text-xs">
              <MapPin className="size-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                  Sucursal Corporativa
                </p>
                <p className="text-zinc-200 font-bold mt-0.5">
                  {perfil.sucursales?.nombre_sucursal || "No asignada"}
                </p>
                <p className="text-[10px] text-zinc-400 font-medium mt-0.5 leading-relaxed">
                  {perfil.sucursales?.direccion}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 items-start text-xs">
              <Calendar className="size-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-wider">
                  Fecha de Ingreso
                </p>
                <p className="text-zinc-200 font-semibold mt-0.5">
                  {formatearFecha(perfil.fecha_ingreso)}
                </p>
              </div>
            </div>

            {/* ANTIGÜEDAD DINÁMICA CALCULADA */}
            <div className="flex gap-2.5 items-start text-xs bg-zinc-950/40 p-2.5 border border-zinc-800/60 rounded-xl">
              <Award className="size-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-wider">
                  Antigüedad en la Empresa
                </p>
                <p className="text-zinc-200 font-black text-[11px] mt-0.5">
                  {calcularAntiguedad(perfil.fecha_ingreso)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: EXPEDIENTE COMPLETO FORMULARIO PREPARADO PARA EDITAR */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
          <header className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-zinc-100 tracking-tight">
                Expediente del Agente
              </h3>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Modifica tus datos personales sin restricciones operativas
              </p>
            </div>
          </header>

          <form className="space-y-6" onSubmit={handleGuardarExpediente}>
            {/* SECCIÓN A: IDENTIDAD */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest">
                A. Datos de Identidad Básica
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Nombres
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.nombres}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nombres: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors placeholder-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Apellido Paterno
                  </label>
                  <input
                    required
                    type="text"
                    value={editForm.apellidoPaterno}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        apellidoPaterno: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors placeholder-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Apellido Materno
                  </label>
                  <input
                    type="text"
                    value={editForm.apellidoMaterno}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        apellidoMaterno: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors placeholder-zinc-700"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN B: LOCALIZACIÓN Y MÓVILES */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-widest">
                B. Contacto y Localización Domiciliaria
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Teléfono Móvil Personal
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600" />
                    <input
                      required
                      type="tel"
                      value={editForm.telefonoPersonal}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          telefonoPersonal: e.target.value,
                        })
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors placeholder-zinc-700"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Dirección de Domicilio Actual
                  </label>
                  <div className="relative">
                    <Home className="absolute left-3 top-2.5 size-3.5 text-zinc-600" />
                    <textarea
                      value={editForm.direccion}
                      onChange={(e) =>
                        setEditForm({ ...editForm, direccion: e.target.value })
                      }
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors resize-none leading-relaxed placeholder-zinc-700"
                      placeholder="Calle, Nro, Zona"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN C: CONTACTO DE EMERGENCIA COHESIONADO */}
            <div className="space-y-3 bg-zinc-950/30 p-4 border border-zinc-800/80 rounded-xl">
              <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                C. Contacto Referencial / Caso de Emergencia
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Nombre Completo del Contacto
                  </label>
                  <input
                    type="text"
                    value={editForm.referenciaNombre}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        referenciaNombre: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors placeholder-zinc-700"
                    placeholder="Nombre de tu referencia"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Parentesco Vinculado
                  </label>
                  <input
                    type="text"
                    value={editForm.parentezco}
                    onChange={(e) =>
                      setEditForm({ ...editForm, parentezco: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors placeholder-zinc-700"
                    placeholder="Cónyuge, Padre, Hermano..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Teléfono Primario Emergencia
                  </label>
                  <input
                    type="tel"
                    value={editForm.telefonoReferencia}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        telefonoReferencia: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors placeholder-zinc-700"
                    placeholder="70000000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                    Teléfono Alternativo Emergencia
                  </label>
                  <input
                    type="tel"
                    value={editForm.telefonoReferenciaDos}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        telefonoReferenciaDos: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 transition-colors placeholder-zinc-700"
                    placeholder="2200000"
                  />
                </div>
              </div>
            </div>

            {/* BOTÓN CON CONTROL DE SUBIDA PERSISTENTE */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={guardandoDatos || subiendoFoto}
                className="w-full sm:w-auto cursor-pointer bg-zinc-800 hover:bg-blue-600 disabled:bg-zinc-800/50 border border-zinc-700 hover:border-blue-500 disabled:border-zinc-800 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all duration-200 active:scale-95 shadow-md flex items-center justify-center gap-2"
              >
                {guardandoDatos ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Guardando expediente...</span>
                  </>
                ) : (
                  <span>Guardar Cambios del Expediente</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
