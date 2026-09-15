import { LoadingSpinner } from '@/src/components/shared';
import { getItem, getMe } from '@/src/services';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, View } from 'react-native';

export default function Index() {

  useEffect(() => {
    validarAuth();
    async function validarAuth() {
      const havetokenLS = await getItem({ key: 'token', json: false });

      if (!havetokenLS) {
        router.replace('/auth/login');
        return;
      }

      // Valida el token contra el backend en vez de solo comprobar que exista.
      try {
        const sesion = await getMe();
        if (sesion && sesion.code === 200 && !sesion.error) {
          router.replace('/vehiculos');
        } else {
          router.replace('/auth/login');
        }
      } catch {
        router.replace('/auth/login');
      }
    }
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        source={require('../assets/images/logoacr.png')}
        width={200}
        height={173}
        style={{ width: 200, height: 173, marginBottom: 20 }}
      />
      <LoadingSpinner full={false} msg1='' msg2='' />
    </View>
  )
}
