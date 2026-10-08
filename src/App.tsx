import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PropertyCard from "./components/PropertyCard";
import PropertyDetail from "./components/PropertyDetail";
import { propiedadesIniciales } from "./data/propiedadesData";

// Componente secundario para organizar el Catálogo Principal
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

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <Routes>
          {/* Ruta para el Catálogo principal */}
          <Route path="/" element={<HomeCatalog />} />
          {/* Ruta Dinámica usando el parámetro :id */}
          <Route path="/propiedad/:id" element={<PropertyDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
