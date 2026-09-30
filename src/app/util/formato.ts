import { Pipe, PipeTransform } from '@angular/core';

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

@Pipe({ name: 'cop', standalone: true })
export class CopPipe implements PipeTransform {
  transform(v: number | string | null | undefined): string {
    return v === null || v === undefined || v === '' ? '—' : pesos.format(Number(v));
  }
}

// Recibe 'yyyy-MM-dd' (como lo entrega el backend) y evita el corrimiento por zona horaria
@Pipe({ name: 'fecha', standalone: true })
export class FechaPipe implements PipeTransform {
  transform(v: string | null | undefined): string {
    if (!v) return '—';
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

export function hoyISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function diasEntre(desde: string, hasta: string): number {
  if (!desde || !hasta) return 0;
  const [y1, m1, d1] = desde.split('-').map(Number);
  const [y2, m2, d2] = hasta.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
}
