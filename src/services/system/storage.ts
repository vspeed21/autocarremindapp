import AsyncStorage from '@react-native-async-storage/async-storage';


export async function saveItem({ key, value, json }: { key: string, value: any, json: boolean }) {
  const item = json ? JSON.stringify(value) : value;

  try {
    await AsyncStorage.setItem(key, item);
  } catch {
    // Sin acción adicional.
  }
}

export async function getItem({ key, json }: { key: string, json: boolean }) {

  try {
    const item = await AsyncStorage.getItem(key);
    return json ? JSON.parse(item ? item : 'adios') : item;

  } catch {
    // Sin acción adicional.
  }
}

export async function removeItem({ key }: { key: string }) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // Sin acción adicional.
  }
}
