import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getAchievements,
  type AchievementItem,
} from '../../src/api/achievements';
import { colors } from '../../src/theme/colors';

export default function AchievementsScreen() {
  const [items, setItems] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getAchievements();
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unlocked = items.filter((a) => a.unlocked).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Logros</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <Text style={styles.summary}>
            {unlocked} / {items.length} desbloqueados
          </Text>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={async () => {
                  setRefreshing(true);
                  await load();
                  setRefreshing(false);
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>No hay logros configurados</Text>
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.card,
                  item.unlocked ? styles.cardUnlocked : styles.cardLocked,
                ]}
              >
                <Text style={styles.icon}>{item.unlocked ? '🏆' : '🔒'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                  {item.unlocked && item.unlockedAt && (
                    <Text style={styles.date}>
                      {new Date(item.unlockedAt).toLocaleDateString('es-ES')}
                    </Text>
                  )}
                </View>
                <Text style={styles.xp}>+{item.xpReward}</Text>
              </View>
            )}
          />
        </>
      )}
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summary: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 12,
    fontWeight: '600',
  },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  cardUnlocked: {
    backgroundColor: colors.surface,
    borderColor: colors.warning,
  },
  cardLocked: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    opacity: 0.7,
  },
  icon: { fontSize: 28 },
  name: { color: colors.text, fontWeight: '700', fontSize: 15 },
  desc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  date: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  xp: { color: colors.xp, fontWeight: '800', fontSize: 14 },
});
