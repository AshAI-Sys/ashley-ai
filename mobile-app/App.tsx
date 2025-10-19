import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { Provider as PaperProvider } from 'react-native-paper'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

// Screens
import LoginScreen from './src/screens/LoginScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import QRScannerScreen from './src/screens/QRScannerScreen'
import ProductionTrackingScreen from './src/screens/ProductionTrackingScreen'
import BundleDetailsScreen from './src/screens/BundleDetailsScreen'

// Types
export type RootStackParamList = {
  Login: undefined
  Dashboard: undefined
  QRScanner: undefined
  ProductionTracking: undefined
  BundleDetails: { bundleId: string }
}

const Stack = createStackNavigator<RootStackParamList>()

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#3b82f6',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Dashboard"
              component={DashboardScreen}
              options={{ title: 'Ashley AI - Dashboard' }}
            />
            <Stack.Screen
              name="QRScanner"
              component={QRScannerScreen}
              options={{ title: 'Scan Bundle QR Code' }}
            />
            <Stack.Screen
              name="ProductionTracking"
              component={ProductionTrackingScreen}
              options={{ title: 'Production Tracking' }}
            />
            <Stack.Screen
              name="BundleDetails"
              component={BundleDetailsScreen}
              options={{ title: 'Bundle Details' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </GestureHandlerRootView>
  )
}
