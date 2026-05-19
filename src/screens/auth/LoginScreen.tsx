import { useState } from 'react';
import { Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

import { router } from 'expo-router';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlertaMessage, AppBrand, MicroCopy, Overlay } from '@/src/components/shared';
import { loginUser, saveItem } from '@/src/services';


function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [alerta, setAlerta] = useState({ error: true, message: '' });
  const [isLoading, setIsLoading] = useState(false);


  async function onPress() {
    try {
      if (email.trim().includes(' ')) {
        setAlerta({
          error: true,
          message: 'Ingresa tu correo electrónico para continuar',
        });
        setTimeout(() => {
          setAlerta({ error: false, message: '' });
        }, 3000);
        return;
      }

      if (password.trim().includes(' ')) {
        setAlerta({
          error: true,
          message: 'No olvides ingresar tu contraseña',
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
      const data = await loginUser(body);

      setAlerta({
        error: data.error,
        message: data.message,
      });
      await saveItem({ key: 'token', value: data.token, json: false });

      setIsLoading(false);


      if (data.code === 200) {
        setTimeout(() => {
          router.replace('/vehiculos');
        }, 1000);
      }


    } catch (error: any) {
      console.log('error login');
      console.log(error);

      // setAlerta({
      //   error: error.response.data.error,
      //   message: error.response.data.message,
      // });
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
              activeUnderlineColor='transparent'
              cursorColor='#6A51AE'
            />

            <TextInput
              label='Contraseña'
              secureTextEntry={!showPassword}
              value={password}
              style={styles.input}
              onChangeText={setPassword}
              underlineColor='transparent'
              activeUnderlineColor='transparent'
              cursorColor='#6A51AE'
              left={<TextInput.Icon icon='lock' size={25} />}
              right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBlock: 6 }}>
              <TouchableOpacity onPress={() => router.replace('/auth/signup')} activeOpacity={0.7}>
                <Text style={{ color: '#3b2c63', fontSize: 12 }}>¿No tienes una cuenta? Crea una</Text>
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
              Iniciar Sesión
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

export default LoginScreen;
