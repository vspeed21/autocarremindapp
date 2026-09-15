import { cerrarSesion, getCurrentUserInfo, getItem, saveItem, updateUserConfig } from '@/src/services';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, List, Text } from 'react-native-paper';


function MasInfoScreen() {
  const TIPOS_UND_MEDIDA = [
    { id: 'kilometros', nombre: 'Kilómetros' },
    { id: 'millas', nombre: 'Millas' },
  ]

  const [unidadMedida, setUnidadMedida] = useState('');
  const [currentUser, setCurrentUser] = useState({ nombre: '', config: { unidad: '' } });
  const [email, setEmail] = useState('');

  useEffect(() => {
    getInfoUser();
    async function getInfoUser() {
      const response = await getCurrentUserInfo();
      if (!response || response.error) return;
      setCurrentUser(response);
      setUnidadMedida(response?.config?.unidad ?? currentUser.config.unidad);

      if (response?.email) {
        setEmail(response.email);
      } else {
        const emailLS = await getItem({ key: 'usuario_email', json: false });
        if (emailLS) setEmail(emailLS);
      }
    }
  }, [currentUser.config.unidad]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(currentUser.nombre || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.profileName}>{currentUser.nombre || 'Mi cuenta'}</Text>
        {email ? <Text style={styles.profileEmail}>{email}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preferencias</Text>
        <Text style={styles.label}>Unidad de medida</Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelectedText}
          containerStyle={styles.dropdownList}
          itemTextStyle={styles.dropdownItemText}
          iconColor='#1D4ED8'
          placeholder='Seleccione tipo de medida'
          data={TIPOS_UND_MEDIDA}
          labelField='nombre'
          valueField='id'
          value={unidadMedida}
          onChange={async (item) => {
            const anterior = unidadMedida;
            setUnidadMedida(item.id);
            // Persiste la unidad en el backend (convierte los valores guardados);
            // si falla, revierte en pantalla. Avisa al garaje para recargar.
            const resp = await updateUserConfig({ unidad: item.id });
            if (resp?.error) {
              setUnidadMedida(anterior);
            } else {
              await saveItem({ key: 'unidad_cambiada', value: '1', json: false });
            }
          }}
          maxHeight={400}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ayuda</Text>
        <List.AccordionGroup>
          <List.Accordion title="¿Cómo funcionan las notificaciones?" id="1" titleStyle={styles.accordionTitle}>
            <Text style={styles.accordionText}>Al guardar un mantenimiento se calcula su próximo cambio. La app te avisa cuando la fecha o el kilometraje están cerca.</Text>
          </List.Accordion>

          <List.Accordion title="¿Cuántos vehículos puedo tener?" id="2" titleStyle={styles.accordionTitle}>
            <Text style={styles.accordionText}>Hasta 3 vehículos por cuenta. La placa es única y el kilometraje nunca puede bajar al editar.</Text>
          </List.Accordion>

        </List.AccordionGroup>
      </View>

      <Button onPress={cerrarSesion} buttonColor='#DC2626' textColor='#FFFFFF' style={styles.logout}>
        Cerrar sesión
      </Button>

    </ScrollView>
  )
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EDF1F7',
  },
  content: {
    paddingBottom: 24,
  },
  profile: {
    backgroundColor: '#1D4ED8',
    borderRadius: 24,
    margin: 12,
    marginBottom: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  profileName: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8,
  },
  profileEmail: {
    textAlign: 'center',
    color: '#D7E3F8',
    fontSize: 13,
    marginTop: 2,
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
  accordionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F2A5C',
  },
  accordionText: {
    fontSize: 13,
    color: '#5B6B7F',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logout: {
    marginHorizontal: 12,
    marginTop: 14,
    borderRadius: 14,
  },
});

export default MasInfoScreen;
