import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Divider, Text } from 'react-native-paper';

import { SimpleSkeleton } from '@/src/components/skeleton';
import { PlaceholderView } from '@/src/components/shared';
import { Vehiculo } from '@/src/interfaces/vehiculos';
import { formatearDistancia } from '@/src/helpers';
import { getCurrentUserInfo, getRecordatorios, obtenerVehiculos, saveItem } from '@/src/services';
import type { Recordatorio } from '@/src/services';

const DIAS = 30;

function textoEstado(item: Recordatorio): string {
  const d = item.diasRestantes;
  if (d < 0) return `Vencido · hace ${Math.abs(d)}d`;
  if (d === 0) return 'Vence hoy';
  return `En ${d} días`;
}

function esUrgente(item: Recordatorio): boolean {
  return item.estado === 'vencido' || item.estado === 'hoy';
}

function formatearFechaISO(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
}

const Recordatorios = () => {
  const [items, setItems] = useState<Recordatorio[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [unidad, setUnidad] = useState<string>('kilometros');
  const [isLoading, setIsLoading] = useState(true);

  const cargar = async () => {
    try {
      setIsLoading(true);
      // Endpoint dedicado: vencidos + próximos ya filtrados, unidos y ordenados.
      const [recResp, vehiculosResp, infoResp] = await Promise.all([
        getRecordatorios(DIAS),
        obtenerVehiculos(),
        getCurrentUserInfo(),
      ]);
      setItems(recResp?.data ?? []);
      setVehiculos(vehiculosResp?.data ?? []);
      if (infoResp && !infoResp.error && infoResp.config?.unidad) {
        setUnidad(infoResp.config.unidad);
      }
    } catch {
      // Sin acción adicional.
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  if (isLoading) {
    return (
      <>
        <SimpleSkeleton />
        <SimpleSkeleton />
      </>
    );
  }

  if (!items.length) {
    return (
      <PlaceholderView
        icon={{ source: 'bell-outline' }}
        message1='No tienes recordatorios por ahora'
        message2='Registra un mantenimiento y aquí verás su próximo cambio.'
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Próximos vencimientos</Text>
        <Text style={styles.headerSub}>Vencidos primero · próximos {DIAS} días · push diario 08:00 (FCM)</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.mantenimientoId}
        contentContainerStyle={{ paddingBottom: 110 }}
        renderItem={({ item }) => {
          const urgente = esUrgente(item);
          const vehiculoInfo = item.vehiculo
            ? vehiculos.find((v) => v.id === item.vehiculo?.id)
            : undefined;
          return (
            <View style={[styles.card, urgente ? styles.cardUrgente : styles.cardOk]}>
              <View style={styles.row}>
                <Text style={[styles.chip, urgente ? styles.chipUrgente : styles.chipOk]}>
                  {textoEstado(item)}
                </Text>
                <Text style={styles.placaMini}>{item.vehiculo?.placa ?? ''}</Text>
              </View>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.detalle}>
                {item.vehiculo ? `${item.vehiculo.marca} ${item.vehiculo.modelo}` : 'Vehículo'} · antes del {formatearFechaISO(item.fecha_recordatorio)} · {formatearDistancia(item.km_recordatorio, unidad)}
              </Text>
              <Text
                style={styles.ver}
                onPress={async () => {
                  if (vehiculoInfo) {
                    await saveItem({ key: 'vehiculo', json: true, value: vehiculoInfo });
                    router.push({ pathname: '/mantenimientos', params: { vehicleId: vehiculoInfo.id } });
                  }
                }}
              >
                Abrir vehículo →
              </Text>
            </View>
          );
        }}
      />
      <Divider />
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1D4ED8',
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  headerSub: {
    color: '#BFDBFE',
    fontSize: 12,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 10,
    padding: 14,
    borderWidth: 2,
    borderColor: '#D3DCE9',
    borderLeftWidth: 6,
    borderLeftColor: '#1D4ED8',
  },
  cardUrgente: {
    borderLeftColor: '#DC2626',
    backgroundColor: '#FFF5F5',
  },
  cardOk: {
    borderLeftColor: '#16A34A',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  chipUrgente: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  chipOk: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  placaMini: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#1E40AF',
  },
  nombre: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2A5C',
    marginTop: 8,
  },
  detalle: {
    fontSize: 13,
    color: '#5B6B7F',
    marginTop: 4,
  },
  ver: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
    marginTop: 8,
  },
});

export default Recordatorios;
