import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Text, TextInput } from 'react-native-paper';

import { AlertaMessage, MicroCopy, Overlay } from '@/src/components/shared';
import { esEmailValido } from '@/src/helpers';
import { loginUser, saveItem } from '@/src/services';


function mensajeBackend(code?: number): string {
  switch (code) {
    case 403:
      return 'Debes activar tu cuenta desde el enlace enviado a tu correo';
    case 401:
      return 'Sesión inválida o vencida. Inicia sesión de nuevo';
    case 404:
      return 'No encontramos tu cuenta. Verifica el correo o crea una cuenta';
    default:
      return 'No se pudo iniciar sesión. Revisa tu conexión e intenta de nuevo';
  }
}


function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [alerta, setAlerta] = useState({ error: true, message: '' });
  const [isLoading, setIsLoading] = useState(false);


  async function onPress() {
    try {
      if (!esEmailValido(email)) {
        setAlerta({
          error: true,
          message: 'Ingresa un correo electrónico válido para continuar',
        });
        setTimeout(() => {
          setAlerta({ error: false, message: '' });
        }, 3000);
        return;
      }

      if (!password || password.length < 8) {
        setAlerta({
          error: true,
          message: 'La contraseña debe tener al menos 8 caracteres',
        });
        setTimeout(() => {
          setAlerta({ error: false, message: '' });
        }, 3000);
        return;
      }

      Keyboard.dismiss();
      const body = {
        email, password,
      }

      setAlerta({
        error: false,
        message: '',
      });

      setIsLoading(true);

      // HTTP directo a la API con los services existentes.
      const data = await loginUser(body);

      // Cualquier respuesta no exitosa muestra el mensaje del backend
      // (403 cuenta sin activar, 404, 401) o un respaldo si vino vacío.
      if (!data || data.code !== 200 || data.error) {
        setIsLoading(false);
        setAlerta({
          error: true,
          message: data?.message || mensajeBackend(data?.code),
        });
        return;
      }

      setAlerta({
        error: false,
        message: data.message || 'Bienvenido',
      });

      if (data.token) {
        await saveItem({ key: 'token', value: data.token, json: false });
        // La API no devuelve el email en /usuarios/info: se guarda al iniciar sesión.
        await saveItem({ key: 'usuario_email', value: data.usuario?.email ?? email.toLowerCase(), json: false });
        await saveItem({ key: 'usuario_nombre', value: data.usuario?.nombre ?? '', json: false });
      }

      setIsLoading(false);


      setTimeout(() => {
        router.replace('/vehiculos');
      }, 1000);


    } catch {
      setIsLoading(false);
      setAlerta({
        error: true,
        message: 'Ocurrió un error inesperado. Intenta de nuevo',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.screen}
    >

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

        <View style={styles.container}>

          <Overlay
            visible={isLoading}
            message='Validando credenciales...'
          />

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
            <Text style={styles.heroTitle}>Hola de nuevo</Text>
            <Text style={styles.heroSubtitle}>Ingresa para abrir tu garaje y no perder ningún mantenimiento.</Text>
          </LinearGradient>

          <AlertaMessage
            alerta={alerta}
          />

          <MicroCopy text='Ingresa tus datos para acceder a tu garaje' />

          <TextInput
            mode='flat'
            label='Correo electrónico'
            placeholder='Ingresa tu correo'
            keyboardType='email-address'
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            left={<TextInput.Icon icon='email' size={25} />}
            underlineColor='transparent'
            activeUnderlineColor='#1D4ED8'
            cursorColor='#1D4ED8'
            autoCapitalize='none'
          />


          <TextInput
            label='Contraseña'
            secureTextEntry={!showPassword}
            value={password}
            style={styles.input}
            onChangeText={setPassword}
            underlineColor='transparent'
            activeUnderlineColor='#1D4ED8'
            cursorColor='#1D4ED8'
            left={<TextInput.Icon icon='lock' size={25} />}
            right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
          />

          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => router.replace('/auth/signup')} activeOpacity={0.7}>
              <Text style={styles.link}>¿No tienes una cuenta? Crea una</Text>
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
              <Text style={styles.buttonText}>Entrar a mi garaje</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>

    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EDF1F7',
  },
  container: {
    width: '90%',
    margin: 'auto',
    justifyContent: 'center',
    flex: 1,
  },
  hero: {
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
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
  },
});

export default LoginScreen;
