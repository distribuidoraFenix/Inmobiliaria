import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import Navbar from "./components/Navbar";
import PropertyCard from "./components/PropertyCard";
import PropertyDetail from "./components/PropertyDetail";
import MiPerfil from "./components/MiPerfil";
import RegistrarAgente from "./components/RegistrarAgente";
import RutaAdmin from "./components/RutaAdmin";
import { LoginForm } from "./components/auth/LoginForm"; // Usamos nuestro nuevo login adaptado
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";
import ListaAgentes from "./components/ListaAgentes";
import ListaPropiedades from "./components/ListaPropiedades";
import { APIProvider } from "@vis.gl/react-google-maps";
import RegistroPropiedad from "./components/RegistrarPropiedad";
import TestMessageView from "./components/message/TestMessageView";

// Componente del Catálogo Principal Conectado a Supabase
function HomeCatalog() {
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function obtenerPropiedades() {
      try {
        setLoading(true);

        const { data, error } = await supabase
          .from("propiedades")
          .select(
            `
            id,
            titulo,
            modalidad,
            precio,
            moneda,
            zona,
            superficie_total,
            imagenes,
            tipos_propiedad ( nombre ),
            agente:perfiles ( nombres, apellido_paterno )
          `,
          )
          .eq("estado", "Disponible");

        if (error) throw error;

        const propiedadesAdaptadas = data.map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          modalidad: p.modalidad,
          tipo: p.tipos_propiedad?.nombre || "Inmueble",
          zona: p.zona,
          dormitorios: Math.round(p.superficie_total),
          precio: `${p.moneda === "USD" ? "$us" : "Bs"} ${Number(p.precio).toLocaleString("es-BO")}`,
          imagenes: p.imagenes || [],
          agente: {
            nombre: `${p.agente?.nombres} ${p.agente?.apellido_paterno || ""}`,
            avatar: `https://dicebear.com{p.agente?.nombres || "A"}`,
            telefono: "59100000000",
          },
        }));

        setPropiedades(propiedadesAdaptadas);
      } catch (err) {
        console.error("Error al cargar el catálogo:", err);
      } finally {
        setLoading(false);
      }
    }

    obtenerPropiedades();
  }, []);
  
  useEffect(() => {
    async function actualizarIdentidadNavegador() {
      try {
        const { data, error } = await supabase
          .from("configuracion")
          .select("nombre_empresa, icono_url")
          .eq("id", 1)
          .single();

        if (!error && data) {
          // 1. Cambiar dinámicamente el título de la pestaña del navegador
          if (data.nombre_empresa) {
            document.title = data.nombre_empresa;
          }

          // 2. Cambiar dinámicamente el favicon (icono de la pestaña)
          if (data.icono_url) {
            let link: HTMLLinkElement | null =
              document.querySelector("link[rel*='icon']");
            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.head.appendChild(link);
            }
            link.href = data.icono_url;
          }
        }
      } catch (err) {
        console.error("Error al actualizar la identidad del navegador:", err);
      }
    }

    actualizarIdentidadNavegador();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-(--color-app-text-muted) text-xs font-semibold gap-2">
        <Loader2 className="size-4 animate-spin text-(--color-primary)" />
        <span>Cargando catálogo inmobiliaria...</span>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-(--color-app-text) sm:text-3xl">
          Propiedades Destacadas
        </h2>
        <p className="text-sm text-(--color-app-text-muted) mt-1">
          Encuentra tu próximo espacio ideal en las mejores zonas de Bolivia de
          forma real.
        </p>
      </header>

      {propiedades.length === 0 ? (
        <div className="text-center py-12 text-(--color-app-text-muted) text-xs font-medium">
          No hay propiedades disponibles en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
          {propiedades.map((p) => (
            <PropertyCard key={p.id} propiedad={p} />
          ))}
        </div>
      )}
    </main>
  );
}

// Contenedor de la estructura interna y enrutador controlado
function AppContenido() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-(--color-app-bg) flex items-center justify-center text-(--color-app-text-muted) text-xs font-semibold">
        Cargando aplicación...
      </div>
    );
  }

  // Si no hay usuario autenticado, mostramos nuestro nuevo LoginForm con los modales
  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-(--color-app-bg) text-(--color-app-text) transition-colors duration-300">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeCatalog />} />
        <Route path="/propiedad/:id" element={<PropertyDetail />} />
        <Route path="/perfil" element={<MiPerfil />} />
        <Route path="/lista-agentes" element={<ListaAgentes />} />
        <Route path="/lista-propiedades" element={<ListaPropiedades />} />
        <Route path="/registrar-propiedad" element={<RegistroPropiedad />} />
        <Route path="/test-messages" element={<TestMessageView />} />
        <Route
          path="/registrar-agente"
          element={
            <RutaAdmin>
              <RegistrarAgente />
            </RutaAdmin>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <APIProvider apiKey="AIzaSyAIsUQ5hRb_WVdztoO4bZ_0UlbbFVpwo0Y">
      <BrowserRouter>
        <AuthProvider>
          <AppContenido />
        </AuthProvider>
      </BrowserRouter>
    </APIProvider>
  );
}
