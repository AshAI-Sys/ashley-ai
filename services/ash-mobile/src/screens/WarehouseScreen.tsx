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

type TabType = 'delivery' | 'transfer' | 'adjust';

export default function WarehouseScreen() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('delivery');
  const [loading, setLoading] = useState(false);

  // Delivery fields
  const [deliverySupplier, setDeliverySupplier] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryVariantId, setDeliveryVariantId] = useState('');
  const [deliveryQuantity, setDeliveryQuantity] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Transfer fields
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferVariantId, setTransferVariantId] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Adjust fields
  const [adjustVariantId, setAdjustVariantId] = useState('');
  const [adjustLocation, setAdjustLocation] = useState('');
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustReason, setAdjustReason] = useState('DAMAGE');
  const [adjustNotes, setAdjustNotes] = useState('');

  const handleDeliverySubmit = async () => {
    if (!deliverySupplier || !deliveryLocation || !deliveryVariantId || !deliveryQuantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const qty = parseInt(deliveryQuantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      setLoading(true);

      const data = {
        receiving_location_id: deliveryLocation,
        supplier_name: deliverySupplier,
        items: [
          {
            variant_id: deliveryVariantId,
            quantity: qty,
            notes: deliveryNotes || '',
          },
        ],
        notes: deliveryNotes || '',
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.DELIVERY,
        data,
        createAuthConfig(token!)
      );

      if (response.data.success) {
        Alert.alert('Success', `Delivery ${response.data.delivery_number} processed!`);

        // Reset form
        setDeliverySupplier('');
        setDeliveryLocation('');
        setDeliveryVariantId('');
        setDeliveryQuantity('');
        setDeliveryNotes('');
      }
    } catch (error: any) {
      console.error('Delivery error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to process delivery';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (!transferFrom || !transferTo || !transferVariantId || !transferQuantity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (transferFrom === transferTo) {
      Alert.alert('Error', 'From and To locations must be different');
      return;
    }

    const qty = parseInt(transferQuantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      setLoading(true);

      const data = {
        from_location_id: transferFrom,
        to_location_id: transferTo,
        items: [
          {
            variant_id: transferVariantId,
            quantity: qty,
          },
        ],
        notes: transferNotes || '',
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.TRANSFER,
        data,
        createAuthConfig(token!)
      );

      if (response.data.success) {
        Alert.alert('Success', 'Stock transfer completed successfully!');

        // Reset form
        setTransferFrom('');
        setTransferTo('');
        setTransferVariantId('');
        setTransferQuantity('');
        setTransferNotes('');
      }
    } catch (error: any) {
      console.error('Transfer error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to transfer stock';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async () => {
    if (!adjustVariantId || !adjustLocation || !adjustQuantity || !adjustReason) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const qty = parseInt(adjustQuantity);
    if (isNaN(qty)) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      setLoading(true);

      const data = {
        variant_id: adjustVariantId,
        location_id: adjustLocation,
        quantity_change: qty,
        reason: adjustReason,
        notes: adjustNotes || '',
      };

      const response = await apiClient.post(
        API_CONFIG.ENDPOINTS.ADJUST,
        data,
        createAuthConfig(token!)
      );

      if (response.data.success) {
        Alert.alert(
          'Success',
          `Stock adjusted!\nPrevious: ${response.data.previous_quantity}\nNew: ${response.data.new_quantity}\nChange: ${response.data.change}`
        );

        // Reset form
        setAdjustVariantId('');
        setAdjustLocation('');
        setAdjustQuantity('');
        setAdjustReason('DAMAGE');
        setAdjustNotes('');
      }
    } catch (error: any) {
      console.error('Adjust error:', error);
      const message = error.response?.data?.error || error.message || 'Failed to adjust stock';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.header}>
        <Text style={styles.headerText}>User: {user?.email}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'delivery' && styles.tabActive]}
          onPress={() => setActiveTab('delivery')}
        >
          <Text style={[styles.tabText, activeTab === 'delivery' && styles.tabTextActive]}>
            📦 Delivery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'transfer' && styles.tabActive]}
          onPress={() => setActiveTab('transfer')}
        >
          <Text style={[styles.tabText, activeTab === 'transfer' && styles.tabTextActive]}>
            🔄 Transfer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'adjust' && styles.tabActive]}
          onPress={() => setActiveTab('adjust')}
        >
          <Text style={[styles.tabText, activeTab === 'adjust' && styles.tabTextActive]}>
            ⚙️ Adjust
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Receive Delivery</Text>

            <Text style={styles.label}>Supplier Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter supplier name"
              value={deliverySupplier}
              onChangeText={setDeliverySupplier}
            />

            <Text style={styles.label}>Receiving Location ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., warehouse-main"
              value={deliveryLocation}
              onChangeText={setDeliveryLocation}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Variant ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter variant ID"
              value={deliveryVariantId}
              onChangeText={setDeliveryVariantId}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              value={deliveryQuantity}
              onChangeText={setDeliveryQuantity}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Additional notes"
              value={deliveryNotes}
              onChangeText={setDeliveryNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleDeliverySubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Process Delivery</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Transfer Tab */}
        {activeTab === 'transfer' && (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Transfer Stock</Text>

            <Text style={styles.label}>From Location ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., warehouse-main"
              value={transferFrom}
              onChangeText={setTransferFrom}
              autoCapitalize="none"
            />

            <Text style={styles.label}>To Location ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., store-001"
              value={transferTo}
              onChangeText={setTransferTo}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Variant ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter variant ID"
              value={transferVariantId}
              onChangeText={setTransferVariantId}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              value={transferQuantity}
              onChangeText={setTransferQuantity}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Transfer notes"
              value={transferNotes}
              onChangeText={setTransferNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleTransferSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Transfer Stock</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Adjust Tab */}
        {activeTab === 'adjust' && (
          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Adjust Inventory</Text>

            <Text style={styles.label}>Variant ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter variant ID"
              value={adjustVariantId}
              onChangeText={setAdjustVariantId}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Location ID *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., warehouse-main"
              value={adjustLocation}
              onChangeText={setAdjustLocation}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Quantity Change * (use negative for decrease)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10 or -5"
              value={adjustQuantity}
              onChangeText={setAdjustQuantity}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Reason *</Text>
            <View style={styles.reasonButtons}>
              {['DAMAGE', 'LOSS', 'FOUND', 'CORRECTION'].map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    adjustReason === reason && styles.reasonButtonActive,
                  ]}
                  onPress={() => setAdjustReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonText,
                      adjustReason === reason && styles.reasonTextActive,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Adjustment notes"
              value={adjustNotes}
              onChangeText={setAdjustNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleAdjustSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Adjust Inventory</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    color: COLORS.gray,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 6,
    marginTop: 4,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  reasonButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  reasonButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: COLORS.white,
  },
  reasonButtonActive: {
    borderColor: COLORS.warning,
    backgroundColor: '#FEF3C7',
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '600',
  },
  reasonTextActive: {
    color: COLORS.warning,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
