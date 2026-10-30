import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import SeccionInformacionBase from "./SeccionInformacionBase";
import {
  Home,
  Navigation,
  Info,
  Wifi,
  ArrowLeft,
  Loader2,
  Save,
  Scale,
  Flame,
  Lightbulb,
  Droplet,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Map as GoogleMap, AdvancedMarker } from "@vis.gl/react-google-maps";

export default function RegistroPropiedad() {
  const [formData, setFormData] = React.useState({
    departamento: "La Paz",
    zona: "",
    direccion: "",
    superficie_total: 0,
  });
  const { user, rol } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingInit, setLoadingInit] = useState<boolean>(true);
  const [tiposPropiedad, setTiposPropiedad] = useState<any[]>([]);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  type DepartamentoKey =
    | "Santa Cruz"
    | "La Paz"
    | "Cochabamba"
    | "Tarija"
    | "Oruro"
    | "Potosí"
    | "Chuquisaca"
    | "Beni"
    | "Pando";

  const [listaAgentes, setListaAgentes] = useState<any[]>([]);
  const [agenteAsignadoId, setAgenteAsignadoId] = useState<string>("");
  const [archivosFotos, setArchivosFotos] = useState<File[]>([]);
  const [errorMultimedia, setErrorMultimedia] = useState<string | null>(null);

  // =========================================================================
  // 📊 ESTADOS - SECCIÓN I: CARACTERÍSTICAS PRINCIPALES (PROPIEDADES GENÉRICAS)
  // =========================================================================
  const [tipoPropiedadId, setTipoPropiedadId] = useState<string>("");
  const [tipoPropiedadNombre, setTipoPropiedadNombre] = useState<string>("");
  const [titulo, setTitulo] = useState<string>("");
  const [modalidad, setModalidad] = useState<string>("Alquiler");
  const [precio, setPrecio] = useState<string>("");
  const [moneda, setMoneda] = useState<string>("USD");
  const [departamento, setDepartamento] = useState<string>("La Paz");
  const [zona, setZona] = useState<string>("");
  const [direccion, setDireccion] = useState<string>("");
  const [superficieTotal, setSuperficieTotal] = useState<string>("");

  // Coordenadas geográficas manejadas automáticamente por el Pin de Google Maps
  const [latitud, setLatitud] = useState<number>(-17.7833); // Centro predictivo Bolivia (Santa Cruz base)
  const [longitud, setLongitud] = useState<number>(-63.1833);
  const [codigoPropiedad, setCodigoPropiedad] = useState<string>("");

  // =========================================================================
  // 📊 ESTADOS - SECCIÓN II: EXPEDIENTE DE CONTROL LEGAL E IMPUESTOS
  // =========================================================================
  const [numeroFolioReal, setNumeroFolioReal] = useState<string>("");
  const [tipoPropietario, setTipoPropietario] = useState<string>("Unico Dueño");
  const [nombreTitularDdrr, setNombreTitularDdrr] = useState<string>("");
  const [cuentaConAlodial, setCuentaConAlodial] = useState<boolean>(false);
  const [tieneHipotecaGravamen, setTieneHipotecaGravamen] =
    useState<boolean>(false);
  const [deudaImpuestosAnuales, setDeudaImpuestosAnuales] =
    useState<boolean>(false);
  const [papelesAlDia, setPapelesAlDia] = useState<boolean>(false);

  // =========================================================================
  // 📊 ESTADOS - SECCIÓN III: FICHA TÉCNICA DINÁMICA (HABITACIÓN Y MONOAMBIENTE)
  // =========================================================================
  const [detallesConvivencia, setDetallesConvivencia] = useState<string>("");

  // LISTAS DESPLEGABLES (Selectores Estrictos)
  const [wifi, setWifi] = useState<string>("No");

  const [servicioGas, setServicioGas] = useState<string>("No");
  const [servicioLuz, setServicioLuz] = useState<string>("No");
  const [servicioAgua, setServicioAgua] = useState<string>("No");

  // BOOLEANOS SOLICITADOS (Manejados por Checkbox con Hover)
  const [tienePatio, setTienePatio] = useState<boolean>(false);
  const [aceptaMascotas, setAceptaMascotas] = useState<boolean>(false);
  const [lavanderiaCompartida, setLavanderiaCompartida] =
    useState<boolean>(false);
  const [banoPrivado, setBanoPrivado] = useState<boolean>(false);
  const [soloPersonaSola, setSoloPersonaSola] = useState<boolean>(false);
  const [ingresoIndependiente, setIngresoIndependiente] =
    useState<boolean>(false);
  const [comparteRoomie, setComparteRoomie] = useState<boolean>(false);
  const [serviciosIncluidos, setServiciosIncluidos] = useState<boolean>(false);
  const [amoblado, setAmoblado] = useState<boolean>(false);
  const [tieneBalcon, setTieneBalcon] = useState<boolean>(false);
  const [tieneParqueo, setTieneParqueo] = useState<boolean>(false);
  const [espacioDivisor, setEspacioDivisor] = useState<boolean>(false);
  const [tieneExtractor, setTieneExtractor] = useState<boolean>(false);
  const [aireAcondicionado, setAireAcondicionado] = useState<boolean>(false);
  const [areasComunesTerraza, setAreasComunesTerraza] =
    useState<boolean>(false);

  // GRUPO DE DEPENDENCIA DE COCINA SOLICITADO
  const [accesoCocina, setAccesoCocina] = useState<boolean>(false);
  const [cocinaIndependiente, setCocinaIndependiente] =
    useState<boolean>(false);

  // Coordenadas de referencia para centrar el mapa según el departamento seleccionado
  const coordenadasDepartamentos = {
    "Santa Cruz": { lat: -17.7833, lng: -63.1833 },
    "La Paz": { lat: -16.5, lng: -68.15 },
    Cochabamba: { lat: -17.3895, lng: -66.1568 },
    Tarija: { lat: -21.5355, lng: -64.7296 },
    Oruro: { lat: -17.9833, lng: -67.15 },
    Potosí: { lat: -19.5836, lng: -65.7531 },
    Chuquisaca: { lat: -19.0333, lng: -65.2627 },
    Beni: { lat: -14.8333, lng: -64.9 },
    Pando: { lat: -11.0267, lng: -68.7692 },
  };

  // Función para generar automáticamente el código de propiedad basado en el agente seleccionado
  const generarCodigoPropiedad = async (agenteId: string) => {
    if (!agenteId) return;

    try {
      // 1. Obtener el código/prefijo del agente desde la tabla 'perfiles'
      const { data: perfilAgente, error: errPerfil } = await supabase
        .from("perfiles")
        .select("codigo")
        .eq("id", agenteId)
        .single();

      if (errPerfil) throw errPerfil;
      const prefijo = perfilAgente?.codigo || "PROP";

      // 2. Contar cuántas propiedades tiene registradas este agente en la tabla 'propiedades'
      const { count, error: errCount } = await supabase
        .from("propiedades")
        .select("*", { count: "exact", head: true })
        .eq("agente_id", agenteId);

      if (errCount) throw errCount;

      // 3. El siguiente número secuencial es el conteo actual + 1
      const siguienteNumero = (count || 0) + 1;

      // 4. Combinar en el formato deseado (Ej: DEV-2)
      const codigoGenerado = `${prefijo}-${siguienteNumero}`;
      setCodigoPropiedad(codigoGenerado);
    } catch (error) {
      console.error("Error al generar el código de propiedad:", error);
      setCodigoPropiedad("");
    }
  };

  // Efecto para calcular el código cuando cambie el agente asignado
  useEffect(() => {
    if (agenteAsignadoId) {
      generarCodigoPropiedad(agenteAsignadoId);
    }
  }, [agenteAsignadoId]);

  // Función para manejar el cambio de departamento en tu formulario
  const handleDepartamentoChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const deptoSeleccionado = e.target.value as DepartamentoKey;
    // Actualizas el estado del departamento
    setFormData({ ...formData, departamento: deptoSeleccionado });

    // Si existe la coordenada para ese departamento, actualizas la ubicación del mapa/pin
    if (coordenadasDepartamentos[deptoSeleccionado]) {
      const { lat, lng } = coordenadasDepartamentos[deptoSeleccionado];
      setLatitud(lat);
      setLongitud(lng);
      // Aquí invocas la función de tu mapa (ej: map.setCenter({lat, lng})) para mover el pin o la vista
    }
  };

  useEffect(() => {
    async function inicializarFormulario() {
      try {
        setLoadingInit(true);
        setErrorMultimedia(null);

        // Carga de categorías base (Se mantiene intacto)
        const { data: tipos, error: errTipos } = await supabase.rpc(
          "obtener_catalogo_tipos_propiedad",
        );
        if (errTipos) throw errTipos;
        setTiposPropiedad(tipos || []);

        // Regla de Negocio: Si es vendedor, autoasignamos su sesión
        if (rol === "user") {
          if (user) setAgenteAsignadoId(user.id);
        } else {
          // Si es jefe, cargamos todo el equipo activo
          const { data: personal, error: errPersonal } = await supabase
            .from("perfiles")
            .select("id, nombres, apellido_paterno, rol")
            .eq("estado", "Activo")
            .order("nombres", { ascending: true });

          if (errPersonal) throw errPersonal;
          setListaAgentes(personal || []);
        }
      } catch (err: any) {
        console.error("Error en inicialización:", err);
        setMessage({
          type: "error",
          text: "Fallo al sincronizar catálogos y niveles de acceso.",
        });
      } finally {
        setLoadingInit(false);
      }
    }
    inicializarFormulario();
  }, [user, rol]);

  // Manejador del Input de Archivos con validación estricta en caliente (Mín 1, Máx 5)
  const handleSeleccionImagenes = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMultimedia(null);
    if (!e.target.files) return;

    const seleccionados = Array.from(e.target.files);

    if (seleccionados.length > 5) {
      setErrorMultimedia(
        "El sistema corporativo permite un máximo de 5 fotografías por propiedad.",
      );
      setArchivosFotos([]);
      return;
    }

    setArchivosFotos(seleccionados);
  };

  const handleCambioTipo = (id: string) => {
    setTipoPropiedadId(id);
    const encontrado = tiposPropiedad.find((t) => t.id.toString() === id);

    if (encontrado) {
      // 🌟 SOLUCIÓN: Extrae el texto dinámicamente sin importar si la propiedad se llama nombre_tipo, nombre o tipo
      const textoCategoria =
        encontrado.nombre_tipo || encontrado.nombre || encontrado.tipo || "";
      setTipoPropiedadNombre(textoCategoria);
    } else {
      setTipoPropiedadNombre("");
    }
  };
  // =========================================================================
  // 💾 PROCESADOR DE ALTA EN CASCADA COMPLEMENTARIO (TRANSACCIÓN SEGURO)
  // =========================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setMessage({
        type: "error",
        text: "Sesión inválida. Reautentique sus credenciales.",
      });
      return;
    }
    if (!tipoPropiedadId) {
      setMessage({
        type: "error",
        text: "Debe clasificar obligatoriamente el tipo de propiedad.",
      });
      return;
    }

    // 📍 UBICACIÓN EXACTA: Reemplaza el inicio del try dentro de tu función handleSubmit por este bloque unificado:

    try {
      setLoading(true);
      setMessage(null);
      setErrorMultimedia(null);

      // 1. Validar la asignación jerárquica del agente responsable
      const idAgenteFinal = rol === "user" ? user?.id : agenteAsignadoId;
      if (!idAgenteFinal) {
        throw new Error(
          "Debe asignar obligatoriamente un Agente responsable de la concesión.",
        );
      }

      // 2. 🌟 VALIDACIÓN DE CANTIDAD MULTIMEDIA (Mínimo 1, Máximo 5)
      if (archivosFotos.length === 0) {
        setErrorMultimedia(
          "Requisito obligatorio: Debe cargar al menos 1 fotografía de la propiedad.",
        );
        setLoading(false);
        return;
      }
      if (archivosFotos.length > 5) {
        setErrorMultimedia(
          "Exceso de archivos: El límite estricto es de 5 fotografías.",
        );
        setLoading(false);
        return;
      }

      // 3. 🌟 PROCESAMIENTO AUTOMATIZADO EN EL STORAGE BUCKET 'PROPIEDADES'
      const urlsPublicasImagenes: string[] = [];

      for (let i = 0; i < archivosFotos.length; i++) {
        const foto = archivosFotos[i];
        const extension = foto.name.split(".").pop();
        // Generamos un hash único con marca de tiempo e índice correlativo
        const nombreUnico = `${Date.now()}_propiedad_${i}.${extension}`;

        // Subida física del binario a Supabase Storage
        const { error: errSubida } = await supabase.storage
          .from("propiedades")
          .upload(nombreUnico, foto);

        if (errSubida) throw errSubida;

        // Extracción de la URL pública permanente del servidor
        const { data: dataUrl } = supabase.storage
          .from("propiedades")
          .getPublicUrl(nombreUnico);

        if (dataUrl?.publicUrl) {
          urlsPublicasImagenes.push(dataUrl.publicUrl);
        }
      }

      // 4. INSERCIÓN DE DATOS GENÉRICOS EN LA TABLA PRINCIPAL (PROPIEDADES)
      const { data: nuevaPropiedad, error: errPrincipal } = await supabase
        .from("propiedades")
        .insert({
          tipo_propiedad_id: Number(tipoPropiedadId),
          agente_id: idAgenteFinal,
          codigo_propiedad: codigoPropiedad,
          titulo,
          modalidad,
          precio: Number(precio),
          moneda,
          departamento,
          zona,
          direccion,
          superficie_total: Number(superficieTotal),
          latitud: Number(latitud),
          longitud: Number(longitud),
          imagenes: urlsPublicasImagenes, // 🌟 ALMACENADO: El arreglo de URLs listo para las tarjetas del catálogo
          estado: "Disponible",
        })
        .select("id")
        .single();

      if (errPrincipal) throw errPrincipal;
      const nuevoId = nuevaPropiedad.id;

      // 2. INSERCIÓN EN TABLA SECUNDARIA (PROPIEDADES_DETALLES) CON FILTRO DINÁMICO
      // Inicializamos el objeto base con los expedientes legales compartidos por todas las propiedades
      const camposDetalle: any = {
        propiedad_id: nuevoId,
        numero_folio_real: numeroFolioReal || null,
        tipo_propietario: tipoPropietario,
        nombre_titular_ddrr: nombreTitularDdrr || null,
        cuenta_con_alodial: cuentaConAlodial,
        tiene_hipoteca_gravamen: tieneHipotecaGravamen,
        deuda_impuestos_anuales: deudaImpuestosAnuales,
        papeles_al_dia: papelesAlDia,

        // Mapeo condicional de características de Habitación / Monoambiente
        detalles_convivencia: detallesConvivencia || null,
        wifi: wifi,
        servicio_gas: serviciosIncluidos
          ? servicioGas === "Si"
            ? "Sí"
            : servicioGas
          : "No", // 🌟 CORREGIDO CON TILDE
        servicio_luz: serviciosIncluidos
          ? servicioLuz === "Si"
            ? "Sí"
            : servicioLuz
          : "No", // 🌟 CORREGIDO CON TILDE
        servicio_agua: serviciosIncluidos
          ? servicioAgua === "Si"
            ? "Sí"
            : servicioAgua
          : "No",

        // Atributos Booleanos directos
        tiene_patio: tienePatio,
        acepta_mascotas: aceptaMascotas,
        lavanderia_compartida: lavanderiaCompartida,
        bano_privado: banoPrivado,
        solo_persona_sola: soloPersonaSola,
        ingreso_independiente: ingresoIndependiente,
        comparte_roomie: comparteRoomie,
        servicios_incluidos: serviciosIncluidos,
        amoblado: amoblado ? "Si" : "No", // Conversión al tipo enum de tu BD
        tiene_balcon: tieneBalcon,
        tiene_parqueo: tieneParqueo,
        espacio_divisor: espacioDivisor,
        tiene_extractor: tieneExtractor,
        aire_acondicionado: aireAcondicionado,
        areas_comunes_terraza: areasComunesTerraza,

        // Grupo de Dependencia de Cocina Solicitado
        acceso_cocina: accesoCocina,
        cocina_independiente: accesoCocina ? cocinaIndependiente : false, // Lógica de resguardo
      };

      // Ejecutamos la segunda inserción física coordinada en Supabase
      const { error: errDetalle } = await supabase
        .from("propiedades_detalles")
        .insert(camposDetalle);

      if (errDetalle) throw errDetalle;

      setMessage({
        type: "success",
        text: "¡Expediente de propiedad registrado exitosamente!",
      });
      setTimeout(() => navigate("/lista-properties"), 1500);
    } catch (err: any) {
      console.error("Error crítico en cascada de alta:", err);
      setMessage({
        type: "error",
        text:
          err.message ||
          "Fallo al consolidar los registros en la base de datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center  text-xs font-semibold gap-2">
        <Loader2 className="size-4 animate-spin text-(--color-app-text)" />
        <span>Inicializando formulario de registo de propiedades...</span>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-fade-in text-white select-none bg-(--color-app-bg)">
      {/* RETORNO AL PANEL */}
      <div className="mb-6">
        <Link
          to="/lista-propiedades"
          className="inline-flex items-center gap-2 text-xs font-bold text-(--color-app-text) hover:text-blue-400 transition-colors group cursor-pointer mb-2"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al Inventario</span>
        </Link>
        <h2 className="text-xl font-bold text-(--color-success) tracking-tight flex items-center gap-2">
          <Save className="size-5 text-(--color-primary)" />
          <span>REGISTRO DE PROPIEDAD </span>
        </h2>
        <p className="text-xs text-(--color-warning) mt-0.5">
          Registra los datos de la propiedad precisa y responsablemente, si
          tiene alguna duda contacte a su superior inmediato.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold mb-6 border ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* FORMULARIO DE REGISTRO */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <SeccionInformacionBase
          rol={rol}
          user={user}
          agenteAsignadoId={agenteAsignadoId}
          setAgenteAsignadoId={setAgenteAsignadoId}
          listaAgentes={listaAgentes}
          titulo={titulo}
          codigoPropiedad={codigoPropiedad}
          setTitulo={setTitulo}
          tipoPropiedadId={tipoPropiedadId}
          handleCambioTipo={handleCambioTipo}
          tiposPropiedad={tiposPropiedad}
          modalidad={modalidad}
          setModalidad={setModalidad}
          superficieTotal={superficieTotal}
          setSuperficieTotal={setSuperficieTotal}
          precio={precio}
          setPrecio={setPrecio}
          moneda={moneda}
          setMoneda={setMoneda}
          departamento={departamento}
          handleDepartamentoChange={handleDepartamentoChange}
          zona={zona}
          setZona={setZona}
          direccion={direccion}
          setDireccion={setDireccion}
          latitud={latitud}
          longitud={longitud}
          setLatitud={setLatitud}
          setLongitud={setLongitud}
          archivosFotos={archivosFotos}
          errorMultimedia={errorMultimedia}
          handleSeleccionImagenes={handleSeleccionImagenes}
        />
        {/* SECCIÓN II: EXPEDIENTE DE CONTROL LEGAL E IMPUESTOS (CONFIDENCIAL) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
            <Scale className="size-4" />
            <span>
              II. Expediente de Control Legal e Impuestos (Confidencial)
            </span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Nro. Matrícula / Folio Real
              </label>
              <input
                type="text"
                value={numeroFolioReal}
                onChange={(e) => setNumeroFolioReal(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 focus:outline-hidden focus:border-blue-500 font-mono"
                placeholder="Ej: 7.01.1.01.002345"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Tipo de Propietario
              </label>
              <select
                value={tipoPropietario}
                onChange={(e) => setTipoPropietario(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                <option value="Unico Dueño">Único Dueño Titular</option>
                <option value="Varios Dueños">
                  Copropiedad (Varios Dueños)
                </option>
                <option value="Sucesion">Sucesión Hereditaria Abierta</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Nombre Titular (Según DDRR)
              </label>
              <input
                type="text"
                value={nombreTitularDdrr}
                onChange={(e) => setNombreTitularDdrr(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-zinc-200 focus:outline-hidden focus:border-blue-500"
                placeholder="Nombre completo del propietario"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <label className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl cursor-pointer select-none hover:bg-zinc-950 transition-colors">
              <input
                type="checkbox"
                checked={cuentaConAlodial}
                onChange={(e) => setCuentaConAlodial(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 size-4 text-blue-500 focus:ring-0"
              />
              <div>
                <p className="font-bold text-zinc-200">Alodial al Día</p>
                <p className="text-[10px] text-zinc-500">
                  Sin gravamen vigente
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl cursor-pointer select-none hover:bg-zinc-950 transition-colors">
              <input
                type="checkbox"
                checked={tieneHipotecaGravamen}
                onChange={(e) => setTieneHipotecaGravamen(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 size-4 text-blue-500 focus:ring-0"
              />
              <div>
                <p className="font-bold text-zinc-200">Tiene Hipoteca</p>
                <p className="text-[10px] text-zinc-500">
                  Deuda bancaria activa
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl cursor-pointer select-none hover:bg-zinc-950 transition-colors">
              <input
                type="checkbox"
                checked={deudaImpuestosAnuales}
                onChange={(e) => setDeudaImpuestosAnuales(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 size-4 text-blue-500 focus:ring-0"
              />
              <div>
                <p className="font-bold text-zinc-200">Debe Impuestos</p>
                <p className="text-[10px] text-zinc-500">
                  Pendiente en el RUAT
                </p>
              </div>
            </label>
            <label className="flex items-center gap-3 bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl cursor-pointer select-none hover:bg-zinc-950 transition-colors">
              <input
                type="checkbox"
                checked={papelesAlDia}
                onChange={(e) => setPapelesAlDia(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 size-4 text-blue-500 focus:ring-0"
              />
              <div>
                <p className="font-bold text-zinc-200">Papeles al Día</p>
                <p className="text-[10px] text-zinc-500">Listo para minuta</p>
              </div>
            </label>
          </div>
        </div>

        {/* SECCIÓN III: FICHA TÉCNICA DINÁMICA INDIVIDUAL (HABITACIÓN Y MONOAMBIENTE) */}
        {(tipoPropiedadNombre === "Habitacion" ||
          tipoPropiedadNombre === "Monoambiente" ||
          tipoPropiedadNombre === "Habitación") && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xl animate-fade-in">
            <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <Info className="size-4" />
              <span>
                III. Ficha de Convivencia y Atributos: {tipoPropiedadNombre}
              </span>
            </h3>

            {/* Campo Novedades / Detalles de Convivencia */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                Novedades o Detalles de Convivencia
              </label>
              <textarea
                value={detallesConvivencia}
                onChange={(e) => setDetallesConvivencia(e.target.value)}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-200 focus:outline-hidden focus:border-blue-500 resize-none"
                placeholder="Registra las novedades importantes, reglas del inmueble, restricciones u observaciones..."
              />
            </div>

            {/* 🌟 GRUPO SOLICITADO: DEPENDENCIA DE COCINA (ACCESO Y LUEGO INDEPENDENCIA) */}
            <div className="bg-zinc-950/30 border border-zinc-800/60 p-4 rounded-xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={accesoCocina}
                  onChange={(e) => {
                    setAccesoCocina(e.target.checked);
                    if (!e.target.checked) setCocinaIndependiente(false);
                  }}
                  className="rounded border-zinc-700 bg-zinc-900 size-4 text-blue-500 focus:ring-0"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-200">
                    ¿Cuenta con Acceso a Cocina?
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Indica si el residente tiene espacio habilitado para cocinar
                  </p>
                </div>
              </label>

              {accesoCocina && (
                <div className="pl-7 animate-fade-in">
                  <label className="flex items-center gap-3 cursor-pointer select-none bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/40">
                    <input
                      type="checkbox"
                      checked={cocinaIndependiente}
                      onChange={(e) => setCocinaIndependiente(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 size-3.5 text-emerald-500 focus:ring-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-zinc-300">
                        ¿La cocina es estrictamente Independiente?
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Desmarcado significa que la cocina es compartida en
                        áreas comunes
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* 🌟 GRUPO SOLICITADO: DEPENDENCIA DE SUMINISTROS (SERVICIOS INCLUIDOS Y SELECTORES) */}
            <div className="bg-zinc-950/30 border border-zinc-800/60 p-4 rounded-xl space-y-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={serviciosIncluidos}
                  onChange={(e) => setServiciosIncluidos(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 size-4 text-blue-500 focus:ring-0"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-200">
                    ¿Servicios Incluidos en el Precio?
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Determina si las expensas o consumos básicos van dentro del
                    canon
                  </p>
                </div>
              </label>

              {serviciosIncluidos && (
                <div className="pl-7 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-fade-in pt-1">
                  {/* SERVICIO DE GAS */}
                  <div>
                    <label className=" text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Flame className="size-3 text-amber-500" />
                      <span>Servicio de Gas</span>
                    </label>
                    <select
                      value={servicioGas === "Sí" ? "Si" : servicioGas}
                      onChange={(e) =>
                        setServicioGas(
                          e.target.value === "Si" ? "Sí" : e.target.value,
                        )
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-2.5 text-zinc-200 cursor-pointer focus:border-blue-500"
                    >
                      <option value="Si">Sí (Incluido)</option>{" "}
                      {/* 🌟 Sincronizado en el cliente */}
                      <option value="No">No disponible</option>
                      <option value="Independiente">
                        Medidor Independiente
                      </option>
                    </select>
                  </div>

                  {/* SERVICIO DE LUZ */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Lightbulb className="size-3 text-yellow-400" />
                      <span>Servicio de Luz</span>
                    </label>
                    <select
                      value={servicioLuz === "Sí" ? "Si" : servicioLuz}
                      onChange={(e) =>
                        setServicioLuz(
                          e.target.value === "Si" ? "Sí" : e.target.value,
                        )
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-2.5 text-zinc-200 cursor-pointer focus:border-blue-500"
                    >
                      <option value="Si">Sí (Incluido)</option>{" "}
                      {/* 🌟 Sincronizado en el cliente */}
                      <option value="No">No disponible</option>
                      <option value="Independiente">
                        Medidor Independiente
                      </option>
                    </select>
                  </div>

                  {/* SERVICIO DE AGUA */}
                  <div>
                    <label className=" text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Droplet className="size-3 text-blue-400" />
                      <span>Servicio de Agua</span>
                    </label>
                    <select
                      value={servicioAgua === "Sí" ? "Si" : servicioAgua}
                      onChange={(e) =>
                        setServicioAgua(
                          e.target.value === "Si" ? "Sí" : e.target.value,
                        )
                      }
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-2.5 text-zinc-200 cursor-pointer focus:border-blue-500"
                    >
                      <option value="Si">Sí (Incluido)</option>{" "}
                      {/* 🌟 Sincronizado en el cliente */}
                      <option value="No">No disponible</option>
                      <option value="Independiente">
                        Medidor Independiente
                      </option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* SELECTOR EXCLUSIVO: WIFI */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Wifi className="size-3 text-blue-400" />
                  <span>Conexión WiFi / Internet</span>
                </label>
                <select
                  value={wifi}
                  onChange={(e) => setWifi(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-zinc-200 cursor-pointer focus:border-blue-500"
                >
                  <option value="Si">Si (Disponible)</option>{" "}
                  <option value="No">No cuenta</option>{" "}
                  <option value="Opcional">Opcional (Pago extra)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {/* ... tus campos existentes de servicio de gas, luz, agua, wifi ... */}

              {/* Campo Amoblado corregido con las opciones del ENUM */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ¿Está amoblado?
                </label>
                <select
                  name="amoblado"
                  // Asegúrate de enlazar esto con el estado de tu formulario (ej. formData.amoblado)
                  // value={formData.amoblado}
                  // onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                  <option value="Opcional">Opcional</option>
                </select>
              </div>
            </div>

            {/* GRILLA DE CHECKBOXES ADICIONALES (BOOLEANOS CON HOVER) */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Comodidades e Infraestructura Adicional
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={tienePatio}
                    onChange={(e) => setTienePatio(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Tiene Patio</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={aceptaMascotas}
                    onChange={(e) => setAceptaMascotas(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Mascotas</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={lavanderiaCompartida}
                    onChange={(e) => setLavanderiaCompartida(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Lavandería Comp.</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={banoPrivado}
                    onChange={(e) => setBanoPrivado(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Baño Privado</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={soloPersonaSola}
                    onChange={(e) => setSoloPersonaSola(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Persona Sola</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={ingresoIndependiente}
                    onChange={(e) => setIngresoIndependiente(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Ingreso Indep.</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={comparteRoomie}
                    onChange={(e) => setComparteRoomie(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Comparte Roomie</span>
                </label>

                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={tieneBalcon}
                    onChange={(e) => setTieneBalcon(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Tiene Balcón</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={tieneParqueo}
                    onChange={(e) => setTieneParqueo(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Tiene Parqueo</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={espacioDivisor}
                    onChange={(e) => setEspacioDivisor(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Espacio Divisor</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={tieneExtractor}
                    onChange={(e) => setTieneExtractor(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Tiene Extractor</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={aireAcondicionado}
                    onChange={(e) => setAireAcondicionado(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Aire Acondic.</span>
                </label>
                <label className="flex items-center gap-2 bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-800/50 cursor-pointer select-none hover:bg-zinc-950 transition-colors">
                  <input
                    type="checkbox"
                    checked={areasComunesTerraza}
                    onChange={(e) => setAreasComunesTerraza(e.target.checked)}
                    className="rounded border-zinc-700 text-blue-500"
                  />
                  <span>Terraza Común</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ACCIONES DEL FORMULARIO */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
          <Link
            to="/lista-propiedades"
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-2 shadow-md shadow-blue-600/10"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <>
                <Save className="size-4" />
                <span>Consolidar Alta Residencial</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
