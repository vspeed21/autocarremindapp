import { router } from 'expo-router';

import apiClient from '@/src/config/client/axios';
import getConfigAxios from '@/src/config/client/config';
import { removeItem } from '../system/storage';


const BASE_URL = '/auth';

export async function loginUser(body: any) {
  try {
    const { data } = await apiClient.post(`${BASE_URL}/login`, body);
    return data;
  } catch (error: any) {
    return error.response;
  }
}

export async function signUpUser(body: any) {
  try {
    const { data } = await apiClient.post(`${BASE_URL}/signup`, body);
    return data;
  } catch (error: any) {
    return error.response.data;
  }
}

/**
 * Valida el token guardado contra GET /api/auth/me.
 * Devuelve el cuerpo con { error, code, data: { uid, nombre, email, tipo, config } }.
 */
export async function getMe() {
  try {
    const config = await getConfigAxios();
    const { data } = await apiClient.get(`${BASE_URL}/me`, config);
    return data;
  } catch (error: any) {
    return error.response?.data ?? { error: true };
  }
}

export async function cerrarSesion() {
  try {
    await removeItem({ key: 'token' });
    router.replace('/auth/login');
  } catch {
    // Sin acción adicional.
  }
}