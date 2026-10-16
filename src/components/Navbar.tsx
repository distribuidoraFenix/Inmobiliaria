import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import {
  Menu,
  Home,
  Bell,
  Moon,
  X,
  LogOut,
  Settings,
  Key,
  Check,
} from "lucide-react";

interface EnlaceNavegacion {
  tipo: "seccion" | "enlace";
  label: string;
  to?: string;
  href?: string;
  color?: string;
  soloAdmin?: boolean;
}

// Estructura de tus rutas del menú lateral con soporte de roles corporativos
const itemsMenuLateral: EnlaceNavegacion[] = [
  {
    tipo: "seccion",
    label: "Registros",
    color: "text-blue-500 border-b border-t border-zinc-800 pt-2 pb-2 mb-2",
  },
  {
    tipo: "seccion",
    label: "Propiedades",
    color: "text-green-500 border-b border-zinc-800 mb-2",
  },
  {
    tipo: "enlace",
    label: "Registrar Propiedad",
    href: "#propiedades",
    soloAdmin: false,
  },
  {
    tipo: "enlace",
    label: "Lista de propiedades",
    href: "#listapropiedades",
    soloAdmin: true,
  },
  {
    tipo: "seccion",
    label: "Agentes",
    color: "text-green-500 border-b border-zinc-800 mb-2",
    soloAdmin: true,
  },
  {
    tipo: "enlace",
    label: "Registrar Agentes",
    to: "/registrar-agente",
    soloAdmin: true,
  },
  {
    tipo: "enlace",
    label: "Lista de agentes",
    href: "#listaagentes",
    soloAdmin: true,
  },
  {
    tipo: "seccion",
    label: "Proyectos / Desarrollos",
    color: "text-green-500 border-b border-zinc-800 mb-2",
    soloAdmin: true,
  },
  {
    tipo: "enlace",
    label: "Registrar Proyecto",
    href: "#registrar-proyecto",
    soloAdmin: true,
  },
  {
    tipo: "enlace",
    label: "Lista de proyectos",
    href: "#listaproyectos",
    soloAdmin: true,
  },
];

