import { API } from '../config';

export const TIPOS = [
  { valor: 'automovil', etiqueta: 'Automóvil' },
  { valor: 'camioneta', etiqueta: 'Camioneta' },
  { valor: 'campero', etiqueta: 'Campero' },
  { valor: 'microbus', etiqueta: 'Microbús' },
  { valor: 'motocicleta', etiqueta: 'Motocicleta' },
];

export const CATEGORIAS_LICENCIA = ['A1', 'A2', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];

export function etiquetaTipo(tipo?: string): string {
  return TIPOS.find((t) => t.valor === tipo)?.etiqueta ?? tipo ?? '';
}

export function tituloVehiculo(v: any): string {
  const nombre = [v?.marca, v?.modelo].filter(Boolean).join(' ');
  return nombre || etiquetaTipo(v?.tipoVehiculo);
}

export function placeholderDe(v: any): string {
  return `img/tipo-${v?.tipoVehiculo || 'automovil'}.svg`;
}

// La foto puede ser una ruta del backend (/uploads/...), una URL externa o nada (ilustracion por tipo)
export function imagenDe(v: any): string {
  const url: string | undefined = v?.imagenUrl;
  if (!url) return placeholderDe(v);
  return url.startsWith('/') ? API + url : url;
}

// Motocicleta: categorias A. Los demas tipos: B o C (misma regla que el backend)
export function licenciaHabilita(categoria: string | undefined, tipoVehiculo: string | undefined): boolean {
  const c = (categoria || '').trim().toUpperCase();
  if (!c) return false;
  return tipoVehiculo === 'motocicleta' ? c.startsWith('A') : c.startsWith('B') || c.startsWith('C');
}

const COLORES: Record<string, string> = {
  blanco: '#F1F1EC', negro: '#1E2320', gris: '#8A9490', plateado: '#B9C0BD', rojo: '#C03A2B',
  azul: '#2C5FA8', verde: '#2E7D57', amarillo: '#F2B01E', naranja: '#E8792B', vinotinto: '#722F37',
  beige: '#D8C8A6', cafe: '#6B4A32', dorado: '#C9A227',
};
export function colorHex(nombre?: string): string {
  const n = (nombre || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return COLORES[n] ?? '#B9C0BD';
}

export const ESTADOS_ALQUILER: Record<string, { texto: string; clase: string }> = {
  'pendiente de entrega': { texto: 'Pendiente de entrega', clase: 'est-pendiente' },
  entregado: { texto: 'Entregado', clase: 'est-entregado' },
  finalizado: { texto: 'Finalizado', clase: 'est-finalizado' },
  cancelado: { texto: 'Cancelado', clase: 'est-cancelado' },
};

export const ESTADOS_VEHICULO: Record<string, { texto: string; clase: string }> = {
  disponible: { texto: 'Disponible', clase: 'est-disponible' },
  alquilado: { texto: 'Alquilado', clase: 'est-alquilado' },
  mantenimiento: { texto: 'En mantenimiento', clase: 'est-mantenimiento' },
};
