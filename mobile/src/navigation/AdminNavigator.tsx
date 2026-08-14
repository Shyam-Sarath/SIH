// Admin Bottom Tab Navigator — inside the same React Native app
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '../theme';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminDriversScreen from '../screens/admin/AdminDriversScreen';
import AdminFarmersScreen from '../screens/admin/AdminFarmersScreen';

const Tab = createBottomTabNavigator();

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.surfaceBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: Colors.adminColor,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, any> = {
            Dashboard: focused ? 'stats-chart' : 'stats-chart-outline',
            Orders: focused ? 'list' : 'list-outline',
            Drivers: focused ? 'car' : 'car-outline',
            Farmers: focused ? 'leaf' : 'leaf-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Tab.Screen name="Orders" component={AdminOrdersScreen} />
      <Tab.Screen name="Drivers" component={AdminDriversScreen} />
      <Tab.Screen name="Farmers" component={AdminFarmersScreen} />
    </Tab.Navigator>
  );
}
