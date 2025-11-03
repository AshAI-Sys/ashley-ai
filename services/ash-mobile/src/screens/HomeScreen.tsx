import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/config';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.cardsContainer}>
          <Text style={styles.sectionTitle}>Select a Feature</Text>

          {/* Store Scanner Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('StoreScanner')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
              <Text style={styles.iconText}>📱</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Store Scanner</Text>
              <Text style={styles.cardDescription}>
                Scan QR codes to view product information and stock levels
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Cashier POS Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CashierPOS')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
              <Text style={styles.iconText}>💰</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Cashier POS</Text>
              <Text style={styles.cardDescription}>
                Process sales transactions and manage customer orders
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Warehouse Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Warehouse')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Text style={styles.iconText}>📦</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Warehouse</Text>
              <Text style={styles.cardDescription}>
                Receive deliveries, transfer stock, and adjust inventory
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.gray,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.gray,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: '600',
  },
});
