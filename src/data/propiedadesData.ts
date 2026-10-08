export interface Agente {
  nombre: string;
  avatar: string;
  telefono: string; // <-- Nuevo: Ej: "59170000000"
}

export interface Dependencias {
  sala: boolean;
  comedor: boolean;
  lavanderia: boolean;
  patio: boolean;
}

export interface Detalles {
  garage: boolean;
  mascotas: boolean;
  banos: number;
  banoCompartido: boolean;
  serviciosIndependientes: {
    agua: boolean;
    luz: boolean;
    gasDomiciliario: boolean;
  };
  garantia: string | null;
  mantenimiento: string | null;
  piso: number | string;
  dependencias: Dependencias;
}

export interface Propiedad {
  id: string;
  imagenes: string[]; // <-- Modificado: Ahora es un arreglo de fotos
  modalidad: 'Alquiler' | 'Anticrético' | 'Venta' | 'Preventa';
  tipo: 'Departamento' | 'Casa' | 'Habitación' | 'Local comercial' | 'Edificio' | 'Baulera' | 'Terreno' | 'Condominio' | 'Oficina' | 'Quinta'| 'Local industrial' |'Galpon' | 'Garage';
  zona: string;
  dormitorios: number;
  precio: string;
  titulo: string;
  agente: Agente;
  detalles: Detalles;
}

export const propiedadesIniciales: Propiedad[] = [
  // ... (Tus propiedades 1, 2 y 3 se adaptarían cambiando 'imagen' por 'imagenes: [url1, url2]')
  {
    id: '1',
    imagenes: [
      '/propiedades/001_01.jpg'
    ],
    modalidad: 'Venta',
    tipo: 'Casa',
    zona: 'Achumani',
    dormitorios: 4,
    precio: '$us 265.000',
    titulo: 'Moderna Casa Familiar con Parrillero',
    agente: {
      nombre: 'Mauricio Siles',
      avatar: 'https://unsplash.com',
      telefono: '59177254123'
    },
    detalles: {
      garage: true,
      mascotas: true,
      banos: 3,
      banoCompartido: false,
      serviciosIndependientes: { agua: true, luz: true, gasDomiciliario: true },
      garantia: null,
      mantenimiento: null,
      piso: '3 Plantas',
      dependencias: { sala: true, comedor: true, lavanderia: true, patio: true }
    }
  },
  {
    id: '2',
    imagenes: [
      '/propiedades/002_01.jpg'
    ],
    modalidad: 'Alquiler',
    tipo: 'Departamento',
    zona: 'Equipetrol',
    dormitorios: 1,
    precio: '$us 550',
    titulo: 'Studio de Lujo Completamente Amoblado',
    agente: {
      nombre: 'Elena Vásquez',
      avatar: 'https://unsplash.com',
      telefono: '59133456789'
    },
    detalles: {
      garage: true,
      mascotas: false,
      banos: 1,
      banoCompartido: false,
      serviciosIndependientes: { agua: true, luz: true, gasDomiciliario: true },
      garantia: '$us 1.100',
      mantenimiento: 'Bs 480',
      piso: 5,
      dependencias: { sala: true, comedor: false, lavanderia: true, patio: false }
    }
  },
  {
    id: '3',
   imagenes: [
      '/propiedades/003_01.jpg'
    ],
    modalidad: 'Anticrético',
    tipo: 'Departamento',
    zona: 'Sopocachi',
    dormitorios: 2,
    precio: '$us 42.000',
    titulo: 'Departamento Céntrico de Ocasión',
    agente: {
      nombre: 'Ricardo Arce',
      avatar: 'https://unsplash.com',
      telefono: '59160541234'
    },
    detalles: {
      garage: false,
      mascotas: true,
      banos: 1,
      banoCompartido: true, // Baño compartido
      serviciosIndependientes: { agua: false, luz: true, gasDomiciliario: false },
      garantia: null,
      mantenimiento: 'Bs 150',
      piso: 2,
      dependencias: { sala: true, comedor: true, lavanderia: true, patio: false }
    }
  }
];
