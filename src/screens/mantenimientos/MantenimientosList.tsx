import { LoadingSpinner } from '@/src/components/shared';
import { Mantenimiento } from '@/src/interfaces/mantenimientos';
import { Vehiculo } from '@/src/interfaces/vehiculos';
import { getItem, saveItem } from '@/src/services';
import { getMantenimientos } from '@/src/services/api/MantenimientosService';
import formatFirebaseDate from '@/src/utils/formatFirebaseDate';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Dropdown } from 'react-native-element-dropdown';
import { Divider, Icon } from 'react-native-paper';

const hoy = new Date();

const sumarMeses = (fecha: Date, meses: number) => {
  const nuevaFecha = new Date(fecha);
  nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
  return nuevaFecha;
};

const MANTENIMIENTOS_VEHICLE = [
  { nombre: "Cambio de aceite de motor", intervaloKm: 5000, proximoCambio: sumarMeses(hoy, 6) },
  { nombre: "Cambio de filtro de aceite", intervaloKm: 5000, proximoCambio: sumarMeses(hoy, 6) },
  { nombre: "Cambio de filtro de aire", intervaloKm: 10000, proximoCambio: sumarMeses(hoy, 12) },
  { nombre: "Cambio de filtro de combustible", intervaloKm: 20000, proximoCambio: sumarMeses(hoy, 24) },
  { nombre: "Cambio de filtro de cabina", intervaloKm: 15000, proximoCambio: sumarMeses(hoy, 18) },
  { nombre: "Revisión y cambio de bujías", intervaloKm: 30000, proximoCambio: sumarMeses(hoy, 36) },
  { nombre: "Cambio de líquido de frenos", intervaloKm: 30000, proximoCambio: sumarMeses(hoy, 36) },
  { nombre: "Cambio de líquido de dirección hidráulica", intervaloKm: 40000, proximoCambio: sumarMeses(hoy, 48) },
  { nombre: "Cambio de líquido refrigerante", intervaloKm: 40000, proximoCambio: sumarMeses(hoy, 48) },
  { nombre: "Alineación y balanceo", intervaloKm: 10000, proximoCambio: sumarMeses(hoy, 12) },
  { nombre: "Rotación de llantas", intervaloKm: 10000, proximoCambio: sumarMeses(hoy, 12) },
  { nombre: "Inspección de frenos (pastillas/discos)", intervaloKm: 15000, proximoCambio: sumarMeses(hoy, 18) },
  { nombre: "Cambio de pastillas de freno", intervaloKm: 25000, proximoCambio: sumarMeses(hoy, 30) },
  { nombre: "Cambio de discos de freno", intervaloKm: 50000, proximoCambio: sumarMeses(hoy, 60) },
  { nombre: "Revisión del sistema de suspensión", intervaloKm: 20000, proximoCambio: sumarMeses(hoy, 24) },
  { nombre: "Cambio de amortiguadores", intervaloKm: 60000, proximoCambio: sumarMeses(hoy, 72) },
  { nombre: "Revisión del sistema de escape", intervaloKm: 20000, proximoCambio: sumarMeses(hoy, 24) },
  { nombre: "Inspección del sistema eléctrico", intervaloKm: 20000, proximoCambio: sumarMeses(hoy, 24) },
  { nombre: "Revisión del sistema de aire acondicionado", intervaloKm: 15000, proximoCambio: sumarMeses(hoy, 18) },
  { nombre: "Revisión de correas (alternador, distribución)", intervaloKm: 40000, proximoCambio: sumarMeses(hoy, 48) },
  { nombre: "Cambio de correa de distribución", intervaloKm: 80000, proximoCambio: sumarMeses(hoy, 96) },
  { nombre: "Cambio de batería", intervaloMeses: 36, proximoCambio: sumarMeses(hoy, 36) },
  { nombre: "Cambio de llantas", intervaloKm: 50000, proximoCambio: sumarMeses(hoy, 60) },
  { nombre: "Lavado de inyectores", intervaloKm: 30000, proximoCambio: sumarMeses(hoy, 36) },
  { nombre: "Inspección de fugas de fluidos", intervaloKm: 10000, proximoCambio: sumarMeses(hoy, 12) },
  { nombre: "Limpieza del radiador", intervaloKm: 40000, proximoCambio: sumarMeses(hoy, 48) },
  { nombre: "Revisión de luces y bombillas", intervaloKm: 10000, proximoCambio: sumarMeses(hoy, 12) },
  { nombre: "Revisión de sensores (oxígeno, temperatura)", intervaloKm: 30000, proximoCambio: sumarMeses(hoy, 36) },
  { nombre: "Revisión del cuerpo de aceleración", intervaloKm: 30000, proximoCambio: sumarMeses(hoy, 36) },
  { nombre: "Revisión del sistema de transmisión", intervaloKm: 40000, proximoCambio: sumarMeses(hoy, 48) }
];