export default function Navbar() {
  const { logout, rol, user } = useAuth();

  // Estados para controlar el despliegue de menús
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState<boolean>(false);

  // Estados para el control dinámico de alertas e historial
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [tieneNuevas, setTieneNuevas] = useState<boolean>(false);

  // 1. EFECTO CON DOBLE VALIDACIÓN: Cero fallos al presionar F5
  useEffect(() => {
    if (!user?.id) return;

    async function cargarModuloNotificaciones() {
      try {
        // ACCIÓN A: Traer el historial compacto de las últimas 7 alertas para el menú visual
        const { data: historial, error: errHistorial } = await supabase
          .from("notificaciones")
          .select("*")
          .eq("perfil_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(7);

        if (errHistorial) throw errHistorial;
        setNotificaciones(historial || []);

        // ACCIÓN B: Consulta controlada estricta para el punto verde
        const { data: noLeidas, error: errConteo } = await supabase
          .from("notificaciones")
          .select("id")
          .eq("perfil_id", user?.id)
          .eq("leido", false)
          .limit(1);

        if (errConteo) throw errConteo;

        // Se enciende únicamente si en la BD queda algún registro real sin leer
        setTieneNuevas(noLeidas && noLeidas.length > 0);
      } catch (err) {
        console.error("Error en el control de refrescamiento de alertas:", err);
      }
    }

    cargarModuloNotificaciones();
  }, [user?.id]);

  // 2. FUNCIÓN DE LECTURA BLINDADA POR TÍTULO: Mata duplicaciones invisibles de raíz
  const marcarComoLeida = async (id: number) => {
    try {
      if (!user?.id) return;

      const { error } = await supabase
        .from("notificaciones")
        .update({ leido: true })
        .eq("id", id)
        .eq("perfil_id", user?.id);

      if (error) throw error;

      // Sincronizamos la interfaz local en caliente de forma inmediata
      setNotificaciones((prev) => {
        const nuevoArreglo = prev.map((n) =>
          n.id === id ? { ...n, leido: true } : n,
        );
        // Reevalúa si queda algún mensaje real con leido = false en la lista
        const quedanPendientes = nuevoArreglo.some((n) => !n.leido);
        setTieneNuevas(quedanPendientes);
        return nuevoArreglo;
      });
    } catch (err) {
      console.error("Error al actualizar la notificación individual:", err);
    }
  };

  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false);
      await logout();
    } catch (error) {
      console.error("Error al intentar cerrar sesión:", error);
    }
  };

  // Identidades multimedia con fallback hacia tu .webp del Storage
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const nombreUsuario = user?.user_metadata?.nombres || "Agente";
  const fotoPerfilSrc = avatarUrl
    ? avatarUrl
    : "https://ltivmoqjhoxfmlbplkee.supabase.co/storage/v1/object/public/avatares/usuario.webp";
  return (
    <nav className="sticky top-0 z-50 w-full bg-zinc-900 border-b border-zinc-800 text-white select-none">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* SECCIÓN IZQUIERDA: Menú Hamburguesa */}
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* SECCIÓN CENTRAL: Botón de Inicio */}
        <div className="flex items-center justify-center">
          <Link
            to="/"
            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-zinc-800 transition-all transform active:scale-95 cursor-pointer"
          >
            <Home className="w-6 h-6" />
          </Link>
        </div>

        {/* SECCIÓN DERECHA: Utilidades y Perfil */}
        <div className="flex items-center gap-2">
          {/* 🔔 BOTÓN DINÁMICO DE LA CAMPANA CON DROPDOWN INTERNO */}
          <div className="relative">
            <button
              onClick={() => {
                setIsBellDropdownOpen(!isBellDropdownOpen);
                setIsUserDropdownOpen(false); // Limpieza visual
              }}
              className={`p-2 rounded-lg transition-colors relative cursor-pointer ${
                isBellDropdownOpen
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              aria-label="Ver notificaciones"
            >
              <Bell className="w-5 h-5" />
              {/* Alerta verde vibrante si hay notificaciones sin leer */}
              {tieneNuevas && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-zinc-900 animate-pulse"></span>
              )}
            </button>

            {/* Dropdown flotante de Mensajes y Alertas */}
            {isBellDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsBellDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl z-20 overflow-hidden flex flex-col max-h-96 animate-fade-in">
                  <header className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-700 flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-blue-400 tracking-wider">
                      Avisos del Sistema
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold">
                      {notificaciones.length} totales
                    </span>
                  </header>

                  <div className="overflow-y-auto grow scrollbar-thin divide-y divide-zinc-700/50 bg-zinc-800">
                    {notificaciones.length === 0 ? (
                      <p className="text-center py-8 text-zinc-500 text-[11px] font-medium">
                        No tienes alertas ni mensajes nuevos.
                      </p>
                    ) : (
                      notificaciones.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 transition-colors flex gap-2.5 items-start ${!notif.leido ? "bg-zinc-950/20" : ""}`}
                        >
                          <div className="grow min-w-0">
                            <h4
                              className={`text-xs font-bold truncate ${!notif.leido ? "text-zinc-100" : "text-zinc-400"}`}
                            >
                              {notif.titulo}
                            </h4>
                            <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-3 leading-relaxed font-medium whitespace-pre-line">
                              {notif.mensaje}
                            </p>
                            <span className="text-[9px] text-zinc-500 block mt-1 font-semibold">
                              {new Date(notif.created_at).toLocaleDateString(
                                "es-BO",
                              )}
                            </span>
                          </div>
                          {!notif.leido && (
                            <button
                              onClick={() => marcarComoLeida(notif.id)} // Enlace protegido pasando ID y Título
                              className="size-5 rounded-md bg-zinc-900 hover:bg-emerald-600/20 text-zinc-500 hover:text-emerald-400 transition-all flex items-center justify-center shrink-0 cursor-pointer border border-zinc-700 hover:border-emerald-500/30"
                              title="Marcar como leído"
                            >
                              <Check className="size-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer">
            <Moon className="w-5 h-5" />
          </button>

          {/* Menú Dropdown de Perfil de Usuario */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
                setIsBellDropdownOpen(false); // Limpieza visual
              }}
              className={`size-9 rounded-full overflow-hidden border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                isUserDropdownOpen
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <img
                src={fotoPerfilSrc}
                alt={`Miniatura de ${nombreUsuario}`}
                className="w-full h-full object-cover animate-fade-in"
                loading="lazy"
              />
            </button>

            {isUserDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl py-1 z-20 transition-all">
                  <Link
                    to="/perfil"
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Mi Perfil</span>
                  </Link>
                  <a
                    href="#password"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-zinc-400" />
                    <span>Cambiar Contraseña</span>
                  </a>
                  <hr className="border-zinc-700 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-zinc-700/50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* MENÚ LATERAL DESPLEGABLE */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 z-40 p-4 transition-transform flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <span className="font-bold text-lg text-blue-400">Acciones</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 overflow-y-auto grow pr-1 scrollbar-thin">
              {itemsMenuLateral.map((item, index) => {
                if (item.soloAdmin && rol !== "admin") return null;
                const claseComunEnlace =
                  "px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer text-xs font-medium";

                if (item.tipo === "seccion") {
                  return (
                    <p
                      key={index}
                      className={`text-[11px] font-black uppercase tracking-wider ${item.color}`}
                    >
                      {item.label}
                    </p>
                  );
                }

                if (item.to) {
                  return (
                    <Link
                      key={index}
                      to={item.to}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`${claseComunEnlace} block`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return (
                  <a
                    key={index}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={claseComunEnlace}
                  >
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </nav>
  );
}
