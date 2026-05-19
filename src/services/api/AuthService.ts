import { router } from 'expo-router';

import apiClient from '@/src/config/client/axios';
import { removeItem } from '../system/storage';


const BASE_URL = '/auth';

export async function loginUser(body: any) {
  try {
    const { data } = await apiClient.post(`${BASE_URL}/login`, body);
    return data;
  } catch (error: any) {
    console.log('ERROR SERVICE');
    return error.response;
  }
}

export async function signUpUser(body: any) {
  try {
    const { data } = await apiClient.post(`${BASE_URL}/signup`, body);
    return data;
  } catch (error: any) {
    console.log(error.response.data);
    return error.response.data;
  }
}

export async function cerrarSesion() {
  try {
    await removeItem({ key: 'token' });
    router.replace('/auth/login');
  } catch (error: any) {
    console.log(error);
  }
}