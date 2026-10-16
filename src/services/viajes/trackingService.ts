import * as Location from 'expo-location';

import { Vehiculo } from '@/src/interfaces/vehiculos';
import { actualizarVehiculo, obtenerVehiculos, sumarKilometraje } from '@/src/services/api/vehiculoServices';
import { notificarViaje } from '@/src/services/system/notifications';
import { getItem, saveItem } from '@/src/services/system/storage';


// ─── Constantes ──────────────────────────────────────────────
/** Nombre de la tarea de ubicación en segundo plano. */
export const TRACK_TASK = 'VIAJE_TASK';
/** Desplazamiento (m) desde el origen para declarar "en viaje". */
export const UMBRAL_INICIO_M = 250;
/** Radio (m): dentro de él se cuenta tiempo quieto para cerrar. */
export const RADIO_QUIETO_M = 100;
/** Segundos quieto continuo para cerrar el viaje. */
export const T_FIN_SEG = 300;
/** Velocidad máxima creíble (km/h): solo filtra saltos GPS, no es compuerta. */
export const VEL_MAX_KMH = 180;
/** Distancia mínima (km) para contar el viaje. */
export const MIN_KM = 0.5;
/** Fixes con peor precisión (m) se ignoran. */
export const MAX_ACC_M = 50;
/** Máximo de viajes guardados en el log local. */
export const MAX_VIAJES_LOG = 20;
/** Keys de AsyncStorage. */
export const KEY_VIAJES = 'viajes_recientes';
export const KEY_TRACKING = 'tracking_enabled';
export const KEY_FAV = 'vehiculo_favorito';


export interface FixViaje {
  lat: number;
  lon: number;
  t: number;
  acc: number | null;
}

export interface EstadoViaje {
  fase: 'quieto' | 'viaje';
  distKm: number;
  origen: FixViaje | null;
  ancla: FixViaje | null;
  anclaDesde: number | null;
  ultimo: FixViaje | null;
}

export interface ViajeLog {
  id: string;
  fecha: string;
  hora: string;
  km: number;
  vehiculo: string;
  estado: 'sumado' | 'deshecho';
  pendiente?: boolean;
}

export function estadoInicial(): EstadoViaje {
  return { fase: 'quieto', distKm: 0, origen: null, ancla: null, anclaDesde: null, ultimo: null };
}

/** Distancia en KM entre dos fixes (fórmula de haversine). */
export function haversineKm(a: FixViaje, b: FixViaje): number {
  const R = 6371;
  const r = Math.PI / 180;
  const s = Math.sin((b.lat - a.lat) * r / 2) ** 2
    + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lon - a.lon) * r / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function evaluarFix(f: FixViaje, e: EstadoViaje, ahora: number): { estado: EstadoViaje; evento: 'nada' | 'iniciado' | 'cerrado' } {
  if (f.acc !== null && f.acc > MAX_ACC_M) return { estado: e, evento: 'nada' };

  const estado: EstadoViaje = { ...e };
  let evento: 'nada' | 'iniciado' | 'cerrado' = 'nada';

  if (!estado.origen) {
    estado.origen = f;
    estado.ancla = f;
    estado.anclaDesde = ahora;
  } else if (estado.ultimo) {
    const d = haversineKm(estado.ultimo, f);
    const dt = Math.max(1, (f.t - estado.ultimo.t) / 1000);
    const kmh = (d / dt) * 3600;
    // Salto GPS imposible: se ignora el fix sin mover nada.
    if (kmh > VEL_MAX_KMH) return { estado, evento: 'nada' };

    if (estado.fase === 'viaje') {
      estado.distKm += d;
      if (estado.ancla && haversineKm(estado.ancla, f) * 1000 > RADIO_QUIETO_M) {
        estado.ancla = f;
        estado.anclaDesde = ahora;
      } else if (estado.anclaDesde !== null && ahora - estado.anclaDesde >= T_FIN_SEG * 1000) {
        evento = 'cerrado';
      }
    } else {
      if (haversineKm(estado.origen, f) * 1000 >= UMBRAL_INICIO_M) {
        estado.fase = 'viaje';
        estado.distKm = haversineKm(estado.origen, f);
        estado.ancla = f;
        estado.anclaDesde = ahora;
        evento = 'iniciado';
      }
    }
  }

  estado.ultimo = f;
  return { estado, evento };
}

/** Pide permiso de ubicación: primero en uso, luego siempre (para tareas en segundo plano). */
export async function pedirPermisosUbicacion(): Promise<'ok' | 'sin_permiso'> {
  try {
    const frente = await Location.requestForegroundPermissionsAsync();
    if (frente.status !== 'granted') return 'sin_permiso';
    const fondo = await Location.requestBackgroundPermissionsAsync();
    if (fondo.status !== 'granted') return 'sin_permiso';
    return 'ok';
  } catch {
    return 'sin_permiso';
  }
}

/** Inicia el tracking en segundo plano con servicio persistente en Android. */
export async function iniciarTracking(): Promise<boolean> {
  try {
    const permiso = await pedirPermisosUbicacion();
    if (permiso !== 'ok') return false;
    const activo = await Location.hasStartedLocationUpdatesAsync(TRACK_TASK);
    if (!activo) {
      await Location.startLocationUpdatesAsync(TRACK_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 30000,
        distanceInterval: 20,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Registrando tu viaje',
          notificationBody: 'Sumando kilometros a tu vehículo',
          notificationColor: '#1D4ED8',
        },
      });
    }
    await saveItem({ key: KEY_TRACKING, value: '1', json: false });
    return true;
  } catch {
    return false;
  }
}

