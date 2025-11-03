import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useAuth } from '../context/AuthContext';
import apiClient, { createAuthConfig } from '../utils/api';
import { API_CONFIG, COLORS } from '../constants/config';

interface ProductData {
  product: {
    id: string;
    name: string;
    description: string;
    photo_url: string;
    base_sku: string;
    category: string;
  };
  variant: {
    id: string;
    variant_name: string;
    sku: string;
    barcode: string;
    qr_code: string;
    price: number;
    size: string;
    color: string;
  };
  stock: {
    total_quantity: number;
    by_location: Array<{
      location_code: string;
      location_name: string;
      quantity: number;
    }>;
    is_out_of_stock: boolean;
  };
}

export default function StoreScannerScreen() {
  const { token } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }: { type: string; data: string }) => {
    setScanned(true);

    try {
      setLoading(true);
      setProductData(null);

      // Parse QR code URL: https://inventory.yourdomain.com/i/{product_id}?v={variant_id}
      const url = new URL(data);
      const pathParts = url.pathname.split('/');
      const productId = pathParts[pathParts.length - 1];
      const variantId = url.searchParams.get('v');

      if (!productId || !variantId) {
        throw new Error('Invalid QR code format');
      }

      // Call API to get product details
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.PRODUCT_SCAN}/${productId}?v=${variantId}`,
        createAuthConfig(token!)
      );

      setProductData(response.data);
    } catch (error: any) {
      console.error('Scan error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to fetch product';
      Alert.alert('Scan Error', message);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setProductData(null);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No access to camera</Text>
        <Text style={styles.helpText}>
          Please enable camera permissions in your device settings
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned && !productData ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>Scan product QR code</Text>
          </View>
        </View>
      ) : loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading product details...</Text>
        </View>
      ) : productData ? (
        <ScrollView style={styles.productContainer}>
          {/* Product Details */}
          <View style={styles.productCard}>
            <Text style={styles.productName}>{productData.product.name}</Text>
            {productData.product.description && (
              <Text style={styles.productDescription}>
                {productData.product.description}
              </Text>
            )}

            {/* Variant Info */}
            <View style={styles.variantSection}>
              <Text style={styles.sectionTitle}>Variant Details</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Variant:</Text>
                <Text style={styles.infoValue}>{productData.variant.variant_name}</Text>
              </View>
              {productData.variant.size && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Size:</Text>
                  <Text style={styles.infoValue}>{productData.variant.size}</Text>
                </View>
              )}
              {productData.variant.color && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Color:</Text>
                  <Text style={styles.infoValue}>{productData.variant.color}</Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SKU:</Text>
                <Text style={styles.infoValue}>{productData.variant.sku}</Text>
              </View>
            </View>

            {/* Price */}
            <Text style={styles.price}>₱{productData.variant.price.toFixed(2)}</Text>

            {/* Stock Status */}
            <View
              style={[
                styles.stockCard,
                productData.stock.is_out_of_stock ? styles.outOfStock : styles.inStock,
              ]}
            >
              <Text
                style={[
                  styles.stockStatus,
                  productData.stock.is_out_of_stock
                    ? styles.outOfStockText
                    : styles.inStockText,
                ]}
              >
                {productData.stock.is_out_of_stock ? '❌ Out of Stock' : '✅ In Stock'}
              </Text>
              <Text style={styles.stockQuantity}>
                {productData.stock.total_quantity}{' '}
                {productData.stock.total_quantity === 1 ? 'unit' : 'units'}
              </Text>
            </View>

            {/* Stock by Location */}
            {productData.stock.by_location.length > 0 && (
              <View style={styles.locationSection}>
                <Text style={styles.sectionTitle}>📍 Stock by Location</Text>
                {productData.stock.by_location.map((loc, idx) => (
                  <View key={idx} style={styles.locationCard}>
                    <View>
                      <Text style={styles.locationName}>{loc.location_name}</Text>
                      <Text style={styles.locationCode}>{loc.location_code}</Text>
                    </View>
                    <Text style={styles.locationQuantity}>{loc.quantity}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Scan Another Button */}
          <TouchableOpacity style={styles.scanButton} onPress={resetScanner}>
            <Text style={styles.scanButtonText}>📱 Scan Another Product</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scannerContainer: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 12,
  },
  scannerText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.danger,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
  productContainer: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  variantSection: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    width: 70,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    flex: 1,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  stockCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  inStock: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  outOfStock: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  stockStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  inStockText: {
    color: '#047857',
  },
  outOfStockText: {
    color: '#DC2626',
  },
  stockQuantity: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  locationSection: {
    marginTop: 4,
  },
  locationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  locationCode: {
    fontSize: 12,
    color: COLORS.gray,
  },
  locationQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
