import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';


import { LoadingSpinner } from '@/src/components/shared';
import { Vehiculo as IVehiculo } from '@/src/interfaces/vehiculos';
import { cerrarSesion, saveItem } from '@/src/services';
import { obtenerVehiculos } from '@/src/services/api/vehiculoServices';
import { router } from 'expo-router';
import { Button, Text } from 'react-native-paper';
import CrearVehiculoModal from './CrearVehiculoModal';
import Vehiculo from './Vehiculo';

function VehiculosListScreen() {
  const [showFormAddVehicle, setShowFormAddVehicle] = useState(false);

  const [vehiculoEditar, setVehiculoEditar] = useState(null as any | null);

  const [vehiculosList, setVehiculosList] = useState<IVehiculo[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    getVehiculos();

    async function getVehiculos() {
      try {
        const response = await obtenerVehiculos();
        setVehiculosList(response.data);

        setIsLoading(false);

      } catch (error) {
        console.log(error);
      }
    }
  }, [showFormAddVehicle])

  if (isLoading) {
    return <LoadingSpinner msg1='Obteniendo Vehículos...' msg2='Por favor espere' />
    // return <SimpleSkeleton />
  }

  return (
    <View>
      <CrearVehiculoModal
        showFormAddVehicle={showFormAddVehicle}
        setShowFormAddVehicle={setShowFormAddVehicle}
        vehicleEditar={vehiculoEditar}
        setVehicleEditar={setVehiculoEditar}
      />

      {vehiculosList.length ? (
        <Text style={{ textAlign: 'center', paddingBlock: 18, fontSize: 14, fontWeight: 'bold' }}>
          Tienes {vehiculosList.length} {vehiculosList.length === 1 ? 'vehículo registrado' : 'vehículos registrados'} en tu garaje
        </Text>
      ) : null}

      <View>
        <FlatList
          data={vehiculosList}
          ListEmptyComponent={() => <Text style={{ textAlign: 'center' }}>Aún no tienes vehículos en tu garaje. Agrega uno</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.containerVehicle}
              activeOpacity={0.7}
              onLongPress={() => {
                // Editar vehículo
                // console.log('Editar vehículo:', item.id);
                setShowFormAddVehicle(true);
                setVehiculoEditar(item);

              }}
              onPress={async () => {
                await saveItem({ key: 'vehiculo', json: true, value: item });
                router.push({ pathname: '/mantenimientos', params: { vehicleId: item.id } });
              }}
            >
              <Vehiculo vehiculo={item} />
            </TouchableOpacity>
          )}
        >

        </FlatList>
      </View>

      <Button
        onPress={() => cerrarSesion()}
      >
        Cerrar sesión
      </Button>

    </View>
  );

}

const styles = StyleSheet.create({
  containerVehicle: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 20,
    width: '95%',
    marginInline: 'auto',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,

    elevation: 2,
  }
});

export default VehiculosListScreen;