/** Detiene el tracking en segundo plano. */
export async function detenerTracking(): Promise<void> {
  try {
    const activo = await Location.hasStartedLocationUpdatesAsync(TRACK_TASK);
    if (activo) await Location.stopLocationUpdatesAsync(TRACK_TASK);
  } catch {
    // Sin acción adicional.
  }
  await saveItem({ key: KEY_TRACKING, value: '0', json: false });
}

/** Vehículo favorito guardado, o el primero propio si no hay. */
export async function vehiculoFavorito(): Promise<Vehiculo | null> {
  try {
    const favId = await getItem({ key: KEY_FAV, json: false });
    const resp = await obtenerVehiculos();
    const lista: Vehiculo[] = resp?.data ?? [];
    return lista.find((v) => v.id === favId) ?? lista[0] ?? null;
  } catch {
    return null;
  }
}

export async function guardarFavorito(vehiculoId: string): Promise<void> {
  await saveItem({ key: KEY_FAV, value: vehiculoId, json: false });
}

/** Lee el log local de viajes recientes. */
export async function leerViajes(): Promise<ViajeLog[]> {
  try {
    const log = await getItem({ key: KEY_VIAJES, json: true });
    return Array.isArray(log) ? log : [];
  } catch {
    return [];
  }
}

async function guardarViaje(viaje: ViajeLog): Promise<void> {
  const log = await leerViajes();
  log.unshift(viaje);
  await saveItem({ key: KEY_VIAJES, value: log.slice(0, MAX_VIAJES_LOG), json: true });
}

function generarViajeId(): string {
  return 'viaje_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Cierra un viaje: suma la distancia al favorito, notifica y lo guarda en el log.
 */
export async function cerrarViaje(distKm: number): Promise<{ ok: boolean; km: number; vehiculo: string }> {
  const km = Math.round(distKm * 10) / 10;
  if (km < MIN_KM) return { ok: false, km: 0, vehiculo: '' };

  const fav = await vehiculoFavorito();
  if (!fav) return { ok: false, km: 0, vehiculo: '' };

  const ahora = new Date();
  const viaje: ViajeLog = {
    id: generarViajeId(),
    fecha: ahora.toISOString(),
    hora: ahora.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' }),
    km,
    vehiculo: fav.id,
    estado: 'sumado',
  };

  const resp = await sumarKilometraje(fav.id, km, viaje.id);
  if (resp?.error) {
    viaje.pendiente = true;
    await guardarViaje(viaje);
    return { ok: false, km, vehiculo: fav.id };
  }

  await guardarViaje(viaje);
  await notificarViaje(km, `${fav.marca} ${fav.modelo}`);
  return { ok: true, km, vehiculo: fav.id };
}

export async function deshacerViaje(id: string): Promise<boolean> {
  try {
    const log = await leerViajes();
    const viaje = log.find((v) => v.id === id);
    if (!viaje || viaje.estado !== 'sumado') return false;

    const resp = await obtenerVehiculos();
    const veh = (resp?.data ?? []).find((v: Vehiculo) => v.id === viaje.vehiculo);
    if (!veh) return false;

    const nuevoKm = Math.max(0, Math.round((Number(veh.kilometraje) - viaje.km) * 10) / 10);
    const upd = await actualizarVehiculo({ ...veh, kilometraje: nuevoKm });
    if (upd?.error) return false;

    viaje.estado = 'deshecho';
    await saveItem({ key: KEY_VIAJES, value: log, json: true });
    return true;
  } catch {
    return false;
  }
}

/** Mueve los KM de un viaje de un vehículo a otro. */
export async function moverViaje(id: string, nuevoVehiculoId: string): Promise<boolean> {
  try {
    const log = await leerViajes();
    const viaje = log.find((v) => v.id === id);
    if (!viaje || viaje.estado !== 'sumado' || viaje.vehiculo === nuevoVehiculoId) return false;

    const resp = await obtenerVehiculos();
    const lista: Vehiculo[] = resp?.data ?? [];
    const origen = lista.find((v) => v.id === viaje.vehiculo);
    const destino = lista.find((v) => v.id === nuevoVehiculoId);
    if (!destino) return false;

    if (origen) {
      const kmOrigen = Math.max(0, Math.round((Number(origen.kilometraje) - viaje.km) * 10) / 10);
      const upd = await actualizarVehiculo({ ...origen, kilometraje: kmOrigen });
      if (upd?.error) return false;
    }

    const suma = await sumarKilometraje(destino.id, viaje.km, generarViajeId());
    if (suma?.error) return false;

    viaje.vehiculo = destino.id;
    await saveItem({ key: KEY_VIAJES, value: log, json: true });
    return true;
  } catch {
    return false;
  }
}

/** Reenvía viajes pendientes de sincronizar (mismo viajeId: sin duplicados). */
export async function reintentarPendientes(): Promise<void> {
  try {
    const log = await leerViajes();
    let cambios = false;
    for (const viaje of log) {
      if (!viaje.pendiente || viaje.estado !== 'sumado') continue;
      const resp = await sumarKilometraje(viaje.vehiculo, viaje.km, viaje.id);
      if (!resp?.error) {
        delete viaje.pendiente;
        cambios = true;
        await notificarViaje(viaje.km, 'tu vehículo');
      }
    }
    if (cambios) await saveItem({ key: KEY_VIAJES, value: log, json: true });
  } catch {
    // Sin acción adicional.
  }
}
