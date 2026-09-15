import { Stack } from "expo-router";
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{ headerTitleAlign: 'center' }}
      >
        {/* Public Routes */}
        <Stack.Screen
          name='index'
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name='auth/login'
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='auth/signup'
          options={{ headerShown: false }}
        />

        {/* Private Routes */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name='mantenimientos/index'
          options={{
            headerTitle: 'Lista de mantenimientos'
          }}
        />

        <Stack.Screen
          name="mantenimientos/crear/[id]"
          options={{
            headerTitle: 'Agregar mantenimientos',
            contentStyle: {
              backgroundColor: '#FFF'
            }
          }}
        />


      </Stack>
    </PaperProvider>
  )
}
