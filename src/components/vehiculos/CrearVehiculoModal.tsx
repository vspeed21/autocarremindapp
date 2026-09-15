import { AlertaMessage } from '@/src/components/shared';
import { MarcaCatalogo, ModeloCatalogo, getItem, getMarcas, getModelos } from '@/src/services';
import { actualizarVehiculo, crearVehiculo } from '@/src/services/api/vehiculoServices';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, FAB, Portal, TextInput } from 'react-native-paper';
import { Vehiculo } from '../../interfaces/vehiculos';

interface Props {
  showFormAddVehicle: boolean;
  setShowFormAddVehicle: (value: boolean) => void;
  setVehicleEditar: (value: Vehiculo) => void;
  vehicleEditar: Vehiculo | null;
  unidad?: string;
}

const MARCAS = [
  { id: 1, marca: 'Toyota' },
  { id: 2, marca: 'Honda' },
  { id: 3, marca: 'Ford' },
  { id: 4, marca: 'Chevrolet' },
  { id: 5, marca: 'Nissan' },
  { id: 6, marca: 'Hyundai' },
  { id: 7, marca: 'Kia' },
  { id: 10, marca: 'Mazda' },
  { id: 11, marca: 'Peugeot' },
  { id: 12, marca: 'Subaru' },
  { id: 13, marca: 'Suzuki' },
  { id: 14, marca: 'Renault' },
  { id: 15, marca: 'Chery' }
];

