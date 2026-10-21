import apiClient from '@/src/config/client/axios';
import getConfigAxios from '@/src/config/client/config';


const BASE_URL = '/mantenimientos';

export async function agregarMantenimiento(body: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.post(`${BASE_URL}`, body, config);
    return data;
  } catch (error: any) {
    return error.response.data;
  }
}

export async function getMantenimientos(id: string) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.get(`${BASE_URL}/${id}`, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}

/**
 * Todos los mantenimientos del usuario logueado (una sola petición).
 */
export async function getMisMantenimientos() {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.get(`${BASE_URL}`, config);
    return { ...data, data: data?.data ?? [] };
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}

export async function actualizarMantenimiento(id: string, body: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.put(`${BASE_URL}/${id}`, body, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true };
  }
}

export async function eliminarMantenimiento(id: string) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.delete(`${BASE_URL}/${id}`, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true };
  }
}