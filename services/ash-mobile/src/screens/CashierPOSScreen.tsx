import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import apiClient, { createAuthConfig } from '../utils/api';
import { API_CONFIG, COLORS } from '../constants/config';

interface CartItem {
  variant_id: string;
  variant_name: string;
  price: number;
  quantity: number;
}

export default function CashierPOSScreen() {
  const { user, token } = useAuth();
  const [variantId, setVariantId] = useState('');
  const [variantName, setVariantName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'EWALLET'>('CASH');
  const [amountPaid, setAmountPaid] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addToCart = () => {
    if (!variantId.trim() || !variantName.trim() || !price.trim() || !quantity.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const priceNum = parseFloat(price);
    const qtyNum = parseInt(quantity);

    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(qtyNum) || qtyNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const item: CartItem = {
      variant_id: variantId.trim(),
      variant_name: variantName.trim(),
      price: priceNum,
      quantity: qtyNum,
    };

    setCart([...cart, item]);

    // Reset form
    setVariantId('');
    setVariantName('');
    setPrice('');
    setQuantity('1');
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateChange = () => {
    const total = calculateTotal();
    const paid = parseFloat(amountPaid) || total;
    return paid - total;
  };

  const processSale = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    try {
      setLoading(true);

      const total = calculateTotal();
      const paid = parseFloat(amountPaid) || total;

      if (paid < total) {
        Alert.alert('Error', 'Amount paid is less than total');
        setLoading(false);
        return;
      }

      // workspace_id and cashier_id will be extracted from auth token
      const saleData = {
        location_id: 'store-001', // TODO: Get from location selector
        items: cart.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        })),
        payment_method: paymentMethod,
        amount_paid: paid,
        notes: `POS Sale - ${paymentMethod}`,
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.SALES,
        saleData,
        createAuthConfig(token!)
      );

      if (response.data.success) {
        setSuccess(true);
        setCart([]);
        setAmountPaid('');

        Alert.alert(
          'Success',
          `Sale processed successfully!\nSale ID: ${response.data.sale_id}\nChange: ₱${calculateChange().toFixed(2)}`,
          [{ text: 'OK', onPress: () => setSuccess(false) }]
        );
      }
    } catch (error: any) {
      console.error('Sale error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to process sale';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Cashier Info */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Cashier: {user?.email}</Text>
        </View>

        {/* Add Item Form */}
        <View style={styles.formCard}>
          <Text style={styles.cardTitle}>Add Item</Text>

          <TextInput
            style={styles.input}
            placeholder="Variant ID"
            value={variantId}
            onChangeText={setVariantId}
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Variant Name"
            value={variantName}
            onChangeText={setVariantName}
          />

          <TextInput
            style={styles.input}
            placeholder="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.addButton} onPress={addToCart}>
            <Text style={styles.addButtonText}>+ Add to Cart</Text>
          </TouchableOpacity>
        </View>

        {/* Cart */}
        <View style={styles.cartCard}>
          <Text style={styles.cardTitle}>
            Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </Text>

          {cart.length === 0 ? (
            <Text style={styles.emptyText}>Cart is empty</Text>
          ) : (
            cart.map((item, index) => (
              <View key={index} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.variant_name}</Text>
                  <Text style={styles.cartItemDetails}>
                    ₱{item.price.toFixed(2)} × {item.quantity}
                  </Text>
                </View>
                <View style={styles.cartItemRight}>
                  <Text style={styles.cartItemTotal}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity onPress={() => removeFromCart(index)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          {cart.length > 0 && (
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₱{calculateTotal().toFixed(2)}</Text>
            </View>
          )}
        </View>

        {/* Payment */}
        {cart.length > 0 && (
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Payment</Text>

            {/* Payment Method */}
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentMethods}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  paymentMethod === 'CASH' && styles.methodButtonActive,
                ]}
                onPress={() => setPaymentMethod('CASH')}
              >
                <Text
                  style={[
                    styles.methodText,
                    paymentMethod === 'CASH' && styles.methodTextActive,
                  ]}
                >
                  💵 Cash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  paymentMethod === 'CARD' && styles.methodButtonActive,
                ]}
                onPress={() => setPaymentMethod('CARD')}
              >
                <Text
                  style={[
                    styles.methodText,
                    paymentMethod === 'CARD' && styles.methodTextActive,
                  ]}
                >
                  💳 Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  paymentMethod === 'EWALLET' && styles.methodButtonActive,
                ]}
                onPress={() => setPaymentMethod('EWALLET')}
              >
                <Text
                  style={[
                    styles.methodText,
                    paymentMethod === 'EWALLET' && styles.methodTextActive,
                  ]}
                >
                  📱 E-Wallet
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Paid */}
            <Text style={styles.label}>Amount Paid (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder={`Default: ₱${calculateTotal().toFixed(2)}`}
              value={amountPaid}
              onChangeText={setAmountPaid}
              keyboardType="numeric"
            />

            {amountPaid && parseFloat(amountPaid) >= calculateTotal() && (
              <View style={styles.changeSection}>
                <Text style={styles.changeLabel}>Change:</Text>
                <Text style={styles.changeAmount}>₱{calculateChange().toFixed(2)}</Text>
              </View>
            )}

            {/* Process Sale Button */}
            <TouchableOpacity
              style={[styles.processButton, loading && styles.processButtonDisabled]}
              onPress={processSale}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.processButtonText}>Process Sale</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
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
    padding: 16,
  },
  header: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  headerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    paddingVertical: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 4,
  },
  cartItemDetails: {
    fontSize: 12,
    color: COLORS.gray,
  },
  cartItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartItemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.black,
    marginRight: 12,
  },
  removeButton: {
    fontSize: 18,
    color: COLORS.danger,
    paddingHorizontal: 8,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  paymentMethods: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  methodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  methodButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#DBEAFE',
  },
  methodText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  methodTextActive: {
    color: COLORS.primary,
  },
  changeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  changeLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#047857',
  },
  changeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#047857',
  },
  processButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  processButtonDisabled: {
    opacity: 0.7,
  },
  processButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
