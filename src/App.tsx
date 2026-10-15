import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { supabase } from "./lib/supabaseClient"; // Ajusta esta ruta a tu cliente de Supabase
import Navbar from "./components/Navbar";
import PropertyCard from "./components/PropertyCard";
import PropertyDetail from "./components/PropertyDetail";
import MiPerfil from "./components/MiPerfil";
import RegistrarAgente from "./components/RegistrarAgente";
import RutaAdmin from "./components/RutaAdmin";
import AuthForm from "./components/AuthForm";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

// Componente del Catálogo Principal Conectado a Supabase
function HomeCatalog() {
  const [propiedades, setPropiedades] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function obtenerPropiedades() {
      try {
        setLoading(true);
        
        // Consultamos solo los campos básicos universales que necesitas mostrar ahora
        const { data, error } = await supabase
          .from("propiedades")
          .select(`
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
          `)
          .eq("estado", "Disponible");

        if (error) throw error;

        // Adaptamos los nombres de las columnas de Supabase a lo que tu PropertyCard espera recibir
        const propiedadesAdaptadas = data.map((p: any) => ({
          id: p.id,
          titulo: p.titulo,
          modalidad: p.modalidad,
          tipo: p.tipos_propiedad?.nombre || "Inmueble",
          zona: p.zona,
          // Pasamos temporalmente la superficie total en m² al campo dormitorios para renderizar sin errores
          dormitorios: Math.round(p.superficie_total), 
          precio: `${p.moneda === "USD" ? "$us" : "Bs"} ${Number(p.precio).toLocaleString("es-BO")}`,
          imagenes: p.imagenes || [],
          agente: {
            nombre: `${p.agente?.nombres} ${p.agente?.apellido_paterno || ""}`,
            avatar: `https://dicebear.com{p.agente?.nombres || "A"}`, // Iniciales como avatar temporal
            telefono: "59100000000"
          }
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-zinc-400 text-xs font-semibold gap-2">
        <Loader2 className="size-4 animate-spin text-blue-500" />
        <span>Cargando catálogo inmobiliaria...</span>
      </div>
    );
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-zinc-100 sm:text-3xl">
          Propiedades Destacadas
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Encuentra tu próximo espacio ideal en las mejores zonas de Bolivia de forma real.
        </p>
      </header>
      
      {propiedades.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-xs font-medium">
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

// Contenedor de la estructura interna y enrutador controlado (Se mantiene intacto)
function AppContenido() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 text-xs font-semibold">
        Cargando aplicación...
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeCatalog />} />
          <Route path="/propiedad/:id" element={<PropertyDetail />} />
          <Route path="/perfil" element={<MiPerfil />} />
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
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContenido />
    </AuthProvider>
  );
}
