import React, { useState } from "react";
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
  Camera, // Importamos el icono para el selector multimedia
} from "lucide-react";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Estados del Formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefonoPersonal, setTelefonoPersonal] = useState("");
  const [departamento, setDepartamento] = useState("");

  // NUEVO ESTADO: Guarda el archivo de imagen de perfil seleccionado
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        // --- PROCESO DE INICIO DE SESIÓN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage({ type: "success", text: "¡Sesión iniciada con éxito!" });
      } else {
        // --- PROCESO DE REGISTRO PÚBLICO OPCIONAL EN IMÁGENES ---
        let urlPublicaAvatar = null;

        // 1. Si el usuario SELECCIONÓ una fotografía, la subimos a la nube
        if (avatarFile) {
          // Creamos un nombre único limpio basado en milisegundos para evitar que se pisen los archivos
          const extensionArchivo = avatarFile.name.split(".").pop();
          const nombreUnico = `${Date.now()}_avatar.${extensionArchivo}`;

          const { error: errorSubida } = await supabase.storage
            .from("avatares")
            .upload(nombreUnico, avatarFile);

          if (errorSubida) throw errorSubida;

          // Extraemos la URL pública del archivo recién guardado en Supabase Storage
          const { data: dataUrl } = supabase.storage
            .from("avatares")
            .getPublicUrl(nombreUnico);

          urlPublicaAvatar = dataUrl.publicUrl;
        }

        // 2. Ejecutamos el registro inyectando la URL (ya sea el string o null) en los metadatos
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nombres,
              apellido_paterno: apellidoPaterno,
              fecha_nacimiento: fechaNacimiento,
              telefono_personal: telefonoPersonal,
              departamento,
              avatar_url: urlPublicaAvatar, // Se mapeará automáticamente mediante el trigger
            },
          },
        });

        if (error) throw error;

        setMessage({
          type: "success",
          text: "¡Registro exitoso! Por favor, revisa tu correo electrónico para confirmar tu cuenta.",
        });

        // Limpiamos el archivo temporal
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

        {/* MENSAJES DE ÉXITO O ERROR */}
        {message && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold mb-4 border ${
              message.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border-rose-500/20"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CAMPOS ADICIONALES (SOLO PARA REGISTRO) */}
          {!isLogin && (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
              {/* NUEVO INPUT: Fotografía de Perfil Opcional */}
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-hidden focus:border-blue-500 transition-colors"
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

              {/* Departamento */}
              <div>
                <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Departamento
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                  <select
                    required
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-xs text-zinc-100 focus:outline-hidden focus:border-blue-500 transition-colors appearance-none cursor-pointer"
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