function MantenimientoList() {
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<string>('');
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { vehicleId } = useLocalSearchParams();

  const [vehiculo, setVehiculo] = useState<Partial<Vehiculo>>({});

  useEffect(() => {
    getVehiculoLS();
    async function getVehiculoLS() {
      const carLS = await getItem({ key: 'vehiculo', json: true });
      setVehiculo(carLS);
    }
  }, []);

  useEffect(() => {
    saveVehiculoId();
    async function saveVehiculoId() {
      await saveItem({ key: 'vehiculoid', value: vehicleId, json: false });
    }
  }, [vehicleId]);

  useEffect(() => {
    obtenerMantenimientos();
    async function obtenerMantenimientos() {
      try {
        const response = await getMantenimientos(vehicleId.toString());
        setMantenimientos(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    }
  }, [vehicleId]);

  if (isLoading) {
    return <LoadingSpinner msg1='Obteniendo mantenimientos...' msg2='' />
  }

  return (
    <View style={{ marginBottom: 150 }}>

      {mantenimientos && mantenimientos.length > 1 ? (
        <>
          <Text style={styles.actualVehiculo}>{vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <Dropdown
              style={[styles.dropdown]}
              placeholder='Filtrar mantenimientos'
              data={MANTENIMIENTOS_VEHICLE}
              search
              maxHeight={400}
              labelField='nombre'
              valueField='nombre'
              value={selectedMantenimiento}
              searchPlaceholder='Buscar mantenimiento'
              onChange={item => {
                setSelectedMantenimiento(item.value);
              }}
            />

            <Text onPress={() => setSelectedMantenimiento('')} style={{ width: '15%', fontWeight: 'bold', fontSize: 20 }}>
              X
            </Text>
          </View>
          <Divider />
        </>
      ) : null}

      {!mantenimientos ? (
        <View style={{
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>

          <Icon
            size={180}
            source='car-wrench'
            color='#464b51'
          />

          <Text style={{ fontSize: 16, textAlign: 'center', color: '#000' }}>
            El vehículo <Text style={{ fontWeight: 'bold' }}>{vehiculo.placa}</Text> no tiene mantenimientos registrados en este momento
          </Text>

          <Text style={{
            fontSize: 14,
            color: '#5b6068',
            marginTop: 25,
            fontStyle: 'italic'
          }}>
            Toca el botón de abajo para registrar el primero.
          </Text>

        </View>
      ) : null}


      <FlatList
        data={mantenimientos}
        renderItem={({ item }) => (
          <View style={styles.mantenimientoContainer}>
            <Text
              style={[styles.tipoMantenimiento,
              item.tipo.toLowerCase() === 'mantenimiento preventivo' ? styles.tipoManPreven :
                item.tipo.toLowerCase() === 'mantenimiento correctivo' ? styles.tipoManCorrec :
                  styles.tipoManMejora
              ]}
            >
              {item.tipo.toLowerCase() === 'mantenimiento preventivo' ? '✅ ' :
                item.tipo.toLowerCase() === 'mantenimiento correctivo' ? '⚠️ ' : '🆙 '}
              TIPO: {item.tipo.toUpperCase()}
            </Text>
            <Text style={styles.nombre}>{item.nombre}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Realizado</Text>
                <Text style={styles.itemMantenimiento}> 🗓️ {formatFirebaseDate(item.createdAt, true)}</Text>
                <Text style={styles.itemMantenimiento}>⏲️ {item.kilometraje_actual} KM </Text>
              </View>

              <View>
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>🔔 Proxímo Cambio</Text>
                <Text style={styles.itemMantenimiento}> 🗓️ {item.fecha_recordatorio}</Text>
                <Text style={styles.itemMantenimiento}>⏲️ {item.km_recordatorio} KM </Text>

              </View>

            </View>
            <Divider />

            <Text style={styles.itemMantenimiento}>Costo: {item.costo_manoobra + item.costo_repuestos} </Text>

          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  actualVehiculo: {
    padding: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },

  nombre: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },

  tipoMantenimiento: {
    padding: 5,
    marginBlock: 6,
    fontSize: 12,
  },

  tipoManPreven: {
    backgroundColor: '#E6E6E6',
    color: '#171717',
  },

  tipoManCorrec: {
    backgroundColor: '#FBF1C3',
    color: '#171717',
  },

  tipoManMejora: {
    backgroundColor: '#aec3ff',
    color: '#171717',
  },

  itemMantenimiento: {
    fontSize: 14,
    marginBlock: 2,
  },

  mantenimientoContainer: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 8,
    margin: 10,
  },
  dropdown: {
    width: '85%',
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginLeft: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
});

export default MantenimientoList;
