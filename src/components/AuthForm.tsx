import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  MapPin,
  Loader2,
  Camera,
} from "lucide-react";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados del Formulario Universales
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefonoPersonal, setTelefonoPersonal] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // CONTROL DE NUEVOS CAMPOS: Declaración explícita para evitar errores de compilación
  const [apellidoMaterno, setApellidoMaterno] = useState<string>("");
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string>("");

  // Cargar de la nube la lista física de sucursales bolivianas
  useEffect(() => {
    if (isLogin) return;

    async function obtenerSucursales() {
      try {
        const { data, error } = await supabase
          .from("sucursales")
          .select("id, nombre_sucursal, departamento")
          .order("nombre_sucursal", { ascending: true });

        if (error) throw error;
        setSucursales(data || []);
      } catch (err) {
        console.error("Error al cargar las sucursales en el login:", err);
      }
    }
    obtenerSucursales();
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // 1. Llamamos a nuestra función de base de datos antes de generar cualquier sesión
        const { data: validacion, error: rpcError } = await supabase.rpc(
          "login_seguro_asesores",
          {
            p_email: email,
            p_password: password,
          },
        );

        if (rpcError) throw rpcError;

        // 2. REBOTE INMEDIATO SIN PARPADEO: Si la base de datos determinó que está inactivo o erróneo, frenamos el flujo aquí
        if (!validacion || validacion.success === false) {
          throw new Error(validacion?.error || "Credenciales inválidas.");
        }

        // 3. SE CREA LA SESIÓN SÓLO SI PASÓ LA VERIFICACIÓN DE ESTADO ACTIVO
        // Al ejecutarse en este orden, el usuario inactivo jamás llega a esta línea y la pantalla no cambia ni parpadea
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;
        setMessage({ type: "success", text: "¡Sesión iniciada con éxito!" });
      } else {
        // --- PROCESO DE REGISTRO PÚBLICO CON NUEVA METADATA ---
        if (!sucursalSeleccionada) {
          throw new Error("Por favor, selecciona una sucursal corporativa.");
        }

        let urlPublicaAvatar = null;

        // Subida opcional multimedia WebP/Imagen (Manteniendo tu gran logro)
        if (avatarFile) {
          const extensionArchivo = avatarFile.name.split(".").pop();
          const nombreUnico = `${Date.now()}_avatar.${extensionArchivo}`;

          const { error: errorSubida } = await supabase.storage
            .from("avatares")
            .upload(nombreUnico, avatarFile);

          if (errorSubida) throw errorSubida;

          const { data: dataUrl } = supabase.storage
            .from("avatares")
            .getPublicUrl(nombreUnico);

          urlPublicaAvatar = dataUrl.publicUrl;
        }

        // Ejecutamos el registro inyectando la sucursal y el apellido materno opcional
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombres,
              rol: "user", // Rol por defecto inicial público
              apellido_paterno: apellidoPaterno,
              apellido_materno: apellidoMaterno || null,
              fecha_nacimiento: fechaNacimiento,
              telefono_personal: telefonoPersonal,
              sucursal_id: sucursalSeleccionada,
              avatar_url: urlPublicaAvatar,
            },
          },
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.",
        });

        setAvatarFile(null);
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Ocurrió un error inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl transition-all duration-300">
        {/* ENCABEZADO */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
            {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {isLogin
              ? "Ingresa tus credenciales para acceder"
              : "Completa tus datos para registrarte"}
          </p>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold mb-4 border animate-fade-in ${
                message.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {message.text}
            </div>
          )}
          {/* CAMPOS ADICIONALES (SOLO PARA REGISTRO) */}
          {!isLogin && (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {/* Fotografía de Perfil Opcional */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Fotografía de Perfil (Opcional)
                </label>
                <div className="relative">
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-20 border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/50 rounded-xl cursor-pointer transition-colors p-2">
                      <div className="flex items-center gap-3">
                        <Camera className="size-5 text-zinc-500" />
                        <div className="text-left">
                          <p className="text-[11px] font-medium text-zinc-300">
                            {avatarFile
                              ? avatarFile.name
                              : "Seleccionar imagen"}
                          </p>
                          <p className="text-[9px] text-zinc-500">
                            JPG, PNG (Máx 2MB)
                          </p>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAvatarFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Nombres */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Nombres
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input
                    required
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Juan Carlos"
                  />
                </div>
              </div>

              {/* Apellido Paterno */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Apellido Paterno
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input
                    required
                    type="text"
                    value={apellidoPaterno}
                    onChange={(e) => setApellidoPaterno(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                    placeholder="Pérez"
                  />
                </div>
              </div>

              {/* NUEVO INPUT: Apellido Materno (Opcional) */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Apellido Materno (Opcional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input
                    type="text"
                    value={apellidoMaterno}
                    onChange={(e) => setApellidoMaterno(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                    placeholder="Arce"
                  />
                </div>
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Fecha de Nacimiento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input
                    required
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Teléfono Personal */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Teléfono Personal
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <input
                    required
                    type="tel"
                    value={telefonoPersonal}
                    onChange={(e) => setTelefonoPersonal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                    placeholder="71234567"
                  />
                </div>
              </div>

              {/* NUEVO INPUT: Selector Dinámico de Sucursales */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Sucursal Asignada
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <select
                    required
                    value={sucursalSeleccionada}
                    onChange={(e) => setSucursalSeleccionada(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="" disabled>
                      Selecciona una sucursal corporativa
                    </option>
                    {sucursales.map((suc) => (
                      <option key={suc.id} value={suc.id}>
                        {suc.nombre_sucursal} ({suc.departamento})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS BASE (PARA LOGIN Y REGISTRO) */}
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-10 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 cursor-pointer bg-zinc-800 hover:bg-blue-600 disabled:bg-zinc-800/50 text-white text-xs font-bold py-2.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-600/10"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isLogin ? (
              "Iniciar Sesión"
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

        {/* CAMBIAR ENTRE LOGIN Y REGISTRO */}
        <div className="text-center mt-6 pt-4 border-t border-zinc-800/60">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
              setAvatarFile(null);
            }}
            className="text-xs text-zinc-400 hover:text-blue-400 font-medium transition-colors cursor-pointer"
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate aquí"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>
    </div>
  );
}
