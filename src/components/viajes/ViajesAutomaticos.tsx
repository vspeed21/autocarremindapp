import { AlertaMessage } from '@/src/components/shared';
import { Vehiculo } from '@/src/interfaces/vehiculos';
import { getItem, obtenerVehiculos } from '@/src/services';
import {
  deshacerViaje,
  detenerTracking,
  guardarFavorito,
  iniciarTracking,
  KEY_FAV,
  KEY_TRACKING,
  leerViajes,
  moverViaje,
  ViajeLog,
} from '@/src/services/viajes/trackingService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, Switch, Text } from 'react-native-paper';


function ViajesAutomaticos() {
  const [trackingOn, setTrackingOn] = useState(false);
  const [cambiandoTracking, setCambiandoTracking] = useState(false);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [favoritoId, setFavoritoId] = useState('');
  const [viajes, setViajes] = useState<ViajeLog[]>([]);
  const [moviendoId, setMoviendoId] = useState('');
  const [alerta, setAlerta] = useState({ message: '', error: false });

  function mostrarAlerta(message: string, error: boolean) {
    setAlerta({ message, error });
    setTimeout(() => {
      setAlerta({ message: '', error: false });
    }, 3000);
  }

  async function cargarViajes() {
    try {
      const [respVeh, favId, log, track] = await Promise.all([
        obtenerVehiculos(),
        getItem({ key: KEY_FAV, json: false }),
        leerViajes(),
        getItem({ key: KEY_TRACKING, json: false }),
      ]);
      const lista: Vehiculo[] = respVeh?.data ?? [];
      setVehiculos(lista);
      setFavoritoId(favId || lista[0]?.id || '');
      setViajes(log);
      setTrackingOn(track === '1');
    } catch {
      // Sin acción adicional.
    }
  }

  useFocusEffect(
    useCallback(() => {
      cargarViajes();
    }, [])
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Viajes automáticos</Text>
      <AlertaMessage alerta={alerta} />
      <View style={styles.switchRow}>
        <Text style={styles.label}>Detectar mis viajes</Text>
        <Switch
          value={trackingOn}
          disabled={cambiandoTracking}
          onValueChange={async (valor) => {
            setCambiandoTracking(true);
            if (valor) {
              const ok = await iniciarTracking();
              if (ok) {
                setTrackingOn(true);
                mostrarAlerta('Viajes automáticos activados', false);
              } else {
                mostrarAlerta('Activa el permiso de ubicación para usar auto-KM', true);
              }
            } else {
              await detenerTracking();
              setTrackingOn(false);
              mostrarAlerta('Viajes automáticos desactivados', false);
            }
            setCambiandoTracking(false);
          }}
        />
      </View>

      {vehiculos.length > 1 ? (
        <View>
          <Text style={styles.label}>Vehículo favorito (suma automática)</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            containerStyle={styles.dropdownList}
            itemTextStyle={styles.dropdownItemText}
            iconColor='#1D4ED8'
            placeholder='Selecciona tu vehículo'
            data={vehiculos.map((v) => ({ id: v.id, nombre: `${v.marca} ${v.modelo} · ${v.placa}` }))}
            labelField='nombre'
            valueField='id'
            value={favoritoId}
            onChange={async (item) => {
              setFavoritoId(item.id);
              await guardarFavorito(item.id);
            }}
            maxHeight={400}
          />
        </View>
      ) : null}

      <Text style={[styles.label, { marginTop: vehiculos.length > 1 ? 12 : 0 }]}>Mis viajes</Text>
      {viajes.length === 0 ? (
        <Text style={styles.emptyTrips}>Aún no hay viajes registrados.</Text>
      ) : (
        viajes.map((viaje) => {
          const nombreVeh = vehiculos.find((v) => v.id === viaje.vehiculo);
          return (
            <View key={viaje.id} style={styles.tripRow}>
              <View style={styles.tripInfo}>
                <Text style={styles.tripTitle}>
                  {viaje.km.toFixed(1)} KM → {nombreVeh ? `${nombreVeh.marca} ${nombreVeh.modelo}` : '—'}
                </Text>
                <Text style={styles.tripSub}>
                  {viaje.fecha.slice(0, 10)} {viaje.hora}{viaje.estado === 'deshecho' ? ' · deshecho' : ''}
                </Text>
              </View>
              {viaje.estado === 'sumado' ? (
                <View style={styles.tripActions}>
                  {moviendoId === viaje.id ? (
                    <Dropdown
                      style={[styles.dropdown, styles.moveDropdown]}
                      placeholderStyle={styles.dropdownPlaceholder}
                      selectedTextStyle={styles.dropdownSelectedText}
                      containerStyle={styles.dropdownList}
                      itemTextStyle={styles.dropdownItemText}
                      iconColor='#1D4ED8'
                      placeholder='Mover a…'
                      data={vehiculos.filter(v => v.id !== viaje.vehiculo).map((v) => ({ id: v.id, nombre: `${v.marca} ${v.modelo}` }))}
                      labelField='nombre'
                      valueField='id'
                      value=''
                      onChange={async (item) => {
                        const ok = await moverViaje(viaje.id, item.id);
                        mostrarAlerta(ok ? 'Viaje movido correctamente' : 'No se pudo mover el viaje', !ok);
                        setMoviendoId('');
                        cargarViajes();
                      }}
                      maxHeight={400}
                    />
                  ) : (
                    <Button
                      mode='text'
                      compact
                      textColor='#1D4ED8'
                      onPress={() => setMoviendoId(viaje.id)}
                    >
                      Mover
                    </Button>
                  )}
                  <Button
                    mode='text'
                    compact
                    textColor='#DC2626'
                    onPress={async () => {
                      const ok = await deshacerViaje(viaje.id);
                      mostrarAlerta(ok ? 'Viaje deshecho' : 'No se pudo deshacer el viaje', !ok);
                      cargarViajes();
                    }}
                  >
                    Deshacer
                  </Button>
                </View>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D3DCE9',
    marginHorizontal: 12,
    marginTop: 10,
    padding: 14,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#1D4ED8',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2A5C',
    marginBottom: 6,
  },
  dropdown: {
    height: 54,
    borderColor: '#1D4ED8',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#F7F9FD',
  },
  dropdownPlaceholder: {
    color: '#5B6B7F',
    fontSize: 14,
  },
  dropdownSelectedText: {
    color: '#0F2A5C',
    fontWeight: '700',
    fontSize: 14,
  },
  dropdownList: {
    borderRadius: 14,
    borderColor: '#D3DCE9',
  },
  dropdownItemText: {
    color: '#0F2A5C',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyTrips: {
    fontSize: 13,
    color: '#5B6B7F',
  },
  tripRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5EAF2',
    paddingVertical: 8,
  },
  tripInfo: {
    marginBottom: 2,
  },
  tripTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2A5C',
  },
  tripSub: {
    fontSize: 12,
    color: '#5B6B7F',
  },
  tripActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moveDropdown: {
    flex: 1,
    height: 44,
    marginRight: 4,
  },
});

export default ViajesAutomaticos;
