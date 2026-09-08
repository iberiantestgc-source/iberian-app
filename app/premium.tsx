import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { createCheckoutSession } from '../src/api/subscriptions';

const colors = {
  background: '#0B1220',
  surface: '#121A2B',
  border: '#1E2A3F',
  text: '#FFFFFF',
  textMuted: '#94A3B8',
  primary: '#00A878',
  xp: '#A78BFA',
};

const BENEFITS = [
  'Hasta 10.000 preguntas al día',
  'Simulacros ilimitados',
  'Tutor IA incluido',
  'Estadísticas avanzadas',
  'Sin límites del plan Free',
];

export default function PremiumScreen() {
  const [loading, setLoading] = useState(false);

  const startCheckout = async () => {
    try {
      setLoading(true);

      const data = await createCheckoutSession();

      if (!data?.url) {
        throw new Error('No se recibió la URL de pago');
      }

      // En web Linking a veces no abre; usamos window.open
      if (Platform.OS === 'web') {
        const opened = window.open(data.url, '_blank');
        if (!opened) {
          // Si el navegador bloquea el popup, ir en la misma pestaña
          window.location.href = data.url;
        }
      } else {
        const can = await Linking.canOpenURL(data.url);
        if (!can) {
          throw new Error('No se puede abrir el enlace de pago');
        }
        await Linking.openURL(data.url);
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo iniciar el pago.';
      Alert.alert('Error', String(msg));
      console.log('Checkout error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Premium
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Ionicons name="diamond" size={40} color={colors.xp} />
          <Text style={[styles.title, { color: colors.text }]}>
            IBERIAN Premium
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Prepárate sin límites y con todas las herramientas.
          </Text>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {BENEFITS.map((b) => (
            <View key={b} style={styles.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.benefitText, { color: colors.text }]}>
                {b}
              </Text>
            </View>
          ))}
        </View>

        <Text style={[styles.note, { color: colors.textMuted }]}>
          Modo prueba de Stripe. No se cobra dinero real hasta activar live.
        </Text>

        <TouchableOpacity
          style={[
            styles.payBtn,
            { backgroundColor: colors.xp },
            loading && { opacity: 0.7 },
          ]}
          onPress={startCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payBtnText}>Continuar al pago</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.cancel}>
          <Text style={[styles.cancelText, { color: colors.textMuted }]}>
            Ahora no
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  hero: { alignItems: 'center', marginTop: 12, marginBottom: 24 },
  title: { marginTop: 12, fontSize: 26, fontWeight: '900' },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitText: { flex: 1, fontSize: 15, fontWeight: '600' },
  note: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  payBtn: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancel: { marginTop: 14, alignItems: 'center', padding: 10 },
  cancelText: { fontWeight: '600' },
});