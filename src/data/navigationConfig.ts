// src/data/navigationConfig.ts

export interface EnlaceSubmenu {
  label: string;
  to?: string;
  href?: string;
  soloAdmin?: boolean;
}

export interface SeccionMenu {
  label: string;
  color?: string;
  soloAdmin?: boolean;
  enlaces: EnlaceSubmenu[];
}

export const menuSecciones: SeccionMenu[] = [
  {
    label: "Agentes",
    color: "text-(--color-success)",
    soloAdmin: true,
    enlaces: [
      { label: "Registrar Agentes", href: "registrar-agente", soloAdmin: true },
      { label: "Lista de agentes", href: "lista-agentes", soloAdmin: true },
    ],
  },
  {
    label: "Sucursales",
    color: "text-(--color-success)",
    soloAdmin: true,
    enlaces: [
      { label: "Registrar Sucursal", href: "#registrar-sucursal", soloAdmin: true },
      { label: "Lista de Sucursales", href: "#lista-sucursales", soloAdmin: true },
    ],
  },
  {
    label: "Clientes",
    color: "text-(--color-success)",
    soloAdmin: false,
    enlaces: [
      { label: "Registrar Clientes", href: "#registrar-clientes", soloAdmin: false },
      { label: "Lista de clientes", href: "#lista-clientes", soloAdmin: false },
    ],
  },
  {
    label: "Propiedades",
     color: "text-(--color-success)",
    soloAdmin: false,
    enlaces: [
      { label: "Catálogo", to: "/propiedades", soloAdmin: true },
      { label: "Registrar Propiedad", to: "/registrar-propiedad", soloAdmin: false },
      { label: "Lista de propiedades", to: "/lista-propiedades", soloAdmin: true },
    ],
  },
  {
    label: "Proyectos",
     color: "text-(--color-success)",
    soloAdmin: true,
    enlaces: [
      { label: "Registrar Proyecto", href: "#registrar-proyecto", soloAdmin: true },
      { label: "Lista de proyectos", href: "#listaproyectos", soloAdmin: true },
    ],
  },
  {
    label: "Finanzas",
    color: "text-(--color-success)",
    soloAdmin: true,
    enlaces: [
      { label: "Contratos", href: "#contratos", soloAdmin: true },
      { label: "Operaciones", href: "#operaciones", soloAdmin: true },
    ],
  },
  {
    label: "Agenda",
    color: "text-(--color-success)",
    soloAdmin: false,
    enlaces: [
      { label: "Registrar cita", href: "#reistrar-citas", soloAdmin: false },
      { label: "Ver Agenda", href: "#agentes", soloAdmin: false },
    ],
  },
  {
    label: "Configuración",
     color: "text-(--color-success)",
    soloAdmin: true,
    enlaces: [
      { label: "Configurar", href: "#config", soloAdmin: true },
    ],
  },
];