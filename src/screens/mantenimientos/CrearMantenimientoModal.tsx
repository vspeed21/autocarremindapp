import { AlertaMessage, MicroCopy } from '@/src/components/shared';
import { MantenimientoTipo } from '@/src/interfaces/mantenimientos';
import { Vehiculo } from '@/src/interfaces/vehiculos';
import { getItem } from '@/src/services';
import { agregarMantenimiento } from '@/src/services/api/MantenimientosService';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, TextInput } from 'react-native-paper';

interface Props {
  setShowFormAddVehicle: (value: boolean) => void;
}

function CrearMantenimientoInfoModal({ setShowFormAddVehicle }: Props) {

  const [tipoMantenimientoRealizado, setTipoMantenimientoRealizado] = useState('');
  const [mantenimientoRealizado, setMantenimientoRealizado] = useState('');
  const [mantenimientoSelected, setMantenimientoSelected] = useState<MantenimientoTipo>({
    nombre: '', intervaloFecha: 0, intervaloKm: 0,
  });
  const [fechaMantenimiento, setFechaMantenimiento] = useState(new Date());
  const [kilometrajeActual, setKilometrajeActual] = useState(0);

  const [fechaEstimadaRecordatorio, setFechaEstimadaRecordatorio] = useState(new Date().toLocaleDateString());
  const [kmEstimadoRecordatorio, setKmEstimadoRecordatorio] = useState(0);
  const [tiposRespuestos, setTiposRespuestos] = useState<'nuevos' | 'usados'>('nuevos');
  const [costoManoObra, setCostoManoObra] = useState(0);
  const [costoRepuestos, setCostoRepuestos] = useState(0);
  const [costoTotal, setCostoTotal] = useState(0);
  const [compradoEn, setCompradoEn] = useState('');
  const [realizadoEn, setRealizadoEn] = useState('');

  const [vehiculo, setVehiculo] = useState<Partial<Vehiculo>>({});

  const [isLoading, setIsLoading] = useState(false);

  const [alerta, setAlerta] = useState({ message: '', error: false });

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

  const TIPOS_MANTENIMIENTOS = [
    { nombre: 'Mantenimiento Preventivo' },
    { nombre: 'Mantenimiento Correctivo' },
    { nombre: 'Mejora' },
  ]

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
      minimumDate: new Date(2000, 0, 1), // El año mínimo es el año del carro
    });
  }

  function calcularFechaKmRecordatorio(date?: Date, mantenimiento?: any) {
    const nuevaFecha = new Date(date || fechaMantenimiento);
    const selected = mantenimiento || mantenimientoSelected;
    console.log(nuevaFecha.getDate());
    console.log(selected.intervaloFecha);

    nuevaFecha.setDate(nuevaFecha.getDate() + selected.intervaloFecha);

    setFechaEstimadaRecordatorio(nuevaFecha.toLocaleDateString());

    setKmEstimadoRecordatorio(selected.intervaloKm + kilometrajeActual);

  }


  async function onPress() {

    if ([tipoMantenimientoRealizado, mantenimientoRealizado, fechaMantenimiento, kilometrajeActual, costoManoObra, costoRepuestos].includes('')) {
      setAlerta({ error: true, message: 'Falta información obligatoria' });
      setTimeout(() => {
        setAlerta({ error: false, message: '' });
      }, 3000);
      return;
    }

    const body = {
      tipo: tipoMantenimientoRealizado,
      nombre: mantenimientoRealizado,
      fecha: fechaMantenimiento,
      kilometraje_actual: kilometrajeActual,
      fecha_recordatorio: fechaEstimadaRecordatorio,
      km_recordatorio: kmEstimadoRecordatorio,
      tipo_repuestos: tiposRespuestos,
      costo_repuestos: costoRepuestos,
      costo_manoobra: costoManoObra,
      comprado: compradoEn,
      manoobra: realizadoEn,
      vehiculo: vehiculo.id,
    }

    setIsLoading(true);

    try {
      const response = await agregarMantenimiento(body);
      console.log(response);
      setShowFormAddVehicle(false);
      setIsLoading(false);

    } catch (error) {
      console.log(error);
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

  return (
    <ScrollView>

      <AlertaMessage alerta={alerta} />

      <View style={styles.separador} />

      <MicroCopy text='Completa la siguiente información para agregar el mantenimiento' />

      <Text style={[styles.subtitle, { marginVertical: 0 }]}>Información del mantenimiento</Text>

      <Dropdown
        style={[styles.dropdown, styles.inputSeparador, { marginBottom: 8 }]}
        placeholder='Selecciona tipo de mantenimiento'
        data={TIPOS_MANTENIMIENTOS}
        labelField='nombre'
        valueField='nombre'
        value={tipoMantenimientoRealizado}
        onChange={item => {
          setTipoMantenimientoRealizado(item.nombre);
        }}
        maxHeight={400}
      />

      <Dropdown
        style={[styles.dropdown, styles.inputSeparador, { marginBottom: 8 }]}
        placeholder='Selecciona el mantenimiento realizado'
        searchPlaceholder='Buscar un mantenimiento'
        data={MANTENIMIENTOS_VEHICLE}
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

      <TouchableOpacity
        onPress={() => showDatePicker()}
      >
        <TextInput
          label='Fecha del mantenimiento'
          mode='outlined'
          style={[styles.input, styles.inputSeparador]}
          value={fechaMantenimiento.toLocaleDateString()}
          editable={false}
        />
      </TouchableOpacity>

      <TextInput
        placeholder='Kilometraje del vehículo al momento del mantenimiento'
        label='Kilometraje del vehículo al momento del mantenimiento'
        mode='outlined'
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

      <Text style={styles.subtitle}>Recordatorio</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15 }}>
        <TextInput
          label='Fecha estimada del próximo cambio'
          mode='outlined'
          style={[styles.input, styles.inputSeparador, { marginInline: 0, width: '45%' }]}
          editable={false}
          value={fechaEstimadaRecordatorio}
        />

        <TextInput
          label='Proximo cambio en (km)'
          mode='outlined'
          style={[styles.input, styles.inputSeparador, { marginInline: 0, width: '45%' }]}
          value={kmEstimadoRecordatorio.toString()}
          editable={false}
          keyboardType='numeric'
        />
      </View>


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
          mode='outlined'
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
          mode='outlined'
          value={costoRepuestos.toString()}
          onChangeText={text => {
            setCostoRepuestos(Number(text));
          }}
          onEndEditing={() => {
            setCostoTotal(costoManoObra + costoRepuestos);
          }}
        />
      </View>

      <Text style={{ fontSize: 12, marginLeft: 10 }}>Total gastado: {costoTotal}</Text>

      {/* Seccion de lugar de compra */}
      <Text style={styles.subtitle}>Lugar de compra</Text>

      <TextInput
        style={[styles.input, styles.inputSeparador]}
        placeholder='Lugar de compra de repuestos'
        label='Comprado en'
        mode='outlined'
        value={compradoEn}
        onChangeText={text => setCompradoEn(text)}
      />

      <TextInput
        style={[styles.input, styles.inputSeparador]}
        placeholder='Lugar de mano de obra'
        label='Mano de obra en'
        mode='outlined'
        value={realizadoEn}
        onChangeText={text => setRealizadoEn(text)}
      />

      <Button
        mode="contained"
        onPress={onPress}
        style={{ marginInline: 10, marginBlock: 30 }}
        disabled={isLoading}
      >
        <Text>Agregar Mantenimiento</Text>
      </Button>

    </ScrollView>
  );

}


const styles = StyleSheet.create({
  error: {
    backgroundColor: '#a60505',
    bottom: 40
  },

  input: {
    backgroundColor: '#FFF',
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
  },

  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    margin: 10,
    backgroundColor: '#fff',
  },
  separador: {
    marginVertical: 12,
  },
});

export default CrearMantenimientoInfoModal;