const MODELOS = [
  // TOYOTA
  { id: 1, id_marca: 1, nombre: 'Corolla', year: 2019 },
  { id: 2, id_marca: 1, nombre: 'Hilux', year: 2021 },
  { id: 3, id_marca: 1, nombre: 'Yaris', year: 2020 },
  { id: 4, id_marca: 1, nombre: 'RAV4', year: 2022 },
  { id: 5, id_marca: 1, nombre: 'Camry', year: 2021 },
  { id: 6, id_marca: 1, nombre: 'Land Cruiser', year: 2023 },
  { id: 7, id_marca: 1, nombre: 'Avanza', year: 2018 },
  { id: 8, id_marca: 1, nombre: 'Tacoma', year: 2020 },
  { id: 9, id_marca: 1, nombre: '4Runner', year: 2019 },
  { id: 10, id_marca: 1, nombre: 'Matrix', year: 2023 },

  // HONDA
  { id: 11, id_marca: 2, nombre: 'Civic', year: 2020 },
  { id: 12, id_marca: 2, nombre: 'CR-V', year: 2022 },
  { id: 13, id_marca: 2, nombre: 'Accord', year: 2021 },
  { id: 14, id_marca: 2, nombre: 'Fit', year: 2019 },
  { id: 15, id_marca: 2, nombre: 'HR-V', year: 2023 },
  { id: 16, id_marca: 2, nombre: 'Pilot', year: 2022 },
  { id: 17, id_marca: 2, nombre: 'Odyssey', year: 2021 },
  { id: 18, id_marca: 2, nombre: 'Insight', year: 2020 },
  { id: 19, id_marca: 2, nombre: 'Element', year: 2011 },
  { id: 20, id_marca: 2, nombre: 'Ridgeline', year: 2023 },

  // FORD
  { id: 21, id_marca: 3, nombre: 'Mustang', year: 2021 },
  { id: 22, id_marca: 3, nombre: 'F-150', year: 2023 },
  { id: 23, id_marca: 3, nombre: 'Escape', year: 2020 },
  { id: 24, id_marca: 3, nombre: 'Explorer', year: 2022 },
  { id: 25, id_marca: 3, nombre: 'Focus', year: 2019 },
  { id: 26, id_marca: 3, nombre: 'Fusion', year: 2020 },
  { id: 27, id_marca: 3, nombre: 'Edge', year: 2021 },
  { id: 28, id_marca: 3, nombre: 'EcoSport', year: 2022 },
  { id: 29, id_marca: 3, nombre: 'Ranger', year: 2023 },
  { id: 30, id_marca: 3, nombre: 'Bronco', year: 2022 },

  // CHEVROLET
  { id: 31, id_marca: 4, nombre: 'Silverado', year: 2018 },
  { id: 32, id_marca: 4, nombre: 'Camaro', year: 2020 },
  { id: 33, id_marca: 4, nombre: 'Aveo', year: 2019 },
  { id: 34, id_marca: 4, nombre: 'Sonic', year: 2018 },
  { id: 35, id_marca: 4, nombre: 'Cruze', year: 2021 },
  { id: 36, id_marca: 4, nombre: 'Captiva', year: 2020 },
  { id: 37, id_marca: 4, nombre: 'Traverse', year: 2022 },
  { id: 38, id_marca: 4, nombre: 'Tahoe', year: 2023 },
  { id: 39, id_marca: 4, nombre: 'Equinox', year: 2022 },
  { id: 40, id_marca: 4, nombre: 'Malibu', year: 2021 },

  // NISSAN
  { id: 41, id_marca: 5, nombre: 'Sentra', year: 2021 },
  { id: 42, id_marca: 5, nombre: 'Versa', year: 2022 },
  { id: 43, id_marca: 5, nombre: 'Altima', year: 2020 },
  { id: 44, id_marca: 5, nombre: 'Frontier', year: 2023 },
  { id: 45, id_marca: 5, nombre: 'X-Trail', year: 2021 },
  { id: 46, id_marca: 5, nombre: 'Juke', year: 2020 },
  { id: 47, id_marca: 5, nombre: 'Murano', year: 2022 },
  { id: 48, id_marca: 5, nombre: 'Patrol', year: 2023 },
  { id: 49, id_marca: 5, nombre: 'Tiida', year: 2018 },
  { id: 50, id_marca: 5, nombre: 'NP300', year: 2021 },

  // HYUNDAI
  { id: 51, id_marca: 6, nombre: 'Elantra', year: 2023 },
  { id: 52, id_marca: 6, nombre: 'Tucson', year: 2021 },
  { id: 53, id_marca: 6, nombre: 'Santa Fe', year: 2022 },
  { id: 54, id_marca: 6, nombre: 'Accent', year: 2020 },
  { id: 55, id_marca: 6, nombre: 'i10', year: 2019 },
  { id: 56, id_marca: 6, nombre: 'i20', year: 2021 },
  { id: 57, id_marca: 6, nombre: 'Kona', year: 2022 },
  { id: 58, id_marca: 6, nombre: 'Veloster', year: 2021 },
  { id: 59, id_marca: 6, nombre: 'Creta', year: 2023 },
  { id: 60, id_marca: 6, nombre: 'Palisade', year: 2022 },

  // KIA
  { id: 61, id_marca: 7, nombre: 'Rio', year: 2020 },
  { id: 62, id_marca: 7, nombre: 'Sportage', year: 2021 },
  { id: 63, id_marca: 7, nombre: 'Sorento', year: 2022 },
  { id: 64, id_marca: 7, nombre: 'Seltos', year: 2023 },
  { id: 65, id_marca: 7, nombre: 'Soul', year: 2020 },
  { id: 66, id_marca: 7, nombre: 'Cerato', year: 2019 },
  { id: 67, id_marca: 7, nombre: 'Optima', year: 2021 },
  { id: 68, id_marca: 7, nombre: 'Picanto', year: 2022 },
  { id: 69, id_marca: 7, nombre: 'Carens', year: 2023 },
  { id: 70, id_marca: 7, nombre: 'Stinger', year: 2021 },

  // MAZDA
  { id: 91, id_marca: 10, nombre: 'Mazda 2', year: 2020 },
  { id: 92, id_marca: 10, nombre: 'Mazda 3', year: 2022 },
  { id: 93, id_marca: 10, nombre: 'Mazda 6', year: 2021 },
  { id: 94, id_marca: 10, nombre: 'CX-3', year: 2020 },
  { id: 95, id_marca: 10, nombre: 'CX-30', year: 2022 },
  { id: 96, id_marca: 10, nombre: 'CX-5', year: 2023 },
  { id: 97, id_marca: 10, nombre: 'CX-9', year: 2022 },
  { id: 98, id_marca: 10, nombre: 'MX-5', year: 2021 },
  { id: 99, id_marca: 10, nombre: 'BT-50', year: 2020 },
  { id: 100, id_marca: 10, nombre: 'RX-8', year: 2012 },

  // PEUGEOT
  { id: 101, id_marca: 11, nombre: '208', year: 2021 },
  { id: 102, id_marca: 11, nombre: '2008', year: 2020 },
  { id: 103, id_marca: 11, nombre: '308', year: 2022 },
  { id: 104, id_marca: 11, nombre: '3008', year: 2023 },
  { id: 105, id_marca: 11, nombre: '508', year: 2021 },
  { id: 106, id_marca: 11, nombre: '5008', year: 2022 },
  { id: 107, id_marca: 11, nombre: 'Partner', year: 2019 },
  { id: 108, id_marca: 11, nombre: 'Rifter', year: 2021 },
  { id: 109, id_marca: 11, nombre: 'Traveller', year: 2023 },
  { id: 110, id_marca: 11, nombre: 'Expert', year: 2020 },

  // SUBARU
  { id: 111, id_marca: 12, nombre: 'Impreza', year: 2021 },
  { id: 112, id_marca: 12, nombre: 'Legacy', year: 2020 },
  { id: 113, id_marca: 12, nombre: 'Outback', year: 2022 },
  { id: 114, id_marca: 12, nombre: 'Forester', year: 2023 },
  { id: 115, id_marca: 12, nombre: 'WRX', year: 2022 },
  { id: 116, id_marca: 12, nombre: 'BRZ', year: 2021 },
  { id: 117, id_marca: 12, nombre: 'XV', year: 2020 },
  { id: 118, id_marca: 12, nombre: 'Ascent', year: 2023 },
  { id: 119, id_marca: 12, nombre: 'Crosstrek', year: 2021 },
  { id: 120, id_marca: 12, nombre: 'Levorg', year: 2019 },

  // SUZUKI
  { id: 121, id_marca: 13, nombre: 'Swift', year: 2020 },
  { id: 122, id_marca: 13, nombre: 'Baleno', year: 2021 },
  { id: 123, id_marca: 13, nombre: 'Vitara', year: 2022 },
  { id: 124, id_marca: 13, nombre: 'S-Cross', year: 2023 },
  { id: 125, id_marca: 13, nombre: 'Alto', year: 2019 },
  { id: 126, id_marca: 13, nombre: 'Celerio', year: 2020 },
  { id: 127, id_marca: 13, nombre: 'Ignis', year: 2022 },
  { id: 128, id_marca: 13, nombre: 'Ertiga', year: 2021 },
  { id: 129, id_marca: 13, nombre: 'Jimny', year: 2023 },
  { id: 130, id_marca: 13, nombre: 'APV', year: 2018 },

  // RENAULT
  { id: 131, id_marca: 14, nombre: 'Clio', year: 2020 },
  { id: 132, id_marca: 14, nombre: 'Megane', year: 2021 },
  { id: 133, id_marca: 14, nombre: 'Logan', year: 2022 },
  { id: 134, id_marca: 14, nombre: 'Sandero', year: 2023 },
  { id: 135, id_marca: 14, nombre: 'Duster', year: 2021 },
  { id: 136, id_marca: 14, nombre: 'Captur', year: 2022 },
  { id: 137, id_marca: 14, nombre: 'Koleos', year: 2020 },
  { id: 138, id_marca: 14, nombre: 'Kwid', year: 2023 },
  { id: 139, id_marca: 14, nombre: 'Talisman', year: 2019 },
  { id: 140, id_marca: 14, nombre: 'Alaskan', year: 2022 },

  // CHERY
  { id: 141, id_marca: 15, nombre: 'Tiggo 2', year: 2021 },
  { id: 142, id_marca: 15, nombre: 'Tiggo 3', year: 2020 },
  { id: 143, id_marca: 15, nombre: 'Tiggo 4', year: 2022 },
  { id: 144, id_marca: 15, nombre: 'Tiggo 5', year: 2023 },
  { id: 145, id_marca: 15, nombre: 'Tiggo 7', year: 2021 },
  { id: 146, id_marca: 15, nombre: 'Tiggo 8', year: 2022 },
  { id: 147, id_marca: 15, nombre: 'Arrizo 3', year: 2020 },
  { id: 148, id_marca: 15, nombre: 'Arrizo 5', year: 2021 },
  { id: 149, id_marca: 15, nombre: 'Arrizo 6', year: 2022 },
  { id: 150, id_marca: 15, nombre: 'QQ', year: 2019 },

];


