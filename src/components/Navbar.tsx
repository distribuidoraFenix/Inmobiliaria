import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Menu, Home, Bell, Moon, X, LogOut, Settings, Key } from "lucide-react";

export default function Navbar() {
  // Extraemos las propiedades necesarias de la sesión global de autenticación
  // Nota: Si tu AuthContext no expone "perfil", usaremos los metadatos del "user"
  const { logout, rol, user } = useAuth();

  // Estados para controlar la visibilidad de los menús desplegables
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false);
      await logout();
    } catch (error) {
      console.error("Error al intentar cerrar sesión:", error);
    }
  };

  // LÓGICA MULTIMEDIA PARA DETERMINAR EL ROSTRO DEL AGENTE CONECTADO
  // Intentamos leer la foto desde los metadatos del usuario de la sesión de Supabase
  const avatarUrl = user?.user_metadata?.avatar_url;
  const nombreUsuario = user?.user_metadata?.nombres || "Agente";

  const fotoPerfilSrc = avatarUrl
    ? avatarUrl
    : `https://dicebear.com{nombreUsuario}`;

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

        {/* SECCIÓN CENTRAL: Icono de Casa Clicable */}
        <div className="flex items-center justify-center">
          <Link
            to="/"
            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-zinc-800 transition-all transform active:scale-95 cursor-pointer"
            aria-label="Ir al inicio"
          >
            <Home className="w-6 h-6" />
          </Link>
        </div>

        {/* SECCIÓN DERECHA: Notificaciones, Tema y Fotografía del Usuario */}
        <div className="flex items-center gap-2">
          {/* Campana de Notificaciones */}
          <button
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors relative cursor-pointer"
            aria-label="Ver notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>

          {/* Tema oscuro y claro */}
          <button
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors relative cursor-pointer"
            aria-label="cambiar de tema claro y oscuro"
          >
            <Moon className="w-5 h-5" />
          </button>

          {/* Perfil de Usuario con Dropdown (REEMPLAZADO EL ICONO POR TU FOTO DE PERFIL) */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className={`size-9 rounded-full overflow-hidden border transition-all flex items-center justify-center cursor-pointer shrink-0 ${
                isUserDropdownOpen
                  ? "border-blue-500 ring-2 ring-blue-500/20"
                  : "border-zinc-700 hover:border-zinc-500"
              }`}
              aria-label="Menú de usuario"
            >
              <img
                src={fotoPerfilSrc}
                alt={`Miniatura de ${nombreUsuario}`}
                className="w-full h-full object-cover animate-fade-in"
                loading="lazy"
              />
            </button>

            {/* Dropdown flotante de Usuario */}
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

      {/* MENÚ LATERAL DESPLEGABLE (Mobile First) */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed top-0 left-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 z-40 p-4 transition-transform">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <span className="font-bold text-lg text-blue-400">Acciones</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              <a
                href="#alquiler"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
              >
                Alquiler
              </a>
              <a
                href="#anticretico"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
              >
                Anticrético
              </a>
              <a
                href="#venta"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
              >
                Venta
              </a>
              <a
                href="#proyectos"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
              >
                Pre-venta
              </a>

              <p className="pb-2 pt-2 border-b border-t border-zinc-800 mb-4 text-gray-500">
                Registros
              </p>

              {(rol === "user" || rol === "admin") && (
                <a
                  href="#propiedades"
                  className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                >
                  Registrar Propiedad
                </a>
              )}

              {rol === "admin" && (
                <>
                  <Link
                    to="/registrar-agente"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer block"
                  >
                    Registrar Agentes
                  </Link>
                  <a
                    href="#registrar-proyecto"
                    className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors cursor-pointer"
                  >
                    Registrar Proyecto
                  </a>
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </nav>
  );
}
