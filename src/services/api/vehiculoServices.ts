import apiClient from '@/src/config/client/axios';
import getConfigAxios from '@/src/config/client/config';


const BASE_URL = '/vehiculos';

export async function crearVehiculo(body: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.post(`${BASE_URL}`, body, config);
    return data;
  } catch (error: any) {
    return error.response.data;
  }
}

export async function obtenerVehiculos() {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient(`${BASE_URL}`, config);
    return data;
  } catch (error: any) {
    return error.response.data;
  }
}

export async function actualizarVehiculo(body: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.put(`${BASE_URL}/${body.id}`, body, config);
    return data;
  } catch (error: any) {
    return error.response.data;
  }
}

export async function eliminarVehiculo(id: string) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.delete(`${BASE_URL}/${id}`, config);
    return data;
  } catch (error: any) {
    return error.response.data;
  }
}

export async function sumarKilometraje(vehiculoId: string, km: number, viajeId: string) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.patch(`${BASE_URL}/${vehiculoId}/kilometraje`, { km, viajeId }, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true };
  }
}
