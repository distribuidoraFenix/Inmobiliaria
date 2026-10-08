import { useState } from "react";
import {
  Menu,
  Home,
  Bell,
  Moon,
  User,
  X,
  LogOut,
  Settings,
  Key,
} from "lucide-react";

export default function Navbar() {
  // Estados para controlar la visibilidad de los menús desplegables
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);

  return (
    <nav className="sticky top-0 z-50 w-full bg-zinc-900 border-b border-zinc-800 text-white select-none">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* SECCIÓN IZQUIERDA: Menú Hamburguesa */}
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <a
            href="/"
            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-zinc-800 transition-all transform active:scale-95"
            aria-label="Ir al inicio"
          >
            <Home className="w-6 h-6" />
          </a>
        </div>

        {/* SECCIÓN DERECHA: Notificaciones, Carrito y Usuario */}
        <div className="flex items-center gap-2">
          {/* Campana de Notificaciones */}
          <button
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors relative"
            aria-label="Ver notificaciones"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
          </button>

          {/* Tema oscuro y claro */}
          <button
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors relative"
            aria-label="cambiar de tema claro y oscuro"
          >
            <Moon className="w-5 h-5" />
          </button>

          {/* Perfil de Usuario con Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                isUserDropdownOpen
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
              aria-label="Menú de usuario"
            >
              <User className="w-5 h-5" />
            </button>

            {/* Dropdown flotante de Usuario */}
            {isUserDropdownOpen && (
              <>
                {/* Capa invisible trasera para cerrar el menú al hacer clic afuera */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsUserDropdownOpen(false)}
                />

                <div className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-xl shadow-xl py-1 z-20 transition-all">
                  <a
                    href="#perfil"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span>Mi Perfil</span>
                  </a>
                  <a
                    href="#password"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <Key className="w-4 h-4 text-zinc-400" />
                    <span>Cambiar Contraseña</span>
                  </a>
                  <hr className="border-zinc-700 my-1" />
                  <button
                    onClick={() => alert("Cerrando sesión...")}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-400 hover:bg-zinc-700/50 transition-colors text-left"
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
          {/* Fondo oscuro traslúcido para enfocar el menú */}
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed top-0 left-0 bottom-0 w-64 bg-zinc-950 border-r border-zinc-800 z-40 p-4 transition-transform">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <span className="font-bold text-lg text-blue-400">Acciones</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Opciones del menú móvil */}
            <nav className="flex flex-col gap-1">
              <a
                href="#alquiler"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                Alquiler
              </a>
              <a
                href="#anticretico"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                Anticrético
              </a>
              <a
                href="#venta"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                Venta
              </a>
              <a
                href="#proyectos"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                Pre-venta
              </a>

              <p className="pb-2 pt-2 border-b border-t border-zinc-800 mb-4 text-gray-500">
                Registros
              </p>
              <a
                href="#propiedades"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                Registrar Propiedad
              </a>
              <a
                href="#proyectos"
                className="px-3 py-2 rounded-lg text-zinc-300 hover:bg-zinc-900 hover:text-white transition-colors"
              >
                Registrar Proyecto
              </a>
            </nav>
          </div>
        </>
      )}
    </nav>
  );
}
