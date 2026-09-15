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
    // La API responde 204 sin campo `data` cuando no hay registros.
    return { ...data, data: data?.data ?? [] };
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}

/**
 * Todos los mantenimientos del usuario logueado (una sola petición).
 * Requiere el endpoint GET /api/mantenimientos en el backend.
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

/**
 * Catálogo global de mantenimientos (GET /api/mantenimientos/lista).
 * Endpoint público: no requiere token.
 */
export async function getCatalogoMantenimientos() {
  try {
    const { data } = await apiClient.get(`${BASE_URL}/lista`);
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