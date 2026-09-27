import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', headerTitleAlign: 'center' }}>
      <Tabs.Screen
        name="vehiculos/index"
        options={{
          title: 'Mi garaje',
          tabBarIcon: ({ color, focused }) => <FontAwesome size={focused ? 25 : 20} name="car" color={color} />,
        }}
      />
      <Tabs.Screen
        name="recordatorios/index"
        options={{
          title: 'Recordatorios',
          tabBarIcon: ({ color, focused }) => <FontAwesome size={focused ? 25 : 20} name="bell" color={color} />,
        }}
      />
      <Tabs.Screen
        name="combustible/index"
        options={{
          title: 'Combustible',
          tabBarIcon: ({ color, focused }) => <FontAwesome size={focused ? 25 : 20} name="tint" color={color} />,
        }}
      />
      <Tabs.Screen
        name="graficas/index"
        options={{
          title: 'Gráficas',
          tabBarIcon: ({ color, focused }) => <FontAwesome size={focused ? 25 : 20} name="bar-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mas-info/index"
        options={{
          tabBarIcon: ({ color, focused }) => <FontAwesome size={focused ? 25 : 20} name="reorder" color={color} />,
          title: 'Más',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

export default TabsLayout;
