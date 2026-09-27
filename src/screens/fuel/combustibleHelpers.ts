import { fechaToDate } from '@/src/helpers';
import type { Tanqueada } from '@/src/services';


// ─── Constantes de negocio ───────────────────────────────────────
/** Fracción del promedio bajo la cual se alerta (85%). */
export const UMBRAL_ALERTA_BAJO = 0.85;
/** Mínimo de tanqueadas válidas para mostrar la alerta de bajo rendimiento. */
export const MINIMO_PARA_ALERTA = 3;


export interface OpcionVehiculo {
  id: string;
  etiqueta: string;
}

export interface ResumenRendimiento {
  promedio: number;
  validas: number;
  ultimo: number | null;
}

/**
 * Tope de cordura del rendimiento según unidad (cubre hasta motos pequeñas).
 * Valores mayores se consideran error de digitación y se ignoran.
 */
export function maxRendimiento(unidad: string): number {
  return unidad === 'millas' ? 40 : 70;
}

/** Ordena tanqueadas por KM ascendente sin mutar el arreglo original. */
export function ordenarPorKm(tanqueadas: Tanqueada[]): Tanqueada[] {
  return [...tanqueadas].sort((a, b) => a.km - b.km);
}

/**
 * Rendimiento de UNA tanqueada contra la anterior por KM:
 * (kmActual - kmAnterior) / litros. Devuelve null si no es calculable
 * (primera, parcial anterior inválida, KM que no avanza o valor absurdo).
 */
export function rendimientoDeUna(previo: Tanqueada | undefined, actual: Tanqueada, unidad: string): number | null {
  if (!actual.lleno || !previo) return null;
  const kmRecorridos = actual.km - previo.km;
  const litros = Number(actual.litros) || 0;
  if (kmRecorridos <= 0 || litros <= 0) return null;
  const rendimiento = kmRecorridos / litros;
  if (rendimiento >= maxRendimiento(unidad)) return null;
  return rendimiento;
}

/**
 * Promedio del vehículo con el método de tanque lleno:
 * promedia solo las tanqueadas llenas con anterior válido.
 */
export function rendimientoPromedio(tanqueadas: Tanqueada[], unidad: string): ResumenRendimiento {
  const ordenadas = ordenarPorKm(tanqueadas);
  let suma = 0;
  let validas = 0;
  let ultimo: number | null = null;

  for (let i = 1; i < ordenadas.length; i++) {
    const rendimiento = rendimientoDeUna(ordenadas[i - 1], ordenadas[i], unidad);
    if (rendimiento === null) continue;
    suma += rendimiento;
    validas++;
    ultimo = rendimiento;
  }

  return { promedio: validas ? suma / validas : 0, validas, ultimo };
}

/** KM totales recorridos entre la primera y la última tanqueada. */
export function kmRecorridos(tanqueadas: Tanqueada[]): number {
  if (tanqueadas.length < 2) return 0;
  const kms = tanqueadas.map((t) => t.km);
  return Math.max(...kms) - Math.min(...kms);
}

/** Suma de costos de una lista de tanqueadas. */
export function gastoTotal(tanqueadas: Tanqueada[]): number {
  return tanqueadas.reduce((acc, t) => acc + (Number(t.costo) || 0), 0);
}

/** Formatea una fecha de Firestore/ISO a texto corto es-HN. */
export function formatearFecha(fecha: Tanqueada['fecha']): string {
  const d = fechaToDate(fecha);
  if (!d) return '—';
  return d.toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Fecha + hora de ingreso de la tanqueada (createdAt); sin hora si el registro es viejo. */
export function formatearFechaHora(item: Tanqueada): string {
  const fecha = formatearFecha(item.fecha);
  if (!item.createdAt) return fecha;
  const d = fechaToDate(item.createdAt);
  if (!d) return fecha;
  return `${fecha} · ${d.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Texto del chip de rendimiento de una fila del historial. */
export function textoRendimientoFila(item: Tanqueada, tanqueadas: Tanqueada[], unidad: string): string {
  const unidadVolumen = unidad === 'millas' ? 'mi/L' : 'km/L';
  const anteriores = tanqueadas.filter((t) => t.km < item.km).sort((a, b) => b.km - a.km);
  const rendimiento = rendimientoDeUna(anteriores[0], item, unidad);
  if (rendimiento === null) return '—';
  return `${rendimiento.toFixed(1)} ${unidadVolumen}`;
}
