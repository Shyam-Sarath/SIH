// Root Navigator — decides auth vs role-based navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../store/AuthContext';
import { Colors } from '../theme';
import AuthNavigator from './AuthNavigator';
import FarmerNavigator from './FarmerNavigator';
import DriverNavigator from './DriverNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { isLoading, isAuthenticated, userRole } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primaryLight} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      {userRole === 'farmer' && <FarmerNavigator />}
      {userRole === 'driver' && <DriverNavigator />}
      {userRole === 'admin' && <AdminNavigator />}
    </NavigationContainer>
  );
}
