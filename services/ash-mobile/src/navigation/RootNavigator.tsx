import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import StoreScannerScreen from '../screens/StoreScannerScreen';
import CashierPOSScreen from '../screens/CashierPOSScreen';
import WarehouseScreen from '../screens/WarehouseScreen';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  StoreScanner: undefined;
  CashierPOS: undefined;
  Warehouse: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  // Show loading indicator while checking auth
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {!user ? (
        // Auth screens
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        // App screens
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Ashley AI Mobile' }}
          />
          <Stack.Screen
            name="StoreScanner"
            component={StoreScannerScreen}
            options={{ title: 'Store Scanner' }}
          />
          <Stack.Screen
            name="CashierPOS"
            component={CashierPOSScreen}
            options={{ title: 'Cashier POS' }}
          />
          <Stack.Screen
            name="Warehouse"
            component={WarehouseScreen}
            options={{ title: 'Warehouse Management' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
