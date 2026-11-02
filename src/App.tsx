import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import Navbar from "./components/navigation/Navbar";
import PropertyDetail from "./components/PropertyDetail";
import MiPerfil from "./components/MiPerfil";
import RegistrarAgente from "./components/RegistrarAgente";
import RutaAdmin from "./components/RutaAdmin";
import { LoginForm } from "./components/auth/LoginForm";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ListaAgentes from "./components/ListaAgentes";
import ListaPropiedades from "./components/ListaPropiedades";
import { APIProvider } from "@vis.gl/react-google-maps";
import RegistroPropiedad from "./components/RegistrarPropiedad";
import TestMessageView from "./components/message/TestMessageView";

// Importaciones de tus componentes reales
import { Dashboard } from "./components/Dashboard";
import { Propiedades } from "./components/Propiedades";

// Contenedor de la estructura interna y enrutador controlado
function AppContenido() {
  const { user, loading } = useAuth();

  // Efecto global para la identidad de la pestaña del navegador basada en Supabase
  useEffect(() => {
    async function actualizarIdentidadNavegador() {
      try {
        const { data, error } = await supabase
          .from("configuracion")
          .select("nombre_empresa, icono_url")
          .eq("id", 1)
          .single();

        if (!error && data) {
          if (data.nombre_empresa) {
            document.title = data.nombre_empresa;
          }

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
      <div className="min-h-screen bg-(--color-app-bg) flex items-center justify-center text-(--color-app-text-muted) text-xs font-semibold">
        Cargando aplicación...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--color-app-bg) text-(--color-app-text) transition-colors duration-300">
      {user && <Navbar />}

      <Routes>
        <Route path="/login" element={<LoginForm />} />

        {/* Ruta raíz redirige o muestra directamente Propiedades */}
        <Route
          path="/"
          element={user ? <Propiedades /> : <Navigate to="/login" replace />}
        />

        {/* Ruta de Dashboard (Administrador) */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <RutaAdmin>
                <Dashboard />
              </RutaAdmin>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta explícita de Propiedades */}
        <Route
          path="/propiedades"
          element={user ? <Propiedades /> : <Navigate to="/login" replace />}
        />

        {/* Rutas Protegidas Generales */}
        <Route
          path="/propiedad/:id"
          element={user ? <PropertyDetail /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/perfil"
          element={user ? <MiPerfil /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/lista-agentes"
          element={user ? <ListaAgentes /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/lista-propiedades"
          element={
            user ? <ListaPropiedades /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/registrar-propiedad"
          element={
            user ? <RegistroPropiedad /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/test-messages"
          element={
            user ? <TestMessageView /> : <Navigate to="/login" replace />
          }
        />

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
