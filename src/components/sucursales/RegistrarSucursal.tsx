import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { Building2, MapPin, ArrowLeft, Save, Loader2 } from "lucide-react";
import { notificationTemplates } from "../../utils/notificationTemplates";

const DEPARTAMENTOS_BOLIVIA = [
  "La Paz",
  "Santa Cruz",
  "Cochabamba",
  "Tarija",
  "Oruro",
  "Potosí",
  "Chuquisaca",
  "Beni",
  "Pando",
];

export default function RegistrarSucursal() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_sucursal: "",
    departamento: "La Paz",
    direccion: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje("");

    if (!formData.nombre_sucursal.trim() || !formData.direccion.trim()) {
      setErrorMensaje("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      setLoading(true);

      // 1. Insertar la sucursal en Supabase con estado "Activo" por defecto
      const { error } = await supabase.from("sucursales").insert([
        {
          nombre_sucursal: formData.nombre_sucursal.trim(),
          departamento: formData.departamento,
          direccion: formData.direccion.trim(),
          estado: "Activo",
        },
      ]);

      if (error) {
        if (error.code === "23505") {
          throw new Error("Ya existe una sucursal registrada con ese nombre.");
        }
        throw error;
      }

      // 2. 🔔 NOTIFICAR A TODOS LOS USUARIOS DEL SISTEMA EN TIEMPO REAL
      try {
        const template = notificationTemplates.nuevaSucursal(
          formData.nombre_sucursal.trim(),
          "Registro de oficina regional",
          formData.departamento,
        );

        const { data: perfiles, error: perfilesError } = await supabase
          .from("perfiles")
          .select("id");

        if (perfilesError) throw perfilesError;

        if (perfiles && perfiles.length > 0) {
          const notificacionesNuevas = perfiles.map((perfil) => ({
            perfil_id: perfil.id,
            tipo: template.tipo, // "sucursal"
            titulo: template.titulo,
            mensaje: template.mensaje,
            leido: false,
          }));

          const { error: insertNotifError } = await supabase
            .from("notificaciones")
            .insert(notificacionesNuevas);

          if (insertNotifError) {
            console.error(
              "Error al insertar notificaciones masivas:",
              insertNotifError,
            );
          }
        }
      } catch (notifErr) {
        console.error("Error al enviar las notificaciones globales:", notifErr);
      }

      // Redirigir de vuelta a la lista de sucursales
      navigate("/lista-sucursales");
    } catch (err: any) {
      console.error("Error al registrar sucursal:", err);
      setErrorMensaje(
        err.message || "Ocurrió un error al registrar la sucursal.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Cabecera con botón de retorno */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 transition-all cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Registrar Nueva Sucursal
          </h1>
        </div>
      </div>

      {/* Tarjeta del formulario */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        {errorMensaje && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {errorMensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre de la Sucursal */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Nombre de la Sucursal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input
                  type="text"
                  name="nombre_sucursal"
                  value={formData.nombre_sucursal}
                  onChange={handleChange}
                  placeholder="Ej. Sucursal Calacoto"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Departamento <span className="text-red-500">*</span>
              </label>
              <select
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-white text-sm focus:outline-none focus:border-blue-500 transition-all cursor-pointer"
              >
                {DEPARTAMENTOS_BOLIVIA.map((dept) => (
                  <option
                    key={dept}
                    value={dept}
                    className="bg-zinc-900 text-white"
                  >
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Dirección */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Dirección <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleChange}
                  placeholder="Ej. Av. Montenegro #1234"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800/50 border border-zinc-700/60 text-white text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Guardar Sucursal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
