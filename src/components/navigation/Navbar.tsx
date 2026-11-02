// src/components/navigation/Navbar.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useTheme } from "../../context/ThemeContext";
import {
  Menu,
  Moon,
  X,
  LogOut,
  Settings,
  Key,
  Sun,
  Building2,
} from "lucide-react";
import { SidebarMenu } from "./SidebarMenu";
import { NotificationDropdown } from "./NotificationDropdown";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { rol, user, signOut } = useAuth();

  // Estados locales para despliegue de menús y datos de configuración
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [isBellDropdownOpen, setIsBellDropdownOpen] = useState<boolean>(false);

  const [empresaNombre, setEmpresaNombre] = useState<string>("AppInmo");
  const [empresaLogo, setEmpresaLogo] = useState<string | null>(null);

  // Consultar la configuración global (Nombre y Logo) al montar
  useEffect(() => {
    async function fetchConfiguracionNavbar() {
      try {
        const { data, error } = await supabase
          .from("configuracion")
          .select("nombre_empresa, logo_url")
          .eq("id", 1)
          .single();

        if (!error && data) {
          if (data.nombre_empresa) setEmpresaNombre(data.nombre_empresa);
          if (data.logo_url) setEmpresaLogo(data.logo_url);
        }
      } catch (err) {
        console.error("Error al cargar la configuración en el Navbar:", err);
      }
    }
    fetchConfiguracionNavbar();
  }, []);

  // Identidades multimedia con fallback seguro hacia el Storage
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  const nombreUsuario = user?.user_metadata?.nombres || "Agente";
  const fotoPerfilSrc = avatarUrl
    ? avatarUrl
    : "https://ltivmoqjhoxfmlbplkee.supabase.co/storage/v1/object/public/avatares/usuario.webp";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-white dark:bg-zinc-950 text-(--color-primary) select-none transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
        {/* SECCIÓN IZQUIERDA: Botón de Menú Hamburguesa */}
        <div className="flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* SECCIÓN CENTRAL: Logo dinámico de Supabase para ir al Home */}
        <div className="flex items-center justify-center">
          <Link
            to={
              rol === "admin"
                ? "/dashboard"
                : rol === "user"
                  ? "/propiedades"
                  : "/"
            }
            className="p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all transform active:scale-95 cursor-pointer flex items-center gap-2"
            title="Ir al inicio"
          >
            {empresaLogo ? (
              <img
                src={empresaLogo}
                alt="Logo Empresa"
                className="w-8 h-8 object-contain rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-(--color-primary)/10 text-(--color-primary) flex items-center justify-center">
                <Building2 className="size-5" />
              </div>
            )}
          </Link>
        </div>

        {/* SECCIÓN DERECHA: Utilidades, Notificaciones y Perfil */}
        <div className="flex items-center gap-2">
          <NotificationDropdown
            userId={user?.id}
            isOpen={isBellDropdownOpen}
            onToggle={() => setIsBellDropdownOpen(!isBellDropdownOpen)}
            onCloseOthers={() => setIsUserDropdownOpen(false)}
          />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-(--color-darkmode) hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            title="Cambiar modo claro/oscuro"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Menú Dropdown de Perfil de Usuario */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserDropdownOpen(!isUserDropdownOpen);
                setIsBellDropdownOpen(false);
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
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-zinc-400" />
                    <span>Cambiar Contraseña</span>
                  </a>
                  <hr className="border-zinc-700 my-1" />
                  <button
                    onClick={async () => {
                      setIsUserDropdownOpen(false);
                      await signOut();
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-zinc-700/50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Menú Lateral Desplegable con el nombre de la empresa */}
      <SidebarMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        rol={rol}
        nombreEmpresa={empresaNombre}
      />
    </nav>
  );
}
