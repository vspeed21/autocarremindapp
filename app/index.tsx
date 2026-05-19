import { LoadingSpinner } from '@/src/components/shared';
import { getItem } from '@/src/services';
import { router } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {

  useEffect(() => {
    validarAuth();
    async function validarAuth() {
      const havetokenLS = await getItem({ key: 'token', json: false });

      if (havetokenLS) {
        router.replace('/vehiculos');
      } else {
        router.replace('/auth/login');
      }
    }
  }, []);

  return <LoadingSpinner msg1='Cargando...' msg2='' />
}
