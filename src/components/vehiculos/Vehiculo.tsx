import { formatearDistancia } from '@/src/helpers';
import { Vehiculo as IVehiculo } from '@/src/interfaces/vehiculos';
import { StyleSheet, Text, View } from 'react-native';
import { Icon } from 'react-native-paper';


interface Props {
  vehiculo: IVehiculo
  conteoMantenimientos?: number
  progreso?: number
  unidad?: string
}

function Vehiculo({ vehiculo, conteoMantenimientos = 0, progreso = 12, unidad = 'kilometros' }: Props) {
  return (
    <View style={styles.card}>

      <View style={styles.visual}>
        <View style={styles.iconBox}>
          <Icon size={28} source='car' color='#FFFFFF' />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.placa}>{vehiculo.placa}</Text>
          <Text style={styles.title}>{vehiculo.marca} {vehiculo.modelo}</Text>
          <Text style={styles.subtitle}>
            {conteoMantenimientos} {conteoMantenimientos === 1 ? 'mantenimiento registrado' : 'mantenimientos registrados'}
          </Text>
        </View>

        <Icon size={26} source='chevron-right' color='#1D4ED8' />
      </View>

      <View style={styles.body}>
        <View style={styles.specs}>
          <View style={styles.spec}>
            <Icon size={16} source='calendar' color='#1D4ED8' />
            <Text style={styles.specText}>Año <Text style={styles.specBold}>{vehiculo.year}</Text></Text>
          </View>
          <View style={styles.spec}>
            <Icon size={16} source='speedometer' color='#1D4ED8' />
            <Text style={styles.specText}>{formatearDistancia(vehiculo.kilometraje, unidad)}</Text>
          </View>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, Math.max(0, progreso))}%` }]} />
        </View>

        <Text style={styles.hint}>Toca para abrir · Mantén presionado para editar</Text>
      </View>

    </View>
  )
}

export default Vehiculo

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D3DCE9',
    borderLeftWidth: 6,
    borderLeftColor: '#1D4ED8',
    overflow: 'hidden',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  visual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 2,
    borderBottomColor: '#D3DCE9',
    padding: 14,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placa: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    color: '#1E40AF',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#1D4ED8',
    overflow: 'hidden',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F2A5C',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5B6B7F',
    marginTop: 2,
  },
  body: {
    padding: 13,
  },
  specs: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 999,
  },
  specText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  specBold: {
    color: '#0F2A5C',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#E2E8F2',
    borderRadius: 99,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D3DCE9',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1D4ED8',
    borderRadius: 99,
  },
  hint: {
    fontSize: 11,
    color: '#8A99AD',
    marginTop: 10,
    textAlign: 'center',
  },
});
