import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createCheckoutSession } from '../../api/subscriptions';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function PremiumPromoModal({ visible, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    try {
      setLoading(true);
      const data = await createCheckoutSession();
      if (!data?.url) throw new Error('No se recibió la URL de pago');
      await Linking.openURL(data.url);
      onClose();
    } catch (e: any) {
      Alert.alert(
        'Error',
        e?.response?.data?.message ||
          e?.message ||
          'No se pudo iniciar el pago',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Fondo oscuro: se ve el Home debajo */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* X arriba a la derecha */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={12}
          >
            <Ionicons name="close" size={22} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.iconWrap}>
            <Ionicons name="diamond" size={32} color="#A78BFA" />
          </View>

          <Text style={styles.title}>Pasa a Premium</Text>
          <Text style={styles.subtitle}>
            10.000 preguntas/día, simulacros ilimitados y tutor IA.
          </Text>

          <TouchableOpacity
            style={[styles.payBtn, loading && { opacity: 0.7 }]}
            onPress={pay}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payText}>Continuar al pago</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.omit}>
            <Text style={styles.omitText}>Ahora no</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#121A2B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2A3F',
    padding: 22,
    paddingTop: 28,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    padding: 4,
  },
  iconWrap: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(167,139,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    color: '#94A3B8',
  },
  payBtn: {
    marginTop: 20,
    backgroundColor: '#A78BFA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  payText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  omit: { marginTop: 12, alignItems: 'center', padding: 8 },
  omitText: { color: '#94A3B8', fontWeight: '600' },
});