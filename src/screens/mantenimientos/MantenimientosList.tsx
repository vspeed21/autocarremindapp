import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';


import { SimpleSkeleton } from '@/src/components/skeleton';
import { AlertaMessage } from '@/src/components/shared';
import { Mantenimiento } from '@/src/interfaces/mantenimientos';
import { Vehiculo } from '@/src/interfaces/vehiculos';
// GRÁFICAS v2: re-agregar fechaToDate a este import al reactivar las gráficas (NO BORRAR).
import { estadoMantenimiento, formatearDistancia, formatearMoneda, gastoTotalMantenimientos } from '@/src/helpers';
import { eliminarMantenimiento, getCatalogoMantenimientos, getCurrentUserInfo, getItem, getMantenimientos, saveItem } from '@/src/services';
import formatFirebaseDate from '@/src/utils/formatFirebaseDate';

import { Dropdown } from 'react-native-element-dropdown';
import { Divider, Icon } from 'react-native-paper';

const hoy = new Date();

/*
 * GRÁFICAS v2 — EN PAUSA, NO BORRAR.
const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
 * FIN GRÁFICAS v2
 */

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

function capitalizar(texto: string) {
  if (!texto) return '—';
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function MantenimientoListScreen() {
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<string>('');
  const [catalogo, setCatalogo] = useState<{ nombre: string }[]>(MANTENIMIENTOS_VEHICLE);
  // GRÁFICAS v2 — EN PAUSA, NO BORRAR:
  // const [mostrarGrafica, setMostrarGrafica] = useState<boolean>(false);
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unidad, setUnidad] = useState<string>('kilometros');
  const [alerta, setAlerta] = useState({ message: '', error: false });

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
    getCatalogo();
    async function getCatalogo() {
      // Catálogo desde el backend; si falla, se usa la lista local de respaldo.
      const response = await getCatalogoMantenimientos();
      if (response && Array.isArray(response.data) && response.data.length > 0) {
        setCatalogo(response.data);
      }
    }
  }, []);

  useEffect(() => {
    saveVehiculoId();
    async function saveVehiculoId() {
      await saveItem({ key: 'vehiculoid', value: vehicleId ? vehicleId : '1', json: false });
    }
  }, [vehicleId]);

  useEffect(() => {
    obtenerMantenimientos();
    async function obtenerMantenimientos() {
      try {
        const response = await getMantenimientos(vehicleId.toString());
        // La API responde 204 sin campo `data` cuando no hay registros.
        setMantenimientos(response?.data ?? []);
        const info = await getCurrentUserInfo();
        if (info && !info.error && info.config?.unidad) {
          setUnidad(info.config.unidad);
        }
        setIsLoading(false);
      } catch {
        // Sin acción adicional.
        setIsLoading(false);
      }
    }
  }, [vehicleId]);

  // Recarga silenciosa al volver a la pantalla (tras crear/editar/eliminar).
  const recargar = useCallback(async () => {
    try {
      const response = await getMantenimientos(vehicleId.toString());
      setMantenimientos(response?.data ?? []);
      const info = await getCurrentUserInfo();
      if (info && !info.error && info.config?.unidad) {
        setUnidad(info.config.unidad);
      }
    } catch {
      // Sin acción adicional.
    }
  }, [vehicleId]);

  useFocusEffect(
    useCallback(() => {
      recargar();
    }, [recargar])
  );

  function mostrarAlerta(message: string, error: boolean) {
    setAlerta({ message, error });
    setTimeout(() => {
      setAlerta({ message: '', error: false });
    }, 3000);
  }

  function onLongPressMantenimiento(item: Mantenimiento) {
    Alert.alert(
      item.nombre,
      '¿Qué deseas hacer con este mantenimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => confirmarEliminar(item) },
        { text: 'Editar', onPress: () => editarMantenimiento(item) },
      ]
    );
  }

  async function editarMantenimiento(item: Mantenimiento) {
    await saveItem({ key: 'mantenimiento_editar', json: true, value: item });
    router.push({ pathname: '/mantenimientos/crear/[id]', params: { id: item.vehiculo, editar: item.id } });
  }

  function confirmarEliminar(item: Mantenimiento) {
    Alert.alert(
      'Eliminar mantenimiento',
      `Se eliminará "${item.nombre}". Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(item) },
      ]
    );
  }

  async function eliminar(item: Mantenimiento) {
    const response = await eliminarMantenimiento(item.id);
    if (response?.error) {
      mostrarAlerta(response.message || 'No se pudo eliminar el mantenimiento', true);
      return;
    }
    mostrarAlerta('Mantenimiento eliminado correctamente', false);
    recargar();
  }

  const mantenimientosFiltrados = selectedMantenimiento
    ? mantenimientos.filter((m) => m.nombre === selectedMantenimiento)
    : mantenimientos;

  const gastoVehiculo = gastoTotalMantenimientos(mantenimientosFiltrados);

  const proximoTexto = (() => {
    if (!mantenimientosFiltrados.length) return '—';
    const estados = mantenimientosFiltrados.map((m) => estadoMantenimiento(m.fecha_recordatorio));
    const vencido = estados.find((e) => e.urgente && e.texto.startsWith('Vencido'));
    if (vencido) return vencido.texto;
    const urgente = estados.find((e) => e.urgente);
    if (urgente) return urgente.texto;
    return estados[0]?.texto ?? '—';
  })();

  /*
   * GRÁFICAS v2 — EN PAUSA, NO BORRAR.
  const gastosMensuales = (() => {
    const actual = new Date();
    const meses: { key: string; label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(actual.getFullYear(), actual.getMonth() - i, 1);
      meses.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: MESES_CORTO[d.getMonth()],
        total: 0,
      });
    }
    mantenimientos.forEach((m) => {
      const fecha = fechaToDate(m.fecha);
      if (!fecha) return;
      const mes = meses.find((x) => x.key === `${fecha.getFullYear()}-${fecha.getMonth()}`);
      if (mes) mes.total += (Number(m.costo_manoobra) || 0) + (Number(m.costo_repuestos) || 0);
    });
    return meses;
  })();
  const maxGastoMes = Math.max(...gastosMensuales.map((x) => x.total), 1);
   * FIN GRÁFICAS v2
   */

  if (isLoading) {
    return (
      <>
        <SimpleSkeleton />
        <SimpleSkeleton />
      </>
    )
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>

      {/* Resumen del vehículo: solo si hay mantenimientos registrados */}
      {mantenimientos.length > 0 ? (
        <View style={styles.statsHero} accessibilityLabel='Resumen del vehículo'>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Mantenimientos</Text>
            <Text style={styles.statValue}>{mantenimientosFiltrados.length}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Gasto vehículo</Text>
            <Text style={[styles.statValue, styles.statGasto]}>{formatearMoneda(gastoVehiculo)}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Próximo</Text>
            <Text style={[styles.statValue, styles.statProximo]} numberOfLines={1}>{proximoTexto}</Text>
          </View>
        </View>
      ) : null}

      {mantenimientos && mantenimientos.length >= 1 ? (
        <>
          <Text style={styles.actualVehiculo}>{vehiculo.marca} {vehiculo.modelo} - {vehiculo.placa}</Text>
          <Text style={styles.hint}>Mantén presionado un mantenimiento para editarlo o eliminarlo</Text>
          {/*
            GRÁFICAS v2 — EN PAUSA, NO BORRAR.
            Mini gráfica mensual por vehículo. Para reactivar: quitar este comentario
            y restaurar el estado mostrarGrafica, MESES_CORTO, gastosMensuales y fechaToDate.
          <Text style={styles.toggleGrafica} onPress={() => setMostrarGrafica((v) => !v)}>
            {mostrarGrafica ? 'Ocultar gráfica mensual ▲' : 'Ver gráfica mensual ▼'}
          </Text>
          {mostrarGrafica ? (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Gasto del vehículo por mes</Text>
              {gastosMensuales.map((mes) => (
                <View key={mes.key} style={styles.barRow}>
                  <Text style={styles.barLabel}>{mes.label}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${mes.total ? Math.max(5, Math.round((mes.total / maxGastoMes) * 100)) : 0}%` }]} />
                  </View>
                  <Text style={styles.barValue}>{formatearMoneda(mes.total)}</Text>
                </View>
              ))}
            </View>
          ) : null}
          FIN GRÁFICAS v2
          */}
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownSelectedText}
              inputSearchStyle={styles.dropdownSearch}
              containerStyle={styles.dropdownList}
              itemTextStyle={styles.dropdownItemText}
              iconColor='#1D4ED8'
              placeholder='Filtrar mantenimientos'
              data={catalogo}
            search
            maxHeight={400}
            labelField='nombre'
            valueField='nombre'
            value={selectedMantenimiento}
            searchPlaceholder='Buscar mantenimiento'
            onChange={item => {
              setSelectedMantenimiento(item.nombre);
            }}
          />
          <Divider />
        </>
      ) : null}

      {mantenimientos.length > 0 && mantenimientosFiltrados.length === 0 ? (
        <View style={styles.filterEmptyContainer}>

          <View style={styles.emptyIconBadge}>
            <Icon
              size={90}
              source='magnify'
              color='#1D4ED8'
            />
          </View>

          <Text style={styles.emptyTitle}>
            Sin resultados para “{selectedMantenimiento}”
          </Text>

          <Text style={styles.emptySubtitle}>
            Este vehículo no tiene mantenimientos de ese tipo registrados.
          </Text>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSelectedMantenimiento('')}
            activeOpacity={0.8}
          >
            <Text style={styles.clearButtonText}>Limpiar filtro</Text>
          </TouchableOpacity>

        </View>
      ) : null}

      {!mantenimientos || mantenimientos.length === 0 ? (
        <View style={styles.emptyContainer}>

          <View style={styles.emptyIconBadge}>
            <Icon
              size={110}
              source='car-wrench'
              color='#1D4ED8'
            />
          </View>

          <Text style={styles.emptyTitle}>
            Sin mantenimientos por aquí
          </Text>

          <Text style={styles.emptySubtitle}>
            <Text style={styles.emptyTitleBold}>{vehiculo.placa}</Text> aún no tiene historial. Toca + para registrar el primero y activar sus recordatorios.
          </Text>

        </View>
      ) : null}


      <AlertaMessage alerta={alerta} />

      {mantenimientosFiltrados.map((item) => {
          const estado = estadoMantenimiento(item.fecha_recordatorio);
          const total = (Number(item.costo_manoobra) || 0) + (Number(item.costo_repuestos) || 0);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.mantenimientoContainer}
              activeOpacity={0.95}
              delayLongPress={400}
              onLongPress={() => onLongPressMantenimiento(item)}
            >
              <View style={styles.chipsRow}>
                <Text style={[styles.estadoChip, estado.urgente ? styles.estadoUrgente : styles.estadoOk]}>
                  {estado.texto}
                </Text>
              </View>
              <Text style={styles.nombre}>{item.nombre}</Text>

              <View style={styles.columns}>
                <View style={styles.column}>
                  <Text style={styles.columnTitle}>Realizado</Text>
                  <Text style={styles.itemMantenimiento}> 🗓️ {formatFirebaseDate(item.fecha, true)}</Text>
                  <Text style={styles.itemMantenimiento}>⏲️ {formatearDistancia(item.kilometraje_actual, unidad)} </Text>
                </View>

                <View style={styles.column}>
                  <Text style={styles.columnTitle}>🔔 Próximo cambio</Text>
                  <Text style={styles.itemMantenimiento}> 🗓️ {formatFirebaseDate(item.fecha_recordatorio, true)}</Text>
                  <Text style={styles.itemMantenimiento}>⏲️ {formatearDistancia(item.km_recordatorio, unidad)} </Text>

                </View>

              </View>
              <Divider />

              <Text style={styles.detalleLine}>
                Repuestos <Text style={styles.detalleBold}>{capitalizar(item.tipo_repuestos)}</Text>
                {'  '}· Comprado en <Text style={styles.detalleBold}>{item.comprado || '—'}</Text>
                {'  '}· Taller <Text style={styles.detalleBold}>{item.manoobra || '—'}</Text>
              </Text>
              <Text style={styles.itemMantenimiento}>
                Mano obra {formatearMoneda(item.costo_manoobra)} + Rep. {formatearMoneda(item.costo_repuestos)}
              </Text>
              <Text style={styles.costoTotal}>Total: {formatearMoneda(total)}</Text>

            </TouchableOpacity>
          );
        })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },
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
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statGasto: {
    color: '#FECACA',
    fontSize: 15,
  },
  statProximo: {
    fontSize: 13,
  },
  actualVehiculo: {
    padding: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },

  hint: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 4,
  },

  toggleGrafica: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 4,
  },

  // GRÁFICAS v2 — estilos reservados, NO BORRAR.
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginHorizontal: 10,
    marginTop: 4,
    marginBottom: 6,
    padding: 12,
    borderWidth: 2,
    borderColor: '#D3DCE9',
  },

  chartTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F2A5C',
    marginBottom: 2,
  },

  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },

  barLabel: {
    width: 32,
    fontSize: 11,
    fontWeight: '700',
    color: '#5B6B7F',
    textTransform: 'capitalize',
  },

  barTrack: {
    flex: 1,
    height: 12,
    backgroundColor: '#E2E8F2',
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#D3DCE9',
    overflow: 'hidden',
  },

  barFill: {
    height: '100%',
    backgroundColor: '#1D4ED8',
    borderRadius: 99,
  },

  barValue: {
    width: 62,
    fontSize: 11,
    fontWeight: '800',
    color: '#0F2A5C',
    textAlign: 'right',
  },

  clearButton: {
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginTop: 14,
  },

  clearButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  filterEmptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
    marginHorizontal: 12,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D3DCE9',
  },

  emptyIconBadge: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    color: '#0F2A5C',
  },

  emptyTitleBold: {
    fontWeight: '900',
    color: '#1D4ED8',
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#5B6B7F',
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  nombre: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBlock: 6,
  },

  columns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  column: {},

  columnTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },

  estadoChip: {
    padding: 5,
    fontSize: 12,
    fontWeight: 'bold',
    borderRadius: 6,
    overflow: 'hidden',
  },

  estadoUrgente: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },

  estadoOk: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },

  itemMantenimiento: {
    fontSize: 14,
    marginBlock: 2,
  },

  detalleLine: {
    fontSize: 13,
    color: '#334155',
    marginTop: 8,
  },

  detalleBold: {
    fontWeight: 'bold',
    color: '#0F2A5C',
  },

  costoTotal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#B91C1C',
    marginTop: 4,
  },

  mantenimientoContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    margin: 10,
    borderWidth: 2,
    borderColor: '#D3DCE9',
    borderLeftWidth: 6,
    borderLeftColor: '#1D4ED8',
  },
  dropdown: {
    height: 54,
    borderColor: '#1D4ED8',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginVertical: 10,
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

  dropdownSearch: {
    borderColor: '#D3DCE9',
    borderRadius: 10,
    color: '#0F2A5C',
  },

  dropdownList: {
    borderRadius: 14,
    borderColor: '#D3DCE9',
  },

  dropdownItemText: {
    color: '#0F2A5C',
    fontSize: 14,
  },
});

export default MantenimientoListScreen;