function CrearVehiculoModal({ setShowFormAddVehicle, showFormAddVehicle, vehicleEditar, setVehicleEditar, unidad = 'kilometros' }: Props) {

  const pathname = usePathname();

  function closeModalAddVehiculo() {
    setShowFormAddVehicle(false);
    setVehicleEditar({
      marca: '', id: '', kilometraje: 0, placa: '', modelo: '', uid: '', year: '',
      createdAt: { _nanoseconds: 0, _seconds: 0 }, updatedAt: { _nanoseconds: 0, _seconds: 0 }
    });
  }

  return pathname === '/vehiculos' || pathname === '/mantenimientos' ? (
    <View>
      <Portal>
        <FAB
          icon="plus"
          color="#FFFFFF"
          style={pathname === '/vehiculos' ? styles.fabVehiculos : styles.fabMantenimiento}
          onPress={async () => {
            if (pathname === '/vehiculos') {
              setShowFormAddVehicle(true);
            } else {
              const vehiculoLS = await getItem({ key: 'vehiculo', json: true });

              router.push({
                pathname: '/mantenimientos/crear/[id]',
                params: {
                  id: vehiculoLS.id,
                }
              });
            }
          }}
          label={pathname === '/vehiculos' ? 'Agregar Vehículo' : 'Mantenimiento'}
          mode='flat'
          theme={{ colors: { primary: '#1D4ED8', primaryContainer: '#1D4ED8', onPrimaryContainer: '#FFFFFF' } }}
          accessibilityLabel={pathname === '/vehiculos' ? 'Agregar Vehículo' : 'Agregar Mantenimiento'}
          accessibilityRole="button"
        />
      </Portal>

      <Portal>
        <Modal
          visible={showFormAddVehicle}
          onDismiss={closeModalAddVehiculo}
          animationType="slide"
        >
          <View style={styles.modalWrap}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboard}
            >
              <ScrollView
                contentContainerStyle={styles.modalScroll}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.title}>
                  {vehicleEditar?.id ? 'Editar información' : 'Agregar vehículo'}
                </Text>

                <CreateVehicleModalInfoModal
                  setVehicleEditar={setVehicleEditar}
                  vehicleEditar={vehicleEditar}
                  setShowFormAddVehicle={setShowFormAddVehicle}
                  unidad={unidad}
                />
              </ScrollView>
            </KeyboardAvoidingView>

            <Button
              onPress={closeModalAddVehiculo}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>X</Text>
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  ) : null;
}

