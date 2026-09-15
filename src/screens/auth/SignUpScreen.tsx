import { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Text, TextInput } from 'react-native-paper';

import { MicroCopy, Overlay } from '@/src/components/shared';
import apiClient from '@/src/config/client/axios';
import { esEmailValido } from '@/src/helpers';


function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(false);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alerta, setAlerta] = useState({ error: true, message: '', show: false });
  const [isLoading, setIsLoading] = useState(false);

  async function onPress() {
    try {
      if ([nombre, email, password].includes('')) {
        mostrarError('Completa todos los campos para crear tu cuenta');
        return;
      }

      if (!esEmailValido(email)) {
        mostrarError('Ingresa un correo electrónico válido');
        return;
      }

      if (password.length < 8) {
        mostrarError('La contraseña debe tener al menos 8 caracteres');
        return;
      }

      Keyboard.dismiss();
      const body = {
        nombre, email, password,
      }

      setAlerta({
        error: false,
        message: '',
        show: false,
      });

      setIsLoading(true);
      const { data } = await apiClient.post('/auth/signup', body);

      setAlerta({
        error: data.error,
        message: data.message,
        show: true
      });

      setIsLoading(false);

      if (data.code === 201) {
        setTimeout(() => {
          router.replace('/auth/login');
        }, 1000);
      }


    } catch {
      mostrarError('No se pudo crear la cuenta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  function mostrarError(message: string) {
    setAlerta({ error: true, message, show: true });
    setTimeout(() => {
      setAlerta({ error: false, message: '', show: false });
    }, 3000);
  }

  return (
    <SafeAreaView style={styles.screen}>

      <Overlay
        visible={isLoading}
        message='Validando credenciales...'
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.wrapper}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps='handled'
        >
          <LinearGradient
            colors={['#1E3A8A', '#1D4ED8', '#DC2626']}
            locations={[0, 0.6, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroMark}>
              <Text style={styles.heroMarkText}>ACR</Text>
            </View>
            <Text style={styles.heroTitle}>Crea tu cuenta</Text>
            <Text style={styles.heroSubtitle}>Guarda tus vehículos y recibe avisos antes de cada falla.</Text>
          </LinearGradient>


          <View style={styles.container}>
            <MicroCopy text='Completa los siguientes campos para crear una cuenta' />
            {alerta.show && (
              <Text style={[styles.alertText, alerta.error ? styles.alertError : styles.alertOk]}>{alerta.message}</Text>
            )}
            <TextInput
              label='Nombre'
              placeholder='Ingresa tu nombre'
              style={styles.input}
              left={<TextInput.Icon icon='account' />}
              value={nombre}
              onChangeText={setNombre}
              underlineColor='transparent'
              activeUnderlineColor='#1D4ED8'
              cursorColor='#1D4ED8'
            />

            <TextInput
              label='Correo electronico'
              placeholder='Ingresa tu correo'
              keyboardType='email-address'
              style={styles.input}
              value={email}
              onChangeText={text => setEmail(text.toLowerCase())}
              left={<TextInput.Icon icon='email' />}
              underlineColor='transparent'
              activeUnderlineColor='#1D4ED8'
              cursorColor='#1D4ED8'
              autoCapitalize='none'
            />

            <TextInput
              label='Contraseña'
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              underlineColor='transparent'
              activeUnderlineColor='#1D4ED8'
              style={styles.input}
              cursorColor='#1D4ED8'
              left={<TextInput.Icon icon='lock' />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />

            <View style={styles.linkRow}>
              <TouchableOpacity onPress={() => router.replace('/auth/login')} activeOpacity={0.7}>
                <Text style={styles.link}>¿Ya tienes una cuenta? Inicia sesión</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={onPress}
              disabled={isLoading}
              activeOpacity={0.85}
              style={[styles.buttonWrap, isLoading && styles.buttonDisabled]}
            >
              <LinearGradient
                colors={['#1D4ED8', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Crear cuenta</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EDF1F7',
  },
  wrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  container: {
    width: '90%',
    margin: 'auto',
    marginTop: 4,
    justifyContent: 'flex-start'
  },
  hero: {
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    width: '90%',
    marginInline: 'auto',
    marginBottom: 6,
  },
  heroMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroMarkText: {
    color: '#1D4ED8',
    fontSize: 20,
    fontWeight: '900',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 10,
  },
  heroSubtitle: {
    color: '#D7E3F8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
    borderRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#F7F9FD',
  },
  alertText: {
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  alertError: {
    color: '#a90b0b',
  },
  alertOk: {
    color: '#10a90b',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBlock: 6,
  },
  link: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonWrap: {
    marginTop: 20,
    borderRadius: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  }
});

export default SignUpScreen;
