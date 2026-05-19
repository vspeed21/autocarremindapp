import AsyncStorage from '@react-native-async-storage/async-storage';


export async function saveItem({ key, value, json }: { key: string, value: any, json: boolean }) {
  const item = json ? JSON.stringify(value) : value;

  try {
    await AsyncStorage.setItem(key, item);
  } catch (error) {
    console.log('Error al guardar value en LS', error);
  }
}

export async function getItem({ key, json }: { key: string, json: boolean }) {

  try {
    const item = await AsyncStorage.getItem(key);
    return json ? JSON.parse(item ? item : 'adios') : item;

  } catch (error) {
    console.log('Error al obtener value en LS', error);
  }
}

export async function removeItem({ key }: { key: string }) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.log('Error al obtener value en LS', error);
  }
}