interface PropsModalInfo {
  vehicleEditar: any | null,
  setVehicleEditar?: (vehicle: any | null) => void
  setShowFormAddVehicle: (value: boolean) => void
  unidad?: string
}

function CreateVehicleModalInfoModal({ vehicleEditar, setShowFormAddVehicle, unidad = 'kilometros' }: PropsModalInfo) {
  const etiquetaDistancia = unidad === 'millas' ? 'MI' : 'KM';

  interface MarcaLocal { id: number | string; marca: string; }
  interface ModeloLocal { id: number | string; id_marca: number | string; nombre: string; year: number; }

  const [marca, setMarca] = useState('');
  const [marcaName, setMarcaName] = useState('Toyota');
  const [modelo, setModelo] = useState('');
  const [marcas, setMarcas] = useState<MarcaLocal[]>(MARCAS);
  const [todosModelos, setTodosModelos] = useState<ModeloLocal[]>(MODELOS);
  const [year, setYear] = useState('');
  const [placa, setPlaca] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [modelos, setModelos] = useState<ModeloLocal[]>(MODELOS.filter(model => model.id_marca.toString() === '1'));
  const marcaRef = useRef(marca);
  marcaRef.current = marca;

  const [alerta, setAlerta] = useState({ message: '', error: false });

  const [isLoading, setIsLoading] = useState(false);


  function validarPlaca(input: string) {
    let cleaned = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length > 7) cleaned = cleaned.slice(0, 7);

    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    }

    setPlaca(formatted.toUpperCase());
  };

  async function onPress() {
    setIsLoading(true);

    const body = { id: vehicleEditar?.id, marca: marcaName, modelo, year, placa, kilometraje }

    // Validacion de campos obligatorios
    if ([marca, modelo, year, placa].includes('')) {
      setAlerta({ message: 'Complete la información para poder agregar un vehículo a tu garaje', error: true });
      setTimeout(() => {
        setAlerta({ message: '', error: false });
        setIsLoading(false);
      }, 3000);
      return;
    }

    if (vehicleEditar?.id) {
      setIsLoading(true);
      try {
        const response = await actualizarVehiculo(body);

        if (response.error) {
          setAlerta({ message: response.message, error: response.error });
          setKilometraje(vehicleEditar?.kilometraje);

          setTimeout(() => {
            setAlerta({ message: '', error: false });
          }, 3000);

          setIsLoading(false);

          return;
        }

        setShowFormAddVehicle(false);
        vehicleEditar.id = '';
        vehicleEditar.placa = '';
        vehicleEditar.year = '';
        vehicleEditar.kilometraje = '';

      } catch {
        setIsLoading(false);
      }
      return;
    }


    // Peticion para agregar vehiculo
    try {
      const response = await crearVehiculo(body);

      if (response.error) {
        setAlerta({ message: response.message, error: response.error });
        return;
      }

      setShowFormAddVehicle(false);

    } catch (error: any) {
      setAlerta({ message: error.response.data.message, error: error.response.data.error });
    } finally {
      setIsLoading(false);
    }

  }

  useEffect(() => {
    getCatalogoVehiculos();
    async function getCatalogoVehiculos() {
      // Marcas y modelos desde el backend; si falla, se usa el local de respaldo.
      const [respMarcas, respModelos] = await Promise.all([getMarcas(), getModelos()]);
      let listaMarcas: MarcaLocal[] = MARCAS;
      if (respMarcas && Array.isArray(respMarcas.data) && respMarcas.data.length > 0) {
        listaMarcas = (respMarcas.data as MarcaCatalogo[]).map((m) => ({ id: m.id, marca: m.nombre }));
        setMarcas(listaMarcas);
      }
      if (respModelos && Array.isArray(respModelos.data) && respModelos.data.length > 0) {
        setTodosModelos(
          (respModelos.data as ModeloCatalogo[]).map((m) => ({
            id: m.id,
            id_marca: m.marcaId,
            nombre: m.nombre,
            year: m.year ?? new Date().getFullYear(),
          }))
        );
      }
      // Si la marca actual no existe en la lista, seleccionar la primera.
      if (listaMarcas.length > 0 && !listaMarcas.some((m) => String(m.id) === String(marcaRef.current))) {
        setMarca(String(listaMarcas[0].id));
        setMarcaName(listaMarcas[0].marca);
      }
    }
  }, []);

  useEffect(() => {
    if (vehicleEditar) {
      setMarca(vehicleEditar.marca.toString());
      setModelo(vehicleEditar.modelo);
      setYear(vehicleEditar.year.toString());
      setPlaca(vehicleEditar.placa || '');
      setKilometraje(vehicleEditar.kilometraje.toString());
    } else {
      // Resetear campos si no hay vehículo a editar
      setMarca('1');
      setMarcaName('Toyota');
      setModelo('');
      setYear('');
      setPlaca('');
      setKilometraje('');
    }
  }, [vehicleEditar]);

  useEffect(() => {
    const modelosFiltrados = todosModelos.filter(model => model.id_marca.toString() === marca.toString());
    setModelos(modelosFiltrados);
  }, [marca, todosModelos]);

  return (
    <View>

      <AlertaMessage alerta={alerta} />

      <Text style={styles.microcopy}>
        {vehicleEditar?.id ? 'Actualiza la información de tu vehículo. Asegúrate de que los datos sean correctos antes de guardar los cambios.'
          : 'Completa la información técnica para registrar el vehículo'
        }
      </Text>

      {!vehicleEditar?.id ? (
        <>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            inputSearchStyle={styles.dropdownSearch}
            containerStyle={styles.dropdownList}
            itemTextStyle={styles.dropdownItemText}
            iconColor='#1D4ED8'
            placeholder='Selecciona la marca del vehículo *'
            searchPlaceholder='Buscar marca'
            data={marcas}
            labelField='marca'
            valueField='id_marca'
            onChange={item => {
              setMarca(item.id);
              setMarcaName(item.marca);
            }}
            maxHeight={400}
            search
          />

          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            inputSearchStyle={styles.dropdownSearch}
            containerStyle={styles.dropdownList}
            itemTextStyle={styles.dropdownItemText}
            iconColor='#1D4ED8'
            placeholder='Selecciona el modelo del vehículo *'
            searchPlaceholder='Buscar modelo'
            data={modelos} // Filtrar por marca seleccionada
            labelField='nombre'
            valueField='nombre'
            value={modelo}
            onChange={item => {
              setModelo(item.nombre);
            }}
            search
            maxHeight={400}
          />
        </>
      ) : null}

      <TextInput
        placeholder='Año del vehículo *'
        label='Año *'
        keyboardType='numeric'
        style={styles.input}
        maxLength={4}
        value={year}
        onChangeText={text => setYear(text)}
        disabled={isLoading}
        underlineColor='transparent'
        activeUnderlineColor='#1D4ED8'
        cursorColor='#1D4ED8'
        left={<TextInput.Icon icon='calendar' />}
      />

      <TextInput
        placeholder='ABC 1234'
        label='Placa *'
        style={styles.input}
        value={placa.toUpperCase()}
        autoCapitalize='characters'
        maxLength={8}
        onChangeText={text => validarPlaca(text)}
        disabled={isLoading || vehicleEditar?.id}
        underlineColor='transparent'
        activeUnderlineColor='#1D4ED8'
        cursorColor='#1D4ED8'
        left={<TextInput.Icon icon='card-account-details' />}
      />

      <TextInput
        placeholder={`Kilometraje del vehículo (${etiquetaDistancia}) *`}
        label={`Kilometraje (${etiquetaDistancia}) *`}
        keyboardType='numeric'
        style={styles.input}
        value={kilometraje}
        onChangeText={text => setKilometraje(text)}
        disabled={isLoading}
        underlineColor='transparent'
        activeUnderlineColor='#1D4ED8'
        cursorColor='#1D4ED8'
        left={<TextInput.Icon icon='speedometer' />}
      />

      <Button
        mode="contained"
        onPress={onPress}
        style={styles.submit}
        labelStyle={styles.submitLabel}
        disabled={isLoading}
      >
        {vehicleEditar?.id ? 'Actualizar Información del vehículo' : 'Agregar Vehículo'}
      </Button>

    </View>
  );

}


