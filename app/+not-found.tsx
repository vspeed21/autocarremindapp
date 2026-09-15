import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';

function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '¡Oops!' }} />

      <View style={styles.container}>

        <Icon
          size={100}
          source='car-emergency'
        />

        <Text style={styles.title}>Parece que intentas visitar un ruta que no existe o fue movida.</Text>

        <Link replace href='/(tabs)/vehiculos' style={styles.link}>
          <Text style={styles.linkText}>Volver a mi garaje</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});

export default NotFoundScreen;
