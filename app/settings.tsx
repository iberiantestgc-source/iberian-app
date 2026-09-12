import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMySubscription } from '../src/api/subscriptions';
import { colors } from '../src/theme/colors';

export default function SettingsScreen() {
  const [plan, setPlan] = useState('FREE');
  const [dailyLimit, setDailyLimit] = useState<number | string>(10);
  const [canUseAI, setCanUseAI] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    getMySubscription()
      .then((d) => {
        setPlan(d.limits?.plan || 'FREE');
        setDailyLimit(
          d.limits?.dailyQuestions === Infinity ||
            (d.limits?.dailyQuestions ?? 0) > 99999
            ? 'Ilimitado'
            : d.limits?.dailyQuestions ?? 10,
        );
        setCanUseAI(!!d.limits?.canUseAI);
      })
      .catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajustes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>Suscripción</Text>
        <View style={styles.card}>
          <Row label="Plan actual" value={plan} />
          <Row label="Preguntas/día" value={String(dailyLimit)} />
          <Row label="Tutor IA" value={canUseAI ? 'Incluido' : 'No incluido'} />
        </View>

        {(plan === 'FREE' || plan === 'Free') && (
          <TouchableOpacity
            style={styles.premiumBtn}
            onPress={() => router.push('/premium' as any)}
          >
            <Text style={styles.premiumBtnText}>Pasar a Premium</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.section}>Preferencias</Text>
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <Text style={styles.rowLabel}>Notificaciones</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </View>

        <Text style={styles.section}>Información</Text>
        <View style={styles.card}>
          <Row label="Versión" value="1.0.0" />
          <Row label="App" value="IBERIAN" />
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  content: { padding: 20, paddingBottom: 40 },
  section: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowLabel: { color: colors.text, fontSize: 15 },
  rowValue: { color: colors.textMuted, fontWeight: '600' },
  premiumBtn: {
    marginTop: 16,
    backgroundColor: colors.xp || '#A78BFA',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  premiumBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});