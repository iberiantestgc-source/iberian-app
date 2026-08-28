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
  getNotifications,
  markAsRead,
  markAllAsRead,
  type Notification,
} from '../src/api/notifications';
import { useThemeStore } from '../src/context/themeStore';

export default function NotificationsScreen() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useThemeStore();

  const load = useCallback(async () => {
    try {
      const data = await getNotifications({ limit: 50 });
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onPressItem = async (n: Notification) => {
    if (!n.isRead) {
      try {
        await markAsRead(n.id);

        setItems((prev) =>
          prev.map((x) =>
            x.id === n.id ? { ...x, isRead: true } : x,
          ),
        );

        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // ignore
      }
    }
  };

  const onMarkAll = async () => {
    try {
      await markAllAsRead();

      setItems((prev) =>
        prev.map((x) => ({ ...x, isRead: true })),
      );

      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
            },
          ]}
        >
          Notificaciones
        </Text>

        {unreadCount > 0 ? (
          <TouchableOpacity onPress={onMarkAll}>
            <Text
              style={[
                styles.markAll,
                {
                  color: colors.primary,
                },
              ]}
            >
              Leer todas
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
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
            <Text
              style={[
                styles.empty,
                {
                  color: colors.textMuted,
                },
              ]}
            >
              No tienes notificaciones
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                  borderColor: item.isRead
                    ? colors.border
                    : colors.primary,
                },
              ]}
              onPress={() => onPressItem(item)}
            >
              <View style={styles.cardHeader}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {item.title}
                </Text>

                {!item.isRead && (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                )}
              </View>

              <Text
                style={[
                  styles.cardBody,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {item.body}
              </Text>

              <Text
                style={[
                  styles.cardDate,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                {new Date(item.createdAt).toLocaleString('es-ES')}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },

  backBtn: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  markAll: {
    fontWeight: '600',
    fontSize: 13,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
  },

  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardTitle: {
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },

  cardBody: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },

  cardDate: {
    fontSize: 11,
    marginTop: 8,
  },
});