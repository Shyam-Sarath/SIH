// Farmer Bottom Tab Navigator
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize } from '../theme';
import FarmerHomeScreen from '../screens/farmer/FarmerHomeScreen';
import FarmerOrdersScreen from '../screens/farmer/FarmerOrdersScreen';
import FarmerOffersScreen from '../screens/farmer/FarmerOffersScreen';
import FarmerProfileScreen from '../screens/farmer/FarmerProfileScreen';

const Tab = createBottomTabNavigator();

export default function FarmerNavigator() {
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
        tabBarActiveTintColor: Colors.farmerColor,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<string, any> = {
            Home: focused ? 'home' : 'home-outline',
            'My Orders': focused ? 'cube' : 'cube-outline',
            Offers: focused ? 'notifications' : 'notifications-outline',
            Profile: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={FarmerHomeScreen} />
      <Tab.Screen name="My Orders" component={FarmerOrdersScreen} />
      <Tab.Screen name="Offers" component={FarmerOffersScreen} />
      <Tab.Screen name="Profile" component={FarmerProfileScreen} />
    </Tab.Navigator>
  );
}
