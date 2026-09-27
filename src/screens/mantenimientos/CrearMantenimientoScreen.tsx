import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, Checkbox, TextInput } from 'react-native-paper';

import { router, useLocalSearchParams } from 'expo-router';

import { AlertaMessage, MicroCopy } from '@/src/components/shared';
import { etiquetaDistancia, fechaToDate } from '@/src/helpers';
import { MantenimientoCatalogo, MantenimientoTipo } from '@/src/interfaces/mantenimientos';
import { Vehiculo } from '@/src/interfaces/vehiculos';
import { actualizarMantenimiento, getCatalogoMantenimientos, getCurrentUserInfo, getItem, removeItem } from '@/src/services';
import { agregarMantenimiento } from '@/src/services/api/MantenimientosService';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

function CrearMantenimientoScreen() {

  // El tipo se envía por defecto como Preventivo (la API lo exige) sin mostrar el selector.
  const [tipoMantenimientoRealizado, setTipoMantenimientoRealizado] = useState('Mantenimiento Preventivo');
  const [mantenimientoRealizado, setMantenimientoRealizado] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const editarParam = typeof params.editar === 'string' ? params.editar : null;
  const [mantenimientoSelected, setMantenimientoSelected] = useState<MantenimientoTipo>({
    nombre: '', intervaloFecha: 0, intervaloKm: 0,
  });
  const [fechaMantenimiento, setFechaMantenimiento] = useState(new Date());
  const [kilometrajeActual, setKilometrajeActual] = useState(0);

  const [fechaEstimadaRecordatorio, setFechaEstimadaRecordatorio] = useState(new Date());
  const [kmEstimadoRecordatorio, setKmEstimadoRecordatorio] = useState(0);
  const [tiposRespuestos, setTiposRespuestos] = useState<'nuevos' | 'usados'>('nuevos');
  const [costoManoObra, setCostoManoObra] = useState(0);
  const [costoRepuestos, setCostoRepuestos] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);
  const [compradoEn, setCompradoEn] = useState('');
  const [realizadoEn, setRealizadoEn] = useState('');
  const [unidad, setUnidad] = useState<string>('kilometros');

  useEffect(() => {
    getUnidad();
    async function getUnidad() {
      const info = await getCurrentUserInfo();
      if (info && !info.error && info.config?.unidad) {
        setUnidad(info.config.unidad);
      }
    }
  }, []);

  useEffect(() => {
    getCatalogo();
    async function getCatalogo() {
      // Catálogo desde el backend (aporta los intervalos para el recordatorio).
      const response = await getCatalogoMantenimientos();
      if (response && Array.isArray(response.data) && response.data.length > 0) {
        setCatalogo(
          response.data.map((item: MantenimientoCatalogo) => ({
            nombre: item.nombre,
            intervaloKm: Number(item.intervaloKm) || 0,
            intervaloFecha: Number(item.intervaloFechaDias) || 0,
            aplicaA: item.aplicaA === 'moto' ? 'moto' : 'automovil',
          }))
        );
      }
    }
  }, []);

  const [vehiculo, setVehiculo] = useState<Partial<Vehiculo>>({});

  useEffect(() => {
    inicializarEdicion();
    async function inicializarEdicion() {
      if (editarParam) {
        const item = await getItem({ key: 'mantenimiento_editar', json: true });
        if (item) {
          setEditandoId(editarParam);
          setTipoMantenimientoRealizado(item.tipo || 'Mantenimiento Preventivo');
          setMantenimientoRealizado(item.nombre || '');
          setFechaMantenimiento(fechaToDate(item.fecha) ?? new Date());
          setFechaEstimadaRecordatorio(fechaToDate(item.fecha_recordatorio) ?? new Date());
          setKilometrajeActual(Number(item.kilometraje_actual) || 0);
          setKmEstimadoRecordatorio(Number(item.km_recordatorio) || 0);
          setTiposRespuestos(item.tipo_repuestos === 'usados' ? 'usados' : 'nuevos');
          setCostoManoObra(Number(item.costo_manoobra) || 0);
          setCostoRepuestos(Number(item.costo_repuestos) || 0);
          setCostoTotal((Number(item.costo_manoobra) || 0) + (Number(item.costo_repuestos) || 0));
          setCompradoEn(item.comprado || '');
          setRealizadoEn(item.manoobra || '');
          return;
        }
      }
      setEditandoId(null);
      await removeItem({ key: 'mantenimiento_editar' });
      // Restablecer el formulario para un registro nuevo.
      setTipoMantenimientoRealizado('Mantenimiento Preventivo');
      setMantenimientoRealizado('');
      setMantenimientoSelected({ nombre: '', intervaloFecha: 0, intervaloKm: 0 });
      setFechaMantenimiento(new Date());
      setFechaEstimadaRecordatorio(new Date());
      setKmEstimadoRecordatorio(0);
      setTiposRespuestos('nuevos');
      setCostoManoObra(0);
      setCostoRepuestos(0);
      setCostoTotal(0);
      setCompradoEn('');
      setRealizadoEn('');
    }
  }, [editarParam]);

  const [isLoading, setIsLoading] = useState(false);

  const [alerta, setAlerta] = useState({ message: '', error: false });
  const [checked, setChecked] = useState(true);

  // TEMPORAL
  const MANTENIMIENTOS_VEHICLE = [
    { nombre: "Cambio de aceite de motor", intervaloKm: 5000, intervaloFecha: 365 },
    { nombre: "Cambio de filtro de aceite", intervaloKm: 8000, intervaloFecha: 730 },
    { nombre: "Cambio de filtro de aire", intervaloKm: 10000, intervaloFecha: 365 },
    { nombre: "Cambio de filtro de combustible", intervaloKm: 20000, intervaloFecha: 730 },
    { nombre: "Cambio de filtro de cabina", intervaloKm: 15000, intervaloFecha: 365 },
    { nombre: "Revisión y cambio de bujías", intervaloKm: 30000, intervaloFecha: 730 },
    { nombre: "Cambio de líquido de frenos", intervaloKm: 30000, intervaloFecha: 730 },
    { nombre: "Cambio de líquido de dirección hidráulica", intervaloKm: 40000, intervaloFecha: 1095 },
    { nombre: "Cambio de líquido refrigerante", intervaloKm: 40000, intervaloFecha: 730 },
    { nombre: "Alineación y balanceo", intervaloKm: 10000, intervaloFecha: 182 },
    { nombre: "Rotación de llantas", intervaloKm: 10000, intervaloFecha: 182 },
    { nombre: "Inspección de frenos (pastillas/discos)", intervaloKm: 15000, intervaloFecha: 182 },
    { nombre: "Cambio de pastillas de freno", intervaloKm: 25000, intervaloFecha: 547 },
    { nombre: "Cambio de discos de freno", intervaloKm: 50000, intervaloFecha: 1095 },
    { nombre: "Revisión del sistema de suspensión", intervaloKm: 20000, intervaloFecha: 365 },
    { nombre: "Cambio de amortiguadores", intervaloKm: 60000, intervaloFecha: 1460 },
    { nombre: "Revisión del sistema de escape", intervaloKm: 20000, intervaloFecha: 365 },
    { nombre: "Inspección del sistema eléctrico", intervaloKm: 20000, intervaloFecha: 365 },
    { nombre: "Revisión del sistema de aire acondicionado", intervaloKm: 15000, intervaloFecha: 365 },
    { nombre: "Revisión de correas (alternador, distribución)", intervaloKm: 40000, intervaloFecha: 730 },
    { nombre: "Cambio de correa de distribución", intervaloKm: 80000, intervaloFecha: 1825 },
    { nombre: "Cambio de batería", intervaloKm: 60000, intervaloFecha: 1095 },
    { nombre: "Cambio de llantas", intervaloKm: 50000, intervaloFecha: 1825 },
    { nombre: "Lavado de inyectores", intervaloKm: 30000, intervaloFecha: 730 },
    { nombre: "Inspección de fugas de fluidos", intervaloKm: 10000, intervaloFecha: 182 },
    { nombre: "Limpieza del radiador", intervaloKm: 40000, intervaloFecha: 730 },
    { nombre: "Revisión de luces y bombillas", intervaloKm: 10000, intervaloFecha: 182 },
    { nombre: "Revisión de sensores (oxígeno, temperatura)", intervaloKm: 30000, intervaloFecha: 730 },
    { nombre: "Revisión del cuerpo de aceleración", intervaloKm: 30000, intervaloFecha: 365 },
    { nombre: "Revisión del sistema de transmisión", intervaloKm: 40000, intervaloFecha: 730 }
  ];

  // Catálogo del select: lista local como valor inicial, se reemplaza con la del backend.
  const [catalogo, setCatalogo] = useState<MantenimientoTipo[]>(MANTENIMIENTOS_VEHICLE);

  // Cuando el catálogo termina de cargar, resolver los intervalos del mantenimiento en edición.
  useEffect(() => {
    if (editandoId && mantenimientoRealizado) {
      const encontrado = catalogo.find((c) => c.nombre === mantenimientoRealizado);
      if (encontrado) setMantenimientoSelected(encontrado);
    }
  }, [catalogo, editandoId, mantenimientoRealizado]);

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: fechaMantenimiento,
      onChange: (event, selectedDate) => {
        if (!selectedDate) return;
        setFechaMantenimiento(selectedDate);
        calcularFechaKmRecordatorio(selectedDate, mantenimientoSelected);
      },
      mode: 'date',
      is24Hour: true,
      maximumDate: new Date(),
      minimumDate: new Date(2000, 0, 1),
    });
  }

  // El recordatorio se calcula solo, pero queda editable para ajustarlo a mano.
  const showDatePickerRecordatorio = () => {
    DateTimePickerAndroid.open({
      value: fechaEstimadaRecordatorio,
      onChange: (event, selectedDate) => {
        if (!selectedDate) return;
        setFechaEstimadaRecordatorio(selectedDate);
      },
      mode: 'date',
      is24Hour: true,
      minimumDate: new Date(),
    });
  }

  function calcularFechaKmRecordatorio(date?: Date, mantenimiento?: any) {
    const nuevaFecha = new Date(date || fechaMantenimiento);
    const selected = mantenimiento || mantenimientoSelected;

    nuevaFecha.setDate(nuevaFecha.getDate() + selected.intervaloFecha);

    setFechaEstimadaRecordatorio(nuevaFecha);

    setKmEstimadoRecordatorio(selected.intervaloKm + kilometrajeActual);
  }


  async function onPress() {
    if ([tipoMantenimientoRealizado, mantenimientoRealizado, fechaMantenimiento, costoManoObra, costoRepuestos].includes('')) {
      setAlerta({ error: true, message: 'Falta información obligatoria' });
      setTimeout(() => {
        setAlerta({ error: false, message: '' });
      }, 3000);
      return;
    }

    if (!kilometrajeActual || kilometrajeActual <= 0) {
      setAlerta({ error: true, message: 'Ingresa un kilometraje válido mayor a 0' });
      setTimeout(() => {
        setAlerta({ error: false, message: '' });
      }, 3000);
      return;
    }

    if (!kmEstimadoRecordatorio || kmEstimadoRecordatorio <= 0) {
      setAlerta({ error: true, message: 'Ingresa un kilometraje de recordatorio válido mayor a 0' });
      setTimeout(() => {
        setAlerta({ error: false, message: '' });
      }, 3000);
      return;
    }

    const body = {
      tipo: tipoMantenimientoRealizado,
      nombre: mantenimientoRealizado,
      fecha: fechaMantenimiento,
      kilometraje_actual: checked ? kilometrajeActual : vehiculo.kilometraje,
      fecha_recordatorio: new Date(fechaEstimadaRecordatorio),
      km_recordatorio: kmEstimadoRecordatorio,
      tipo_repuestos: tiposRespuestos,
      costo_repuestos: costoRepuestos,
      costo_manoobra: costoManoObra,
      comprado: compradoEn,
      manoobra: realizadoEn,
      vehiculo: vehiculo.id,
      actualizar_kilometraje: checked,
    }

    setIsLoading(true);

    try {
      const response = editandoId
        ? await actualizarMantenimiento(editandoId, body)
        : await agregarMantenimiento(body);

      if (response?.error) {
        setAlerta({ error: true, message: response.message || 'No se pudo guardar el mantenimiento' });
        setIsLoading(false);
        setTimeout(() => {
          setAlerta({ error: false, message: '' });
        }, 3000);
        return;
      }

      await removeItem({ key: 'mantenimiento_editar' });
      setAlerta({ error: false, message: editandoId ? 'Mantenimiento actualizado correctamente' : 'Mantenimiento guardado correctamente' });
      setIsLoading(false);
      setTimeout(() => {
        router.replace({
          pathname: '/mantenimientos',
          params: {
            vehicleId: vehiculo.id,
          }
        });
      }, 800);

    } catch {
      // Sin acción adicional.
      setIsLoading(false);
    }


  }

  useEffect(() => {
    getVehiculoId();
    async function getVehiculoId() {
      const vehiculoLS = await getItem({ key: 'vehiculo', json: true });
      setVehiculo(vehiculoLS);
      setKilometrajeActual(Number(vehiculo.kilometraje) ?? 0);
    }
  }, [vehiculo.kilometraje]);

  // Tipo del vehículo actual (los viejos sin tipo cuentan como automovil).
  const tipoVehiculo = vehiculo.tipo === 'moto' ? 'moto' : 'automovil';

  // Catálogo filtrado por tipo; sin filtro verías nombres duplicados (ej. aceite carro/moto).
  const catalogoFiltrado = catalogo.filter((c) => (c.aplicaA || 'automovil') === tipoVehiculo);

  // Si lo seleccionado ya no aplica al tipo (cambió el vehículo o llegó el catálogo), limpiar.
  // En edición no se toca: el campo queda bloqueado con el valor guardado.
  useEffect(() => {
    if (editandoId || !catalogo.length || !mantenimientoRealizado) return;
    const vigente = catalogo.some((c) => c.nombre === mantenimientoRealizado && (c.aplicaA || 'automovil') === tipoVehiculo);
    if (!vigente) {
      setMantenimientoRealizado('');
      setMantenimientoSelected({ nombre: '', intervaloFecha: 0, intervaloKm: 0 });
    }
  }, [catalogo, tipoVehiculo, mantenimientoRealizado, editandoId]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
      >
        <View style={styles.container}>
          <AlertaMessage alerta={alerta} />

          <View style={styles.separador} />

          <MicroCopy text='Completa la siguiente información para agregar el mantenimiento' />

          <Text style={styles.step}>01 · Qué se hizo</Text>

          <Text style={[styles.subtitle, { marginVertical: 0 }]}>Información del mantenimiento</Text>

          {editandoId ? (
            <TextInput
              label='Mantenimiento realizado'
              mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
              style={[styles.input, styles.inputSeparador, { marginBottom: 8 }]}
              value={mantenimientoRealizado}
              editable={false}
            />
          ) : (
            <Dropdown
              style={[styles.dropdown, styles.inputSeparador, { marginBottom: 8 }]}
              placeholder='Selecciona el mantenimiento realizado'
              searchPlaceholder='Buscar un mantenimiento'
              data={catalogoFiltrado}
              labelField='nombre'
              valueField='nombre'
              value={mantenimientoRealizado}
              onChange={item => {
                setMantenimientoSelected(item);
                setMantenimientoRealizado(item.nombre);

                calcularFechaKmRecordatorio(fechaMantenimiento, item);
              }}
              search
              maxHeight={400}
            />
          )}

          <TouchableOpacity
            onPress={() => showDatePicker()}
          >
            <TextInput
              label='Fecha del mantenimiento'
              mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
              style={[styles.input, styles.inputSeparador]}
              value={fechaMantenimiento.toLocaleDateString()}
              editable={false}
            />
          </TouchableOpacity>

          <TextInput
            placeholder={`Kilometraje del vehículo (${etiquetaDistancia(unidad)})`}
            label={`Kilometraje del vehículo (${etiquetaDistancia(unidad)})`}
            mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
            keyboardType='numeric'
            value={kilometrajeActual.toString()}
            onChangeText={text => setKilometrajeActual(Number(text))}
            style={[styles.input, styles.inputSeparador]}
            onEndEditing={() => {
              setTimeout(() => {
                calcularFechaKmRecordatorio();
              }, 1000);
            }}
          />

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => setChecked(!checked)}
            activeOpacity={0.7}
          >
            <Checkbox
              status={checked ? 'checked' : 'unchecked'}
              onPress={() => setChecked(!checked)}
            />
            <Text style={{ marginLeft: 4, flexShrink: 1, fontSize: 12 }}>
              Actualizar kilometraje del vehículo
            </Text>
          </TouchableOpacity>

          <Text style={styles.step}>02 · Próximo aviso</Text>
          <Text style={styles.subtitle}>Recordatorio</Text>
          <Text style={styles.hintRecordatorio}>Se calcula solo según lo seleccionado, pero puedes ajustarlo</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15 }}>
            <TouchableOpacity
              onPress={() => showDatePickerRecordatorio()}
              style={{ marginInline: 0, width: '45%' }}
              activeOpacity={0.7}
            >
              <TextInput
                label='Fecha estimada del próximo cambio'
                mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
                style={[styles.input, styles.inputSeparador, { marginInline: 0, width: '100%' }]}
                value={fechaEstimadaRecordatorio.toLocaleDateString()}
                editable={false}
              />
            </TouchableOpacity>

            <TextInput
              label={`Próximo cambio en (${etiquetaDistancia(unidad).toLowerCase()})`}
              mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
              style={[styles.input, styles.inputSeparador, { marginInline: 0, width: '45%' }]}
              value={kmEstimadoRecordatorio.toString()}
              onChangeText={(text) => setKmEstimadoRecordatorio(Number(text))}
              keyboardType='numeric'
            />
          </View>


          <Text style={styles.step}>03 · Costos y taller</Text>
          <Text style={styles.subtitle}>Repuestos y costos</Text>

          <Dropdown
            style={[styles.dropdown]}
            placeholder='Tipos de repuestos'
            data={[
              { nombre: 'Nuevos' },
              { nombre: 'Usados' },
            ]}
            labelField='nombre'
            valueField='nombre'
            value={tiposRespuestos}
            onChange={item => {
              setTiposRespuestos(item.nombre.toLowerCase());
            }}
            maxHeight={400}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextInput
              style={[styles.input, styles.inputSeparador, { width: '45%' }]}
              placeholder='Costo mano de obra'
              label='Costo mano de obra'
              keyboardType='numeric'
              mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
              value={costoManoObra.toString()}
              onChangeText={text => {
                setCostoManoObra(Number(text));
              }}
              onEndEditing={() => {
                setCostoTotal(costoManoObra + costoRepuestos);
              }}
            />

            <TextInput
              style={[styles.input, styles.inputSeparador, { width: '45%' }]}
              placeholder='Costo de repuestos'
              label='Costo de repuestos'
              keyboardType='numeric'
              mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
              value={costoRepuestos.toString()}
              onChangeText={text => {
                setCostoRepuestos(Number(text));
              }}
              onEndEditing={() => {
                setCostoTotal(costoManoObra + costoRepuestos);
              }}
            />
          </View>

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total estimado</Text>
            <Text style={styles.totalValue}>L {costoTotal.toLocaleString()}</Text>
          </View>

          {/* Seccion de lugar de compra */}
          <Text style={styles.subtitle}>Lugar de compra</Text>

          <TextInput
            style={[styles.input, styles.inputSeparador]}
            placeholder='Lugar de compra de repuestos'
            label='Comprado en'
            mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
            value={compradoEn}
            onChangeText={text => setCompradoEn(text)}
          />

          <TextInput
            style={[styles.input, styles.inputSeparador]}
            placeholder='Lugar de mano de obra'
            label='Mano de obra en'
            mode='outlined' outlineColor='#D3DCE9' activeOutlineColor='#1D4ED8'
            value={realizadoEn}
            onChangeText={text => setRealizadoEn(text)}
          />

          <Button
            mode="contained"
            onPress={onPress}
            style={{ marginInline: 10, marginBlock: 30, backgroundColor: '#DC2626', borderRadius: 14 }}
            disabled={isLoading}
          >
            <Text>{editandoId ? 'Guardar cambios' : 'Guardar mantenimiento'}</Text>
          </Button>
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
    paddingBottom: 60,
    backgroundColor: '#EDF1F7',
  },
  container: {
    width: '95%',
    margin: 'auto',
    justifyContent: 'center',
    flex: 1,
  },
  error: {
    backgroundColor: '#a60505',
    bottom: 40
  },

  input: {
    backgroundColor: '#F7F9FD',
    margin: 10,
  },

  inputSeparador: {
    marginBottom: 0,
    marginTop: 0,
  },
  statusBarProtection: {
    marginTop: 50,
  },
  subtitle: {
    fontSize: 16,
    marginLeft: 15,
    marginVertical: 15,
    fontWeight: 'bold',
    color: '#0F2A5C',
  },
  step: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#DC2626',
    textTransform: 'uppercase',
    marginLeft: 15,
    marginTop: 18,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 15,
    margin: 10,
  },
  totalLabel: {
    color: '#D7E3F8',
    fontSize: 13,
    fontWeight: '700',
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  hintRecordatorio: {
    color: '#5C6B82',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 15,
    marginBottom: 8,
  },

  dropdown: {
    height: 50,
    borderColor: '#1D4ED8',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 8,
    margin: 10,
    backgroundColor: '#F7F9FD',
  },
  separador: {
    marginVertical: 12,
  },
});

export default CrearMantenimientoScreen;
