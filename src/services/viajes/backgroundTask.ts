import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { getItem, saveItem } from '@/src/services/system/storage';
import { cerrarViaje, estadoInicial, evaluarFix, TRACK_TASK } from './trackingService';


/** Key donde persiste el estado del viaje (la tarea no tiene memoria). */
const KEY_ESTADO = 'viaje_estado';

/**
 * Tarea de ubicación en segundo plano: el SO la despierta con cada fix GPS.
 * Headless: solo AsyncStorage
 */
TaskManager.defineTask(TRACK_TASK, async ({ data, error }) => {
  try {
    if (error) return;
    const { locations } = data as { locations: Location.LocationObject[] };
    const loc = locations?.[0];
    if (!loc) return;

    const guardado = await getItem({ key: KEY_ESTADO, json: true });
    // Estados viejos (máquina por velocidad) no tienen origen: se reinician.
    const base = guardado && guardado.origen !== undefined ? guardado : estadoInicial();
    const fix = {
      lat: loc.coords.latitude,
      lon: loc.coords.longitude,
      t: loc.timestamp,
      acc: loc.coords.accuracy,
    };
    const { estado: nuevo, evento } = evaluarFix(fix, base, Date.now());

    if (evento === 'cerrado') {
      await cerrarViaje(nuevo.distKm);
      await saveItem({ key: KEY_ESTADO, value: estadoInicial(), json: true });
    } else {
      await saveItem({ key: KEY_ESTADO, value: nuevo, json: true });
    }
  } catch {
    // Sin acción adicional: la próxima ejecución retoma desde el disco.
  }
});
