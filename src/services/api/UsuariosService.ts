import apiClient from '@/src/config/client/axios';
import getConfigAxios from '@/src/config/client/config';


const BASE_URL = '/usuarios';

export interface StatsPorVehiculo {
  vehicleId: string;
  placa: string;
  marca: string;
  modelo: string;
  mantenimientos: number;
  gasto: number;
  proximoRecordatorio: string | null;
}

export interface UserStats {
  vehiculos: number;
  mantenimientos: number;
  gastoTotal: number;
  porVehiculo: StatsPorVehiculo[];
}

export async function updateUserToken(body: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.patch(`${BASE_URL}/token`, body, config);
    return data;
  } catch (error: any) {
    return error.response;
  }
}

/**
 * Persiste la unidad de medida en el backend (PATCH /api/usuarios/config).
 */
export async function updateUserConfig(body: { unidad: string }) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.patch(`${BASE_URL}/config`, body, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true };
  }
}

/**
 * Estadísticas agregadas del usuario (GET /api/usuarios/stats).
 */
export async function getUserStats() {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.get(`${BASE_URL}/stats`, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true };
  }
}

export async function getCurrentUserInfo() {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.get(`${BASE_URL}/info`, config);
    return data;
  } catch (error: any) {
    return error.response;
  }
}