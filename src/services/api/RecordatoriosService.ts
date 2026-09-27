import apiClient from '@/src/config/client/axios';
import getConfigAxios from '@/src/config/client/config';


const BASE_URL = '/recordatorios';

export interface RecordatorioVehiculo {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
}

export interface Recordatorio {
  mantenimientoId: string;
  nombre: string;
  tipo: string;
  fecha_recordatorio: string;
  km_recordatorio: number;
  diasRestantes: number;
  estado: 'vencido' | 'hoy' | 'proximo';
  vehiculo: RecordatorioVehiculo | null;
}

/**
 * Próximos vencimientos + vencidos del usuario (GET /api/recordatorios?dias=30).
 * El backend filtra, une el vehículo y ordena (vencidos primero).
 */
export async function getRecordatorios(dias: number = 60) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.get(`${BASE_URL}?dias=${dias}`, config);
    return { ...data, data: data?.data ?? [] };
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}
