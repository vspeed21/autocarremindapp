import apiClient from '@/src/config/client/axios';
import getConfigAxios from '@/src/config/client/config';


const BASE_URL = '/mantenimientos';

export async function agregarMantenimiento(body: any) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.post(`${BASE_URL}`, body, config);
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    return error.response.data;
  }
}

export async function getMantenimientos(id: string) {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.get(`${BASE_URL}/${id}`, config);
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    return error.response.data;
  }
}