import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Shield,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RegistrarAgente() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados del Formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"user" | "admin">("user");
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefonoPersonal, setTelefonoPersonal] = useState("");
  const [telefonoCorporativo, setTelefonoCorporativo] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [direccion, setDireccion] = useState("");
  const [referencia, setReferencia] = useState("");
  const [parentezco, setParentezco] = useState("");
  const [telefonoReferencia, setTelefonoReferencia] = useState("");
  const [telefonoReferenciaDos, setTelefonoReferenciaDos] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Crear el usuario en el Auth de Supabase (Pasándole el ROL en los metadatos al Trigger)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            rol,
            nombres,
            apellido_paterno: apellidoPaterno,
            fecha_nacimiento: fechaNacimiento,
            telefono_personal: telefonoPersonal,
            departamento,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user)
        throw new Error(
          "No se pudo obtener la información del usuario creado.",
        );

      // 2. Actualizar el perfil recién creado por el Trigger con el resto de datos extendidos y el ROL elegido
      const { error: perfilError } = await supabase
        .from("perfiles")
        .update({
          rol,
          apellido_materno: apellidoMaterno || null,
          telefono_corporativo: telefonoCorporativo || null,
          direccion: direccion || null,
          referencia: referencia || null,
          parentezco: parentezco || null,
          telefono_referencia: telefonoReferencia || null,
          telefono_referencia_dos: telefonoReferenciaDos || null,
          fecha_ingreso: fechaIngreso
            ? fechaIngreso
            : new Date().toISOString().split("T")[0],
        })
        .eq("id", authData.user.id);

      if (perfilError) throw perfilError;

      setMessage({
        type: "success",
        text: `¡Agente registrado con éxito con el rol de ${rol.toUpperCase()}! Se ha enviado un correo de confirmación a su cuenta.`,
      });

      // Limpiar Formulario
      resetearestados();
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Ocurrió un error al registrar al agente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetearestados = () => {
    setEmail("");
    setPassword("");
    setRol("user");
    setNombres("");
    setApellidoPaterno("");
    setApellidoMaterno("");
    setFechaNacimiento("");
    setTelefonoPersonal("");
    setTelefonoCorporativo("");
    setDepartamento("");
    setDireccion("");
    setReferencia("");
    setParentezco("");
    setTelefonoReferencia("");
    setTelefonoReferenciaDos("");
    setFechaIngreso("");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* ENCABEZADO Y VOLVER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-blue-400 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al Inicio</span>
        </Link>
        <div className="text-left sm:text-right">
          <h2 className="text-xl font-black text-zinc-100 tracking-tight">
            Panel de Administración
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Módulo de Alta y Control de Asesores Comerciales
          </p>
        </div>
      </div>

      {/* MENSAGES DE ÉXITO O ERROR */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold mb-6 border flex items-start gap-3 ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{message.text}</span>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6"
      >
        {/* SECCIÓN 1: CREDENCIALES DE ACCESO */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
            1. Credenciales de la Cuenta
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Correo Institucional / Personal
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                  placeholder="agente@inmobiliaria.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Contraseña Temporal
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Rol del Sistema
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <select
                  required
                  value={rol}
                  onChange={(e) => setRol(e.target.value as "user" | "admin")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="user">
                    User (Agente Inmobiliario Regular)
                  </option>
                  <option value="admin">Admin (Administrador Total)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* SECCIÓN 2: DATOS PERSONALES */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
            2. Información del Asesor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Nombres
              </label>
              <input
                required
                type="text"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="Carlos René"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Apellido Paterno
              </label>
              <input
                required
                type="text"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="Mendoza"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Apellido Materno (Opcional)
              </label>
              <input
                type="text"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="Arce"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Fecha de Nacimiento
              </label>
              <input
                required
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Departamento Sede
              </label>
              <select
                required
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Selecciona un departamento
                </option>
                <option value="La Paz">La Paz</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
                <option value="Tarija">Tarija</option>
                <option value="Chuquisaca">Chuquisaca</option>
                <option value="Beni">Beni</option>
                <option value="Pando">Pando</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Fecha de Ingreso Corporativo
              </label>
              <input
                type="date"
                value={fechaIngreso}
                onChange={(e) => setFechaIngreso(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Dirección de Domicilio (Opcional)
              </label>
              <input
                type="text"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="Av. Principal Nro. 450, Zona Central"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Puntos de Referencia Zona (Opcional)
              </label>
              <input
                type="text"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="Frente al Banco Unión, Portón Azul"
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: CONTACTO Y DE EMERGENCIA */}
        <div className="space-y-4">
          <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
            3. Números Telefónicos y Contactos Referenciales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Teléfono Móvil Personal
              </label>
              <input
                required
                type="tel"
                value={telefonoPersonal}
                onChange={(e) => setTelefonoPersonal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="71584620"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Teléfono Corporativo / Interno (Opcional)
              </label>
              <input
                type="tel"
                value={telefonoCorporativo}
                onChange={(e) => setTelefonoCorporativo(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="2240555"
              />
            </div>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-800/80 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Parentesco del Contacto
              </label>
              <input
                type="text"
                value={parentezco}
                onChange={(e) => setParentezco(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                placeholder="Cónyuge, Padre, Hermano"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Teléfono Referencia Primario
              </label>
              <input
                type="tel"
                value={telefonoReferencia}
                onChange={(e) => setTelefonoReferencia(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                placeholder="70125488"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Teléfono Referencia Secundario
              </label>
              <input
                type="tel"
                value={telefonoReferenciaDos}
                onChange={(e) => setTelefonoReferenciaDos(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500"
                placeholder="2284100"
              />
            </div>
          </div>
        </div>

        {/* BOTÓN SUBMIT */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white text-xs font-bold py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Registrando e inyectando rol de seguridad...</span>
              </>
            ) : (
              <>
                <Briefcase className="size-4" />
                <span>Dar de Alta y Guardar Registro de Agente</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
