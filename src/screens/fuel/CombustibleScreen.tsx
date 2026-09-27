import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, Checkbox, TextInput } from 'react-native-paper';

import { AlertaMessage, MicroCopy, PlaceholderView } from '@/src/components/shared';
import { SimpleSkeleton } from '@/src/components/skeleton';
import { etiquetaDistancia, fechaToDate, formatearMoneda } from '@/src/helpers';
import { Vehiculo } from '@/src/interfaces/vehiculos';
import type { Tanqueada } from '@/src/services';
import { agregarTanqueada, eliminarTanqueada, getCurrentUserInfo, getTanqueadas, obtenerVehiculos } from '@/src/services';


// ─── Constantes de negocio ───────────────────────────────────────
/** Fracción del promedio bajo la cual se alerta (85%). */
const UMBRAL_ALERTA_BAJO = 0.85;
/** Mínimo de tanqueadas válidas para mostrar la alerta de bajo rendimiento. */
const MINIMO_PARA_ALERTA = 3;


interface OpcionVehiculo {
  id: string;
  etiqueta: string;
}

interface ResumenRendimiento {
  promedio: number;
  validas: number;
  ultimo: number | null;
}

/**
 * Tope de cordura del rendimiento según unidad (cubre hasta motos pequeñas).
 * Valores mayores se consideran error de digitación y se ignoran.
 */
function maxRendimiento(unidad: string): number {
  return unidad === 'millas' ? 40 : 70;
}

/** Ordena tanqueadas por KM ascendente sin mutar el arreglo original. */
function ordenarPorKm(tanqueadas: Tanqueada[]): Tanqueada[] {
  return [...tanqueadas].sort((a, b) => a.km - b.km);
}

/**
 * Rendimiento de UNA tanqueada contra la anterior por KM:
 * (kmActual - kmAnterior) / litros. Devuelve null si no es calculable
 * (primera, parcial anterior inválida, KM que no avanza o valor absurdo).
 */
function rendimientoDeUna(previo: Tanqueada | undefined, actual: Tanqueada, unidad: string): number | null {
  if (!actual.lleno || !previo) return null;
  const kmRecorridos = actual.km - previo.km;
  const litros = Number(actual.litros) || 0;
  if (kmRecorridos <= 0 || litros <= 0) return null;
  const rendimiento = kmRecorridos / litros;
  if (rendimiento >= maxRendimiento(unidad)) return null;
  return rendimiento;
}

/**
 * Promedio del vehículo con el método de tanque lleno:
 * promedia solo las tanqueadas llenas con anterior válido.
 */
function rendimientoPromedio(tanqueadas: Tanqueada[], unidad: string): ResumenRendimiento {
  const ordenadas = ordenarPorKm(tanqueadas);
  let suma = 0;
  let validas = 0;
  let ultimo: number | null = null;

  for (let i = 1; i < ordenadas.length; i++) {
    const rendimiento = rendimientoDeUna(ordenadas[i - 1], ordenadas[i], unidad);
    if (rendimiento === null) continue;
    suma += rendimiento;
    validas++;
    ultimo = rendimiento;
  }

  return { promedio: validas ? suma / validas : 0, validas, ultimo };
}

/** KM totales recorridos entre la primera y la última tanqueada. */
function kmRecorridos(tanqueadas: Tanqueada[]): number {
  if (tanqueadas.length < 2) return 0;
  const kms = tanqueadas.map((t) => t.km);
  return Math.max(...kms) - Math.min(...kms);
}

/** Suma de costos de una lista de tanqueadas. */
function gastoTotal(tanqueadas: Tanqueada[]): number {
  return tanqueadas.reduce((acc, t) => acc + (Number(t.costo) || 0), 0);
}

/** Formatea una fecha de Firestore/ISO a texto corto es-HN. */
function formatearFecha(fecha: Tanqueada['fecha']): string {
  const d = fechaToDate(fecha);
  if (!d) return '—';
  return d.toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' });
}


