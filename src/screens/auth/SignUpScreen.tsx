import { useState } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Text, TextInput } from 'react-native-paper';

import { AppBrand, MicroCopy, Overlay } from '@/src/components/shared';
import apiClient from '@/src/config/client/axios';


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
        console.log('CAMPOS OBLIGATORIOS');
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


    } catch (error: any) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView>

      <Overlay
        visible={isLoading}
        message='Validando credenciales...'
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <AppBrand />


          <View style={styles.container}>
            <MicroCopy text='Completa los siguientes campos para crear una cuenta' />
            {alerta.show && (
              <Text style={{ textAlign: 'center', marginBottom: 10, color: alerta.error ? '#a90b0b' : '#10a90b', fontWeight: 'bold' }}>{alerta.message}</Text>
            )}
            <TextInput
              label='Nombre'
              placeholder='Ingresa tu correo'
              style={styles.input}
              left={<TextInput.Icon icon='account' />}
              value={nombre}
              onChangeText={setNombre}
              underlineColor='transparent'
              activeUnderlineColor='transparent'
              cursorColor='#6A51AE'
            />

            <TextInput
              label='Correo electronico'
              placeholder='Ingresa tu correo'
              keyboardType='email-address'
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              left={<TextInput.Icon icon='email' />}
              underlineColor='transparent'
              activeUnderlineColor='transparent'
              cursorColor='#6A51AE'
            />

            <TextInput
              label='Contraseña'
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              underlineColor='transparent'
              activeUnderlineColor='transparent'
              style={styles.input}
              cursorColor='#6A51AE'
              left={<TextInput.Icon icon='lock' />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBlock: 6 }}>
              <TouchableOpacity onPress={() => router.replace('/auth/login')} activeOpacity={0.7}>
                <Text style={{ color: '#3b2c63', fontSize: 12 }}>¿Ya tienes una cuenta? Inicia sesión</Text>
              </TouchableOpacity>
              {/* <Text style={{ color: 'blue', fontSize: 12 }}>¿Olvidaste la contraseña?</Text> */}
            </View>

            <Button
              mode='contained'
              style={{ marginTop: 20, borderRadius: 12, paddingBlock: 4 }}
              labelStyle={{ fontWeight: 'bold' }}
              onPress={onPress}
              disabled={isLoading}
            >
              Crear Cuenta
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    margin: 'auto',
    height: 400,
    justifyContent: 'center'
  },
  input: {
    marginBottom: 12,
    borderRadius: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  }
});

export default SignUpScreen;
