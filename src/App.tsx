import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PropertyCard from "./components/PropertyCard";
import PropertyDetail from "./components/PropertyDetail";
import MiPerfil from "./components/MiPerfil";
import RegistrarAgente from "./components/RegistrarAgente";
import RutaAdmin from "./components/RutaAdmin"; // IMPORTAMOS EL ESCUDO PROTECTOR
import { propiedadesIniciales } from "./data/propiedadesData";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthForm from "./components/AuthForm";

function HomeCatalog() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 text-center sm:text-left">
        <h2 className="text-2xl font-extrabold text-zinc-100 sm:text-3xl">
          Propiedades Destacadas
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Encuentra tu próximo espacio ideal en las mejores zonas de Bolivia.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
        {propiedadesIniciales.map((p) => (
          <PropertyCard key={p.id} propiedad={p} />
        ))}
      </div>
    </main>
  );
}

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

          {/* RUTA PROTEGIDA CON EL ESCUDO ENVOLTORIO */}
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