function CombustibleScreen() {
  // ── Datos remotos ──
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [vehicleId, setVehicleId] = useState<string>('');
  const [tanqueadas, setTanqueadas] = useState<Tanqueada[]>([]);
  const [unidad, setUnidad] = useState<string>('kilometros');

  // ── Estado de UI ──
  const [isLoading, setIsLoading] = useState(true);
  const [alerta, setAlerta] = useState({ message: '', error: false });

  // ── Formulario ──
  const [fecha, setFecha] = useState(new Date());
  const [km, setKm] = useState(0);
  const [litros, setLitros] = useState('');
  const [costo, setCosto] = useState('');
  const [lleno, setLleno] = useState(true);
  const [actualizarKm, setActualizarKm] = useState(true);

  // ── Valores derivados ──
  const unidadEtiqueta = etiquetaDistancia(unidad);
  const unidadVolumen = unidad === 'millas' ? 'mi/L' : 'km/L';
  const opciones: OpcionVehiculo[] = vehiculos.map((v) => ({
    id: v.id,
    etiqueta: `${v.marca} ${v.modelo} - ${v.placa}`,
  }));
  const stats = rendimientoPromedio(tanqueadas, unidad);
  const recorridos = kmRecorridos(tanqueadas);
  const gasto = gastoTotal(tanqueadas);
  const costoPorKm = recorridos > 0 ? gasto / recorridos : 0;
  const alertaBajo = stats.validas >= MINIMO_PARA_ALERTA
    && stats.ultimo !== null
    && stats.ultimo < stats.promedio * UMBRAL_ALERTA_BAJO;

  // ── Carga inicial: vehículos + unidad, preselecciona el primero ──
  useEffect(() => {
    cargarVehiculos();
    async function cargarVehiculos() {
      try {
        const [respVehiculos, info] = await Promise.all([obtenerVehiculos(), getCurrentUserInfo()]);
        const lista: Vehiculo[] = respVehiculos?.data ?? [];
        setVehiculos(lista);
        if (info && !info.error && info.config?.unidad) {
          setUnidad(info.config.unidad);
        }
        if (lista.length > 0) {
          setVehicleId(lista[0].id);
          setKm(Number(lista[0].kilometraje) || 0);
        }
        setIsLoading(false);
      } catch {
        setIsLoading(false);
      }
    }
  }, []);

  // ── Al cambiar de vehículo, cargar sus tanqueadas ──
  useEffect(() => {
    if (!vehicleId) return;
    cargarTanqueadas();
    async function cargarTanqueadas() {
      const response = await getTanqueadas(vehicleId);
      setTanqueadas(response?.data ?? []);
    }
  }, [vehicleId]);

  // ── Refresco silencioso al volver a la pestaña ──
  // Tras un cambio de unidad en Más, los valores ya vienen
  // convertidos del servidor y cambia la etiqueta.
  const recargarSilenciosa = useCallback(async () => {
    if (!vehicleId) return;
    try {
      const [respTanqueadas, info] = await Promise.all([
        getTanqueadas(vehicleId),
        getCurrentUserInfo(),
      ]);
      setTanqueadas(respTanqueadas?.data ?? []);
      if (info && !info.error && info.config?.unidad) {
        setUnidad(info.config.unidad);
      }
    } catch {
      // Sin acción adicional.
    }
  }, [vehicleId]);

  useFocusEffect(
    useCallback(() => {
      recargarSilenciosa();
    }, [recargarSilenciosa])
  );

  // ── Recarga manual (tras guardar/eliminar) ──
  async function recargar() {
    if (!vehicleId) return;
    const response = await getTanqueadas(vehicleId);
    setTanqueadas(response?.data ?? []);
  }

  function mostrarAlerta(message: string, error: boolean) {
    setAlerta({ message, error });
    setTimeout(() => {
      setAlerta({ message: '', error: false });
    }, 3000);
  }

  function showDatePicker() {
    DateTimePickerAndroid.open({
      value: fecha,
      onChange: (event, selectedDate) => {
        if (!selectedDate) return;
        setFecha(selectedDate);
      },
      mode: 'date',
      is24Hour: true,
      maximumDate: new Date(),
      minimumDate: new Date(2000, 0, 1),
    });
  }

  async function onGuardar() {
    if (!vehicleId) {
      mostrarAlerta('Selecciona un vehículo primero', true);
      return;
    }
    if (!km || km <= 0 || !litros || Number(litros) <= 0) {
      mostrarAlerta('Ingresa KM y litros válidos mayores a 0', true);
      return;
    }

    const lts = Number(litros);
    const kms = tanqueadas.map((t) => t.km);
    if (kms.length > 0) {
      const ultimoKm = Math.max(...kms);
      if (km <= ultimoKm) {
        confirmarGuardado(`El KM ingresado (${km}) es menor o igual al último registrado (${ultimoKm}). ¿Guardar de todos modos?`);
        return;
      }
      const estimado = (km - ultimoKm) / lts;
      const tope = maxRendimiento(unidad);
      if (estimado >= tope) {
        confirmarGuardado(`Da ${estimado.toFixed(1)} ${unidadVolumen}, fuera de lo normal (máx. ${tope}). ¿Guardar de todos modos?`);
        return;
      }
    }

    await ejecutarGuardado();
  }

  function confirmarGuardado(mensaje: string) {
    Alert.alert('Revisar datos', mensaje, [
      { text: 'Corregir', style: 'cancel' },
      { text: 'Guardar de todos modos', onPress: () => ejecutarGuardado() },
    ]);
  }

  async function ejecutarGuardado() {
    const body = {
      vehiculo: vehicleId,
      fecha,
      km,
      litros: Number(litros),
      costo: Number(costo) || 0,
      lleno,
      actualizar_kilometraje: actualizarKm,
    };

    const response = await agregarTanqueada(body);
    if (response?.error) {
      mostrarAlerta(response.message || 'No se pudo guardar la tanqueada', true);
      return;
    }

    mostrarAlerta('Tanqueada guardada correctamente', false);
    setLitros('');
    setCosto('');
    recargar();
  }

  // ── Eliminar con confirmación ──
  function onLongPressTanqueada(item: Tanqueada) {
    Alert.alert(
      'Eliminar tanqueada',
      `Se eliminará el registro de ${item.litros} L del ${formatearFecha(item.fecha)}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => eliminar(item) },
      ]
    );
  }

  async function eliminar(item: Tanqueada) {
    const response = await eliminarTanqueada(item.id);
    if (response?.error) {
      mostrarAlerta(response.message || 'No se pudo eliminar la tanqueada', true);
      return;
    }
    mostrarAlerta('Tanqueada eliminada correctamente', false);
    recargar();
  }

  // ── Texto del chip de rendimiento de una fila del historial ──
  function textoRendimientoFila(item: Tanqueada): string {
    const anteriores = tanqueadas.filter((t) => t.km < item.km).sort((a, b) => b.km - a.km);
    const rendimiento = rendimientoDeUna(anteriores[0], item, unidad);
    if (rendimiento === null) return '—';
    return `${rendimiento.toFixed(1)} ${unidadVolumen}`;
  }

  // ── Render: estados de carga y vacío ──
  if (isLoading) {
    return (
      <>
        <SimpleSkeleton />
        <SimpleSkeleton />
      </>
    );
  }

  if (!vehiculos.length) {
    return (
      <PlaceholderView
        icon={{ source: 'fuel', color: '#1D4ED8', size: 110 }}
        message1='Sin vehículos para medir'
        message2='Registra un vehículo en tu garaje para llevar su combustible.'
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >

        <View style={styles.statsHero}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Rendimiento</Text>
            <Text style={styles.statValue}>{stats.validas ? `${stats.promedio.toFixed(1)}` : '—'}</Text>
            <Text style={styles.statUnit}>{stats.validas ? unidadVolumen : ''}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Costo/{unidadEtiqueta.toLowerCase()}</Text>
            <Text style={[styles.statValue, styles.statGasto]}>{recorridos ? `L ${costoPorKm.toFixed(2)}` : '—'}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Gasto total</Text>
            <Text style={[styles.statValue, styles.statGasto]}>{formatearMoneda(gasto)}</Text>
          </View>
        </View>

        <Text style={styles.hint}>Mantén presionada una tanqueada para eliminarla</Text>

        <View style={styles.card}>
          <AlertaMessage alerta={alerta} />

          <Text style={styles.step}>01 · Vehículo y tanqueada</Text>

          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            containerStyle={styles.dropdownList}
            itemTextStyle={styles.dropdownItemText}
            iconColor='#1D4ED8'
            placeholder='Selecciona el vehículo'
            data={opciones}
            labelField='etiqueta'
            valueField='id'
            value={vehicleId}
            onChange={(item) => {
              setVehicleId(item.id);
              const v = vehiculos.find((x) => x.id === item.id);
              if (v) setKm(Number(v.kilometraje) || 0);
            }}
            maxHeight={400}
          />

          <TouchableOpacity onPress={() => showDatePicker()}>
            <TextInput
              label='Fecha de la tanqueada'
              mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
              style={[styles.input, styles.inputSeparador]}
              value={fecha.toLocaleDateString()}
              editable={false}
            />
          </TouchableOpacity>

          <View style={styles.row}>
            <TextInput
              label={`KM actual (${unidadEtiqueta})`}
              mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
              keyboardType='numeric'
              style={[styles.input, styles.inputHalf]}
              value={km ? km.toString() : ''}
              onChangeText={(text) => setKm(Number(text))}
            />
            <TextInput
              label='Litros'
              mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
              keyboardType='numeric'
              style={[styles.input, styles.inputHalf]}
              value={litros.toString()}
              onChangeText={setLitros}
              placeholder='40.00'
            />
          </View>

          <TextInput
            label='Costo total (L)'
            mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
            keyboardType='numeric'
            style={[styles.input, styles.inputSeparador]}
            value={costo.toString()}
            onChangeText={setCosto}
            placeholder='1150'
          />

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setLleno(!lleno)}
            activeOpacity={0.7}
          >
            <Checkbox status={lleno ? 'checked' : 'unchecked'} onPress={() => setLleno(!lleno)} />
            <Text style={styles.checkText}>Tanque lleno (necesario para el promedio)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkRow}
            onPress={() => setActualizarKm(!actualizarKm)}
            activeOpacity={0.7}
          >
            <Checkbox status={actualizarKm ? 'checked' : 'unchecked'} onPress={() => setActualizarKm(!actualizarKm)} />
            <Text style={styles.checkText}>Actualizar kilometraje del vehículo</Text>
          </TouchableOpacity>

          <Button
            mode='contained'
            onPress={onGuardar}
            style={styles.submit}
            labelStyle={styles.submitLabel}
          >
            <Text>Guardar tanqueada</Text>
          </Button>

          <MicroCopy text='El promedio solo usa tanqueadas con tanque lleno' />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial</Text>
          {alertaBajo ? (
            <Text style={styles.alertaBajo}>
              El último rendimiento está bajo el promedio. Revisa presión de llantas, filtro de aire o bujías.
            </Text>
          ) : null}
          {tanqueadas.length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay tanqueadas de este vehículo. Registra la primera arriba.</Text>
          ) : (
            [...tanqueadas]
              .sort((a, b) => b.km - a.km)
              .map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.fila}
                  activeOpacity={0.95}
                  delayLongPress={400}
                  onLongPress={() => onLongPressTanqueada(item)}
                >
                  <View style={styles.filaTop}>
                    <Text style={[styles.chip, item.lleno ? styles.chipLleno : styles.chipParcial]}>
                      {item.lleno ? textoRendimientoFila(item) : 'Parcial'}
                    </Text>
                    <Text style={styles.filaFecha}>{formatearFecha(item.fecha)}</Text>
                  </View>
                  <Text style={styles.filaTitulo}>{item.litros} L · {formatearMoneda(item.costo)}</Text>
                  <Text style={styles.filaDetalle}>{Number(item.km).toLocaleString()} {unidadEtiqueta}{item.lleno ? ' · tanque lleno' : ''}</Text>
                </TouchableOpacity>
              ))
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EDF1F7',
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
  statUnit: {
    fontSize: 11,
    color: '#BFDBFE',
  },
  statGasto: {
    color: '#FECACA',
    fontSize: 15,
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
    marginVertical: 8,
  },
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
    fontSize: 15,
    fontWeight: '800',
    color: '#0F2A5C',
    marginBottom: 4,
  },
  step: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#DC2626',
    textTransform: 'uppercase',
    marginLeft: 4,
    marginTop: 6,
  },
  dropdown: {
    height: 54,
    borderColor: '#1D4ED8',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
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
  dropdownList: {
    borderRadius: 14,
    borderColor: '#D3DCE9',
  },
  dropdownItemText: {
    color: '#0F2A5C',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#F7F9FD',
    marginVertical: 6,
  },
  inputSeparador: {
    marginHorizontal: 0,
  },
  inputHalf: {
    flex: 1,
    marginHorizontal: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  checkText: {
    marginLeft: 4,
    flexShrink: 1,
    fontSize: 12,
    color: '#334155',
  },
  submit: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: '#1D4ED8',
  },
  submitLabel: {
    fontWeight: '800',
  },
  alertaBajo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    overflow: 'hidden',
  },
  emptyText: {
    fontSize: 13,
    color: '#5B6B7F',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10,
  },
  fila: {
    backgroundColor: '#F7F9FD',
    borderWidth: 1.5,
    borderColor: '#D3DCE9',
    borderRadius: 14,
    padding: 12,
    marginTop: 8,
  },
  filaTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    fontSize: 11,
    fontWeight: '900',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  chipLleno: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
  },
  chipParcial: {
    backgroundColor: '#E0F2FE',
    color: '#0C4A6E',
  },
  filaFecha: {
    fontSize: 12,
    color: '#8A99AD',
  },
  filaTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F2A5C',
    marginTop: 6,
  },
  filaDetalle: {
    fontSize: 13,
    color: '#5B6B7F',
    marginTop: 2,
  },
});

export default CombustibleScreen;
