import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';


import { SimpleSkeleton } from '@/src/components/skeleton';
import { diasRestantes, formatearMoneda, progresoMantenimiento } from '@/src/helpers';
import { Vehiculo as IVehiculo } from '@/src/interfaces/vehiculos';
import { getCurrentUserInfo, getDeviceToken, getPermisoNotificacion, getUserStats, obtenerVehiculos, getItem, removeItem, saveItem } from '@/src/services';
import type { UserStats } from '@/src/services';

import { PlaceholderView } from '@/src/components/shared';
import { CrearVehiculoModal, Vehiculo } from '@/src/components/vehiculos';
import { RESET } from '@/src/utils';


function VehiculosListScreen() {

  const [showFormAddVehicle, setShowFormAddVehicle] = useState<boolean>(false);
  const [vehiculoEditar, setVehiculoEditar] = useState<IVehiculo>(RESET.vehiculo);
  const [vehiculosList, setVehiculosList] = useState<IVehiculo[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [unidad, setUnidad] = useState<string>('kilometros');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const modalEstabaAbierto = useRef(false);

  const cargarVehiculos = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await obtenerVehiculos();
      const vehiculos: IVehiculo[] = response?.data ?? [];
      setVehiculosList(vehiculos);

        // Resumen agregado del backend: conteos, gasto y próximo por vehículo.
        const respStats = await getUserStats();
        setStats(!respStats?.error && respStats?.data ? (respStats.data as UserStats) : null);

        const info = await getCurrentUserInfo();
        if (info && !info.error && info.config?.unidad) {
          setUnidad(info.config.unidad);
        }
    } catch {
      // Sin acción adicional.
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Si se cambió la unidad en Más, recargar al volver a esta pantalla.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const cambio = await getItem({ key: 'unidad_cambiada', json: false });
        if (cambio) {
          await removeItem({ key: 'unidad_cambiada' });
          cargarVehiculos();
        }
      })();
    }, [cargarVehiculos])
  );

  // Carga inicial una sola vez.
  useEffect(() => {
    cargarVehiculos();
  }, [cargarVehiculos]);

  // Recargar solo al CERRAR el modal (tras crear/editar), no al abrirlo.
  useEffect(() => {
    if (modalEstabaAbierto.current && !showFormAddVehicle) {
      cargarVehiculos();
    }
    modalEstabaAbierto.current = showFormAddVehicle;
  }, [showFormAddVehicle, cargarVehiculos]);

  useEffect(() => {
    if (vehiculosList && vehiculosList.length >= 1) {
      getPermisoNotificaciones();
    }

    async function getPermisoNotificaciones() {
      try {
        await getPermisoNotificacion();
        await getDeviceToken();

      } catch {
        // Sin acción adicional.
      }
    }
  }, [vehiculosList]);

  const statsVehiculo = (vehicleId: string) =>
    stats?.porVehiculo.find((v) => v.vehicleId === vehicleId);

  const conteoPorVehiculo = (vehicleId: string) =>
    statsVehiculo(vehicleId)?.mantenimientos ?? 0;

  const progresoPorVehiculo = (vehicleId: string) => {
    const proximo = statsVehiculo(vehicleId)?.proximoRecordatorio ?? null;
    if (!proximo) return 12;
    return progresoMantenimiento(diasRestantes(proximo));
  };

  if (isLoading) {
    return (
      <>
        <SimpleSkeleton />
        <SimpleSkeleton />
      </>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <CrearVehiculoModal
        showFormAddVehicle={showFormAddVehicle}
        setShowFormAddVehicle={setShowFormAddVehicle}
        vehicleEditar={vehiculoEditar}
        setVehicleEditar={setVehiculoEditar}
        unidad={unidad}
      />

      {/* Hero de estadísticas */}
      <View style={styles.statsHero}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Vehículos</Text>
          <Text style={styles.statValue}>{stats?.vehiculos ?? vehiculosList.length}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Mantenimientos</Text>
          <Text style={styles.statValue}>{stats?.mantenimientos ?? 0}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Gasto total</Text>
          <Text style={[styles.statValue, styles.statGasto]}>{formatearMoneda(stats?.gastoTotal ?? 0)}</Text>
        </View>
      </View>

      <View style={{ marginBlock: 10 }}></View>

      {!vehiculosList || vehiculosList.length === 0 ? (
        <PlaceholderView
          icon={{ source: 'car-wrench', color: '#1D4ED8', size: 110 }}
          message1='Tu garaje está vacío'
          message2='Registra tu primer vehículo con el botón + y empieza a cuidar sus mantenimientos.'
        />
      ) : null}

      <View style={{ flex: 1 }}>
        <FlatList
          data={vehiculosList}
          contentContainerStyle={{ paddingBottom: 110 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.containerVehicle}
              activeOpacity={0.7}
              onLongPress={() => {
                // Editar vehículo
                setShowFormAddVehicle(true);
                setVehiculoEditar(item);

              }}
              onPress={async () => {
                await saveItem({ key: 'vehiculo', json: true, value: item });
                router.push({ pathname: '/mantenimientos', params: { vehicleId: item.id } });
              }}
            >
              <Vehiculo
                vehiculo={item}
                conteoMantenimientos={conteoPorVehiculo(item.id)}
                progreso={progresoPorVehiculo(item.id)}
                unidad={unidad}
              />
            </TouchableOpacity>
          )}
        >

        </FlatList>
      </View>

    </View>
  );

}

const styles = StyleSheet.create({
  statsHero: {
    flexDirection: 'row',
    backgroundColor: '#1D4ED8',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#BFDBFE',
  },
  statValue: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statGasto: {
    color: '#FECACA',
    fontSize: 16,
  },
  hintBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
    textAlign: 'center',
  },
  containerVehicle: {
    width: '95%',
    marginInline: 'auto',
    marginBottom: 14,
  }
});

export default VehiculosListScreen;
