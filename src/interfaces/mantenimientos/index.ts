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
}

export interface Mantenimiento {
  id: string;
  tipo: string;
  nombre: string;
  fecha: Date;
  kilometraje_actual: number;
  fecha_recordatorio: string;
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

