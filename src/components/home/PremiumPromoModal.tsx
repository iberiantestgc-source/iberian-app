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
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createCheckoutSession } from '../../api/subscriptions';

type Props = {
  visible: boolean;
  onClose: () => void;
};

function extractErrorMessage(e: any): string {
  const data = e?.response?.data;

  if (typeof data?.message === 'string') {
    return data.message;
  }

  if (Array.isArray(data?.message)) {
    return data.message.join('\n');
  }

  if (typeof data?.error === 'string') {
    return data.error;
  }

  if (e?.message === 'Network Error') {
    return 'No se pudo conectar con el servidor. Comprueba tu conexión o que el backend esté activo.';
  }

  if (typeof e?.message === 'string' && e.message.length > 0) {
    return e.message;
  }

  return 'No se pudo iniciar el pago';
}

async function openCheckoutUrl(url: string) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
    return;
  }

  await Linking.openURL(url);
}

export default function PremiumPromoModal({ visible, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const data = await createCheckoutSession();

      if (!data?.url || typeof data.url !== 'string') {
        throw new Error('No se recibió la URL de pago');
      }

      if (!data.url.startsWith('https://')) {
        throw new Error('La URL de pago no es válida');
      }

      // Cerrar el modal antes de salir a Stripe
      onClose();

      await openCheckoutUrl(data.url);
    } catch (e: any) {
      Alert.alert('Error al iniciar el pago', extractErrorMessage(e));
      console.log(
        'Checkout modal error:',
        e?.response?.status,
        e?.response?.data || e,
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