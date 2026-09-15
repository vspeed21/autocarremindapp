import apiClient from '@/src/config/client/axios';
import getConfigAxios from '@/src/config/client/config';


const BASE_URL = '/combustible';

export interface Tanqueada {
  id: string;
  vehiculo: string;
  uid?: string;
  fecha: { _seconds: number; _nanoseconds: number } | string;
  km: number;
  galones: number;
  costo: number;
  lleno: boolean;
}

export async function getTanqueadas(vehiculoId?: string) {
  try {
    const config = await getConfigAxios();
    const url = vehiculoId ? `${BASE_URL}?vehiculoId=${encodeURIComponent(vehiculoId)}` : BASE_URL;
    const { data } = await apiClient.get(url, config);
    return { ...data, data: data?.data ?? [] };
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}

export async function agregarTanqueada(body: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.post(`${BASE_URL}`, body, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true };
  }
}

export async function eliminarTanqueada(id: string) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.delete(`${BASE_URL}/${id}`, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true };
  }
}
