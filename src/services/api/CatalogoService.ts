import apiClient from '@/src/config/client/axios';


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
}

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
