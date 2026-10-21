import apiClient from '@/src/config/client/axios';
import getConfigAxios from '@/src/config/client/config';


export interface MarcaCatalogo {
  id: string;
  nombre: string;
}

export interface ModeloCatalogo {
  id: string;
  nombre: string;
  marcaId: string;
  marcaNombre?: string;
  year?: number;
  tipo?: string;
}

const BASE_URL = '/catalogo';

/**
 * Marcas del catálogo global (GET /api/marcas). Endpoint público.
 */
export async function getMarcas() {
  try {
    const { data } = await apiClient.get('/marcas');
    return { ...data, data: data?.data ?? [] };
  } catch {
    // Sin acción adicional: la UI usa el respaldo local.
    return { error: true, data: [] };
  }
}

/**
 * Modelos del catálogo global (GET /api/modelos[?marcaId=]). Endpoint público.
 */
export async function getModelos(marcaId?: string) {
  try {
    const url = marcaId ? `/modelos?marcaId=${encodeURIComponent(marcaId)}` : '/modelos';
    const { data } = await apiClient.get(url);
    return { ...data, data: data?.data ?? [] };
  } catch {
    // Sin acción adicional: la UI usa el respaldo local.
    return { error: true, data: [] };
  }
}

export async function getCatalogoMantenimientos() {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.get(BASE_URL, config);
    return { ...data, data: data?.data ?? [] };
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}

export async function crearMantenimientoCatalogo(body: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.post(BASE_URL, body, config);
    return { ...data, data: data?.data ?? [] };
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}

export async function actualizarMantenimientoCatalogo(body: any, id: string) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.put(`${BASE_URL}/${id}`, body, config);
    return { ...data, data: data?.data ?? [] };
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}

export async function eliminarMantenimientoCatalogo(id: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.delete(`${BASE_URL}/${id}`, config);
    return { ...data, data: data?.data ?? [] };
  } catch (error: any) {
    return error.response?.data ?? { error: true, data: [] };
  }
}
