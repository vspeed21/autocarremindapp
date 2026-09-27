import { fechaFirebase } from '../firebase';

export interface MantenimientoResponse {
  error: boolean;
  code: number;
  cantidad: number;
  message: string;
  data: Mantenimiento[];
}

export interface MantenimientoTipo {
  nombre: string
  intervaloKm: number
  intervaloFecha: number
  aplicaA?: string
}

/**
 * Ítem del catálogo global (colección mantenimientos_lista en el backend).
 */
export interface MantenimientoCatalogo {
  id?: string
  nombre: string
  intervaloFechaDias: number
  intervaloKm: number
  intervaloMilla: number
  aplicaA?: string
}

export interface Mantenimiento {
  id: string;
  tipo: string;
  nombre: string;
  fecha: fechaFirebase;
  kilometraje_actual: number;
  fecha_recordatorio: fechaFirebase;
  km_recordatorio: number;
  tipo_repuestos: string;
  costo_repuestos: number;
  costo_manoobra: number;
  comprado: string;
  manoobra: string;
  vehiculo: string;
  uid: string;
  createdAt: fechaFirebase;
  updatedAt: fechaFirebase;
}

