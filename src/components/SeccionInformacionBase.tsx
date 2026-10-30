import React from "react";
import { Home, Navigation } from "lucide-react";
import { Map as GoogleMap, AdvancedMarker } from "@vis.gl/react-google-maps";

interface SeccionInformacionBaseProps {
  rol: string | null;
  user: any;
  codigoPropiedad: string;
  agenteAsignadoId: string;
  setAgenteAsignadoId: (value: string) => void;
  listaAgentes: any[];
  titulo: string;
  setTitulo: (value: string) => void;
  tipoPropiedadId: string;
  handleCambioTipo: (id: string) => void;
  tiposPropiedad: any[];
  modalidad: string;
  setModalidad: (value: string) => void;
  superficieTotal: string;
  setSuperficieTotal: (value: string) => void;
  precio: string;
  setPrecio: (value: string) => void;
  moneda: string;
  setMoneda: (value: string) => void;
  departamento: string;
  handleDepartamentoChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  zona: string;
  setZona: (value: string) => void;
  direccion: string;
  setDireccion: (value: string) => void;
  latitud: number;
  longitud: number;
  setLatitud: (lat: number) => void;
  setLongitud: (lng: number) => void;
  archivosFotos: File[];
  errorMultimedia: string | null;
  handleSeleccionImagenes: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function SeccionInformacionBase({
  rol,
  user,
  agenteAsignadoId,
  setAgenteAsignadoId,
  listaAgentes,
  titulo,
  setTitulo,
  tipoPropiedadId,
  handleCambioTipo,
  tiposPropiedad,
  modalidad,
  setModalidad,
  superficieTotal,
  setSuperficieTotal,
  precio,
  setPrecio,
  moneda,
  setMoneda,
  departamento,
  handleDepartamentoChange,
  zona,
  codigoPropiedad,
  setZona,
  direccion,
  setDireccion,
  latitud,
  longitud,
  setLatitud,
  setLongitud,
  archivosFotos,
  errorMultimedia,
  handleSeleccionImagenes,
}: SeccionInformacionBaseProps) {
  return (
    <div className="bg-(--color-app-card) border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
      <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
        <Home className="size-4" />
        <span>I. Características Principales</span>
      </h3>
      <div className="grid grid-cols-1 gap-4 text-xs">
        {/* SECCION INTERNA AGENTE Y TITULO */}
        <div className="col-span-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* ASIGNACIÓN CONTROLADO POR TIPO DE USUARIO */}
          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Agente - Responsable{" "}
              <span className="text-(--color-alert) font-normal">*</span>
            </label>
            {rol !== "user" ? (
              <select
                required
                value={agenteAsignadoId}
                onChange={(e) => setAgenteAsignadoId(e.target.value)}
                className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="" disabled>
                  Seleccione el asesor
                </option>
                {listaAgentes.map((ag) => (
                  <option key={ag.id} value={ag.id}>
                    {ag.nombres} {ag.apellido_paterno} ({ag.rol})
                  </option>
                ))}
              </select>
            ) : (
              <select
                disabled
                value={user?.id || ""}
                className="w-full bg-(--color-app-input) border border-zinc-900 rounded-md py-2 px-3 text-zinc-400 font-bold select-none cursor-not-allowed appearance-none"
              >
                <option value={user?.id}>
                  {user?.user_metadata?.nombres || "Mi Cuenta"}{" "}
                  {user?.user_metadata?.apellido_paterno || ""}{" "}
                </option>
              </select>
            )}
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Cod. (Automático){" "}
              <span className="text-(--color-alert) font-normal">*</span>
            </label>
            <input
              required
              type="text"
              readOnly
              value={codigoPropiedad}
              className="w-full bg-(--color-app-input) border border-zinc-900 rounded-md py-2 px-3 text-(--color-primary)  font-semibold cursor-not-allowed"
              placeholder="Codigo Propiedad"
            />
          </div>

          {/* TITULO COMERCIAL DE LA PROPIEDAD */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Título Publicitario del Anuncio
            </label>
            <input
              required
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500"
              placeholder="Ej: Cómodo Monoambiente Amoblado en Alquiler"
            />
          </div>
        </div>

        {/* SECCION INTERNA CLASIFICACION MODALIDAD Y SUPERFICIE */}
        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* TIPO DE PROPIEDAD */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Clasificación de Inmueble
            </label>
            <select
              required
              value={tipoPropiedadId}
              onChange={(e) => handleCambioTipo(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="" disabled>
                Seleccione el tipo
              </option>
              {tiposPropiedad.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre_tipo}
                </option>
              ))}
            </select>
          </div>

          {/* MODALIDAD */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Modalidad
            </label>
            <select
              required
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="Alquiler">Alquiler</option>
              <option value="Anticretico">Anticrético</option>
              <option value="Venta">Venta</option>
            </select>
          </div>

          {/* SUPERFICIE m2 */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Superficie Total (m²)
            </label>
            <input
              required
              type="number"
              step="any"
              value={superficieTotal}
              onChange={(e) => setSuperficieTotal(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 font-mono"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* SECCION INTERNA DE PRECIOS */}
        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* PRECIO */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Precio
            </label>
            <input
              required
              type="number"
              step="any"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 font-mono"
              placeholder="0.00"
            />
          </div>
          {/* MONEDA */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Moneda Base
            </label>
            <select
              required
              value={moneda}
              onChange={(e) => setMoneda(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="USD">Dólares (USD)</option>
              <option value="BOB">Bolivianos (BOB)</option>
            </select>
          </div>
          {/* GARANTIA */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Garantía
            </label>
            <input
              required
              type="number"
              step="any"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 font-mono"
              placeholder="0.00"
            />
          </div>
          {/* ADELANTO */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Adelanto
            </label>
            <input
              required
              type="number"
              step="any"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 font-mono"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* SECCION INTERNA DEPARTAMENTO Y ZONA */}
        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* DEPARTAMENTO */}
          <div className="campo-grupo col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              DEPARTAMENTO (BOLIVIA)
            </label>
            <select
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500 cursor-pointer"
              name="departamento"
              value={departamento}
              onChange={handleDepartamentoChange}
            >
              <option value="La Paz">La Paz</option>
              <option value="Santa Cruz">Santa Cruz</option>
              <option value="Cochabamba">Cochabamba</option>
              <option value="Tarija">Tarija</option>
              <option value="Oruro">Oruro</option>
              <option value="Potosí">Potosí</option>
              <option value="Chuquisaca">Chuquisaca</option>
              <option value="Beni">Beni</option>
              <option value="Pando">Pando</option>
            </select>
          </div>

          {/* ZONA */}
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
              Zona / Barrio
            </label>
            <input
              required
              type="text"
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500"
              placeholder="Ej: San Pedro / Equipetrol"
            />
          </div>
        </div>

        <div className="col-span-3">
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
            Dirección Exacta Escrita
          </label>
          <input
            required
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full bg-(--color-app-input) border border-zinc-800 rounded-md py-2 px-3 text-(--color-app-text) focus:outline-hidden focus:border-blue-500"
            placeholder="Ej: Calle Murillo Nro 420, entre Av. Illimani"
          />
        </div>
      </div>

      {/* MAPA INTERACTIVO CON PIN ARRASTRABLE */}
      <div className="mt-4">
        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Navigation className="size-3.5 text-blue-500" />
          <span>
            Geolocalización Inmobiliaria (Arrastra el Pin sobre el inmueble)
          </span>
        </label>

        <div className="w-full h-64 rounded-xl border border-zinc-800 overflow-hidden relative bg-zinc-950">
          <GoogleMap
            defaultZoom={14}
            defaultCenter={{ lat: latitud, lng: longitud }}
            center={{ lat: latitud, lng: longitud }}
            gestureHandling="cooperative"
            style={{ width: "100%", height: "100%" }}
            mapId="DEMO_MAP_ID"
          >
            <AdvancedMarker
              position={{ lat: latitud, lng: longitud }}
              draggable={true}
              onDragEnd={(e) => {
                if (e.latLng) {
                  setLatitud(e.latLng.lat());
                  setLongitud(e.latLng.lng());
                }
              }}
            />
          </GoogleMap>
        </div>
        <div className="flex items-center gap-4 mt-2 font-mono text-[10px] text-zinc-500 px-1">
          <span>
            Lat: <span className="text-zinc-400">{latitud.toFixed(6)}</span>
          </span>
          <span>
            Lng: <span className="text-zinc-400">{longitud.toFixed(6)}</span>
          </span>
        </div>
      </div>

      {/* SUBIDA DE FOTOS */}
      <div className="mt-4">
        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
          Galería Fotográfica (Obligatorio: Mínimo 1, Máximo 5 imágenes)
        </label>
        <label
          className={`flex flex-col items-center justify-center w-full h-24 border border-dashed rounded-xl cursor-pointer transition-colors p-3 text-center ${
            errorMultimedia
              ? "border-rose-500/50 bg-rose-500/5"
              : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <p
              className={`text-[11px] font-black ${archivosFotos.length > 0 ? "text-blue-400" : "text-zinc-300"}`}
            >
              {archivosFotos.length > 0
                ? `¡${archivosFotos.length} de 5 fotografías cargadas con éxito en caché!`
                : "Haga clic aquí para seleccionar los archivos"}
            </p>
            <p className="text-[9px] text-zinc-500 mt-0.5">
              Soporta cargas múltiples simultáneas en formatos estándar (JPG,
              PNG)
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleSeleccionImagenes}
          />
        </label>

        {errorMultimedia && (
          <p className="text-[10px] font-bold text-rose-400 mt-1.5 flex items-center gap-1 animate-fade-in">
            <span>⚠ {errorMultimedia}</span>
          </p>
        )}
      </div>
    </div>
  );
}
