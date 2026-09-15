/**
 * Formatea un número como kilometraje con separadores de miles.
 * @param {number|string} value - El valor del kilometraje.
 * @param {string} locale - El código de localidad (ej: 'es-HN', 'es-MX', 'en-US').
 * @returns {string} - El kilometraje formateado (ej: "2,135,641 KM").
 */
export function formatearKilometraje(value: number, locale: string = 'es-HN'): string {
  const number = parseFloat(value.toString());

  // Si no es un número válido, devolvemos un string vacío o un guion
  if (isNaN(number)) return '-- KM';

  const formattedNumber = new Intl.NumberFormat(locale).format(number);

  return `${formattedNumber} KM`;
};

/**
 * Valida formato básico de correo electrónico (sin espacios, con @ y dominio).
 */
export function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email ?? '').trim());
}

/**
 * Etiqueta de unidad de distancia según configuración: 'MI' o 'KM'.
 */
export function etiquetaDistancia(unidad?: string): string {
  return String(unidad ?? '').toLowerCase() === 'millas' ? 'MI' : 'KM';
}

/**
 * Formatea un valor ya guardado en la unidad activa (el backend convierte
 * al cambiar de unidad, aquí solo se formatea y etiqueta).
 */
export function formatearDistancia(value: number, unidad?: string, locale: string = 'es-HN'): string {
  const number = parseFloat((value ?? 0).toString());

  if (isNaN(number)) return `-- ${etiquetaDistancia(unidad)}`;

  const formattedNumber = new Intl.NumberFormat(locale).format(number);

  return `${formattedNumber} ${etiquetaDistancia(unidad)}`;
}

/**
 * Convierte una fecha de Firestore {_seconds,_nanoseconds} o string ISO a Date.
 */
export function fechaToDate(fecha: { _seconds: number; _nanoseconds: number } | string | Date): Date | null {
  try {
    if (!fecha) return null;
    if (fecha instanceof Date) return fecha;
    if (typeof fecha === 'string') {
      const d = new Date(fecha.includes('T') ? fecha : `${fecha}T12:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(fecha._seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/**
 * Días restantes hasta una fecha (negativo = vencido).
 */
export function diasRestantes(fecha: { _seconds: number; _nanoseconds: number } | string | Date): number | null {
  const target = fechaToDate(fecha);
  if (!target) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - hoy.getTime()) / 86400000);
}

/**
 * Estado legible del próximo mantenimiento: { texto, urgente }.
 * Ej: "Vencido hace 3 días" | "Vence hoy" | "En 5 días" | "En 2 meses".
 */
export function estadoMantenimiento(fechaRecordatorio: { _seconds: number; _nanoseconds: number } | string | Date): { texto: string; urgente: boolean } {
  const d = diasRestantes(fechaRecordatorio);
  if (d === null) return { texto: 'Sin fecha', urgente: false };
  if (d < 0) return { texto: `Vencido hace ${Math.abs(d)} ${Math.abs(d) === 1 ? 'día' : 'días'}`, urgente: true };
  if (d === 0) return { texto: 'Vence hoy', urgente: true };
  if (d <= 30) return { texto: `En ${d} ${d === 1 ? 'día' : 'días'}`, urgente: d <= 7 };
  const meses = Math.floor(d / 30);
  return { texto: `En ${meses} ${meses === 1 ? 'mes' : 'meses'}`, urgente: false };
}

/**
 * Progreso 0-100 hacia el próximo mantenimiento (para barra visual).
 */
export function progresoMantenimiento(fechaRecordatorio: { _seconds: number; _nanoseconds: number } | string | Date): number;
export function progresoMantenimiento(dias: number | null): number;
export function progresoMantenimiento(input: unknown): number {
  const d = typeof input === 'number' ? input : diasRestantes(input as { _seconds: number; _nanoseconds: number } | string | Date);
  if (d === null || d === undefined) return 12;
  if (d <= 0) return 100;
  if (d <= 7) return 82;
  if (d <= 30) return 55;
  return 28;
}

/**
 * Suma mano de obra + repuestos de una lista de mantenimientos.
 */
export function gastoTotalMantenimientos(items: { costo_manoobra?: number; costo_repuestos?: number }[]): number {
  return items.reduce((acc, m) => acc + (Number(m.costo_manoobra) || 0) + (Number(m.costo_repuestos) || 0), 0);
}

/**
 * Formatea moneda en lempiras.
 */
export function formatearMoneda(value: number, locale: string = 'es-HN'): string {
  const number = parseFloat((value ?? 0).toString());
  if (isNaN(number)) return 'L 0';
  return `L ${new Intl.NumberFormat(locale).format(number)}`;
};