import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { PlaceholderView } from '@/src/components/shared';
import { SimpleSkeleton } from '@/src/components/skeleton';
import { fechaToDate, formatearMoneda } from '@/src/helpers';
import { Mantenimiento } from '@/src/interfaces/mantenimientos';
import { getMisMantenimientos } from '@/src/services';


const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const COLORES_TOP = ['#1D4ED8', '#DC2626', '#16A34A', '#F59E0B', '#7C3AED'];

interface MesGasto {
  key: string;
  label: string;
  total: number;
}

function ultimos6Meses(): MesGasto[] {
  const hoy = new Date();
  const meses: MesGasto[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    meses.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: MESES_CORTO[d.getMonth()],
      total: 0,
    });
  }
  return meses;
}

function GraficasScreen() {
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const cargar = async () => {
    try {
      setIsLoading(true);
      const mantesResp = await getMisMantenimientos();
      const todos: Mantenimiento[] = mantesResp?.data ?? [];
      setMantenimientos(todos);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  const meses = ultimos6Meses();
  mantenimientos.forEach((m) => {
    const fecha = fechaToDate(m.fecha);
    if (!fecha) return;
    const key = `${fecha.getFullYear()}-${fecha.getMonth()}`;
    const mes = meses.find((x) => x.key === key);
    if (mes) mes.total += (Number(m.costo_manoobra) || 0) + (Number(m.costo_repuestos) || 0);
  });
  const maxMes = Math.max(...meses.map((x) => x.total), 1);
  const totalSemestre = meses.reduce((acc, x) => acc + x.total, 0);

  const conteos: Record<string, number> = {};
  mantenimientos.forEach((m) => {
    conteos[m.nombre] = (conteos[m.nombre] || 0) + 1;
  });
  const top = Object.entries(conteos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const totalTop = top.reduce((acc, [, c]) => acc + c, 0) || 1;

  if (isLoading) {
    return (
      <>
        <SimpleSkeleton />
        <SimpleSkeleton />
      </>
    );
  }

  if (!mantenimientos.length) {
    return (
      <PlaceholderView
        icon={{ source: 'chart-bar', color: '#1D4ED8', size: 110 }}
        message1='Sin datos para graficar'
        message2='Registra mantenimientos y aquí verás tus gastos y los más usados.'
      />
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gráficas</Text>
        <Text style={styles.headerSub}>Se generan con tus mantenimientos registrados</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Gasto por mes · últimos 6 meses</Text>
        {meses.map((mes) => (
          <View key={mes.key} style={styles.barRow}>
            <Text style={styles.barLabel}>{mes.label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${mes.total ? Math.max(5, Math.round((mes.total / maxMes) * 100)) : 0}%` }]} />
            </View>
            <Text style={styles.barValue}>{formatearMoneda(mes.total)}</Text>
          </View>
        ))}
        <Text style={styles.totalLine}>Total 6 meses: {formatearMoneda(totalSemestre)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mantenimientos más usados · top 5</Text>
        {top.map(([nombre, cantidad], i) => (
          <View key={nombre} style={styles.topRow}>
            <View style={[styles.dot, { backgroundColor: COLORES_TOP[i % COLORES_TOP.length] }]} />
            <View style={styles.topInfo}>
              <Text style={styles.topNombre} numberOfLines={1}>{nombre}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${Math.round((cantidad / totalTop) * 100)}%`, backgroundColor: COLORES_TOP[i % COLORES_TOP.length] }]} />
              </View>
            </View>
            <Text style={styles.topCantidad}>{cantidad} ({Math.round((cantidad / totalTop) * 100)}%)</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EDF1F7',
  },
  content: {
    paddingBottom: 110,
  },
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
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  barLabel: {
    width: 34,
    fontSize: 12,
    fontWeight: '700',
    color: '#5B6B7F',
    textTransform: 'capitalize',
  },
  barTrack: {
    flex: 1,
    height: 14,
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
    width: 72,
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2A5C',
    textAlign: 'right',
  },
  totalLine: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F2A5C',
    marginTop: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  topInfo: {
    flex: 1,
  },
  topNombre: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F2A5C',
    marginBottom: 4,
  },
  topCantidad: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2A5C',
  },
});

export default GraficasScreen;
