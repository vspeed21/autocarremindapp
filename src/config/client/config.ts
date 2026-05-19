import { getItem } from '@/src/services';

async function getConfigAxios() {
  // Obtener token de LS.
  const token = await getItem({ key: 'token', json: false });

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  }

  return config;

}

export default getConfigAxios;