const styles = StyleSheet.create({
  modalWrap: {
    flex: 1,
    backgroundColor: '#EDF1F7',
  },
  modalKeyboard: {
    flex: 1,
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingVertical: 24,
    paddingHorizontal: 6,
  },
  modalClose: {
    position: 'absolute',
    top: 20,
    right: 5,
  },
  modalCloseText: {
    fontSize: 25,
    color: '#0F2A5C',
    fontWeight: '900',
  },
  microcopy: {
    color: '#5B6B7F',
    fontSize: 14,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#F7F9FD',
    margin: 10,
    borderRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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

  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    color: '#0F2A5C',
  },
  submit: {
    margin: 10,
    borderRadius: 16,
    backgroundColor: '#1D4ED8',
  },
  submitLabel: {
    fontWeight: '800',
  },
  fabVehiculos: {
    width: 170,
    position: 'absolute',
    bottom: 70,
    right: 10,
    backgroundColor: '#1D4ED8',
  },
  fabMantenimiento: {
    width: 200,
    position: 'absolute',
    bottom: 70,
    right: 10,
    backgroundColor: '#1D4ED8',
  },
  dropdown: {
    height: 54,
    borderColor: '#1D4ED8',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 12,
    margin: 10,
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
  separador: {
    marginVertical: 20,
  },
});

export default CrearVehiculoModal;
