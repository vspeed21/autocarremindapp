import { formatearKilometraje } from '@/src/helpers';
import { Vehiculo as IVehiculo } from '@/src/interfaces/vehiculos';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';


interface Props {
  vehiculo: IVehiculo
}

function Vehiculo({ vehiculo }: Props) {
  return (
    <View style={styles.containerVehicle}>

      <View style={styles.subContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image
            source={{ uri: 'https://firebasestorage.googleapis.com/v0/b/auto-care-remind.firebasestorage.app/o/app%2Fvehiculo.jpg?alt=media&token=7ce42b6f-a7c0-4b61-9339-f8fc57387c57' }}
            width={30}
            height={30}
            loadingIndicatorSource={{ uri: 'https://via.placeholder.com/100' }}
          />
          <Text style={styles.placa}>{vehiculo.placa}</Text>
        </View>

        {/* <View style={{ flexDirection: 'row', gap: 4 }}>
          <Text style={{ textDecorationLine: 'underline', fontSize: 12 }}>Ver mantenimientos</Text>
          <Icon size={20} source='file' />
        </View> */}
      </View>


      <View>

        <Text style={{ fontSize: 18, marginBlock: 8 }}>{vehiculo.marca} {vehiculo.modelo}</Text>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Icon size={25} source='calendar' />
            <Text>Año: {vehiculo.year}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Icon size={25} source='car-speed-limiter' />
            <Text>{formatearKilometraje(vehiculo.kilometraje)}</Text>
          </View>
        </View>

      </View>
    </View>
  )
}

export default Vehiculo

const styles = StyleSheet.create({
  containerVehicle: {
    gap: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.40,
    shadowRadius: 4.65,

    elevation: 15,
  },
  placa: {
    fontWeight: 'bold',
    fontSize: 18
  },
  subContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }
});

