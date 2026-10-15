import * as Notification from 'expo-notifications';
import { updateUserToken } from '../api/UsuariosService';

export async function getPermisoNotificacion() {
  try {
    await Notification.requestPermissionsAsync();
  } catch {
    // Sin acción adicional.
  }
}

export async function getDeviceToken() {
  try {
    const token = await Notification.getDevicePushTokenAsync();
    const body = { token: token.data };

    await updateUserToken(body);

  } catch {
    // Sin acción adicional.
  }
}

export async function notificarViaje(km: number, vehiculo: string) {
  try {
    await Notification.scheduleNotificationAsync({
      content: {
        title: 'Viaje registrado',
        body: `Se sumaron ${km} km a tu ${vehiculo}`,
      },
      trigger: null,
    });
  } catch {
    // Sin acción adicional.
  }
}
