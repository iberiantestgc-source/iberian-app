import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useThemeStore } from '../../src/context/themeStore';
import { getLeaderboard, getMyRank } from '../../src/api/ranking';

type RankingUser = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  level: number;
  xp: number;
};

type RankingEntry = {
  id: string;
  position: number | null;
  score: number;
  user: RankingUser;
};

type LeaderboardResponse = {
  rankingId: string;
  rankingName: string;
  total: number;
  limit: number;
  offset: number;
  entries: RankingEntry[];
};

type MyRankResponse = {
  position: number | null;
  score: number;
  user?: RankingUser | null;
  message?: string;
};

export default function RankingScreen() {
  const [list, setList] = useState<RankingEntry[]>([]);
  const [me, setMe] = useState<MyRankResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { colors } = useThemeStore();
  const { width } = useWindowDimensions();

  const isDesktop =
    Platform.OS === 'web' && width >= 900;

  const load = useCallback(async () => {
    try {
      const [leaderboard, myRank] = await Promise.all([
        getLeaderboard(50).catch(() => null),
        getMyRank().catch(() => null),
      ]);

      const lb = leaderboard as LeaderboardResponse | null;

      if (lb && Array.isArray(lb.entries)) {
        setList(lb.entries);
      } else {
        setList([]);
      }

      setMe(myRank as MyRankResponse | null);
    } catch {
      setList([]);
      setMe(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: isDesktop
            ? colors.backgroundAlt
            : colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.shell,
          isDesktop && styles.shellDesktop,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Ranking
        </Text>

        {me ? (
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textMuted,
              },
            ]}
          >
            Tu posición:{' '}
            {me.position ? `#${me.position}` : '—'} ·{' '}
            {me.score ?? me.user?.xp ?? 0} XP
          </Text>
        ) : (
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textMuted,
              },
            ]}
          >
            Clasificación de opositores
          </Text>
        )}

        <FlatList
          data={list}
          keyExtractor={(item, index) =>
            String(item.id || item.user?.id || index)
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
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
              Aún no hay usuarios en el ranking
            </Text>
          }
          renderItem={({ item, index }) => {
            const position =
              item.position ?? index + 1;

            const user = item.user;

            return (
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pos,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  #{position}
                </Text>

                <View style={styles.info}>
                  <Text
                    style={[
                      styles.name,
                      {
                        color: colors.text,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {user?.name || 'Usuario'}
                  </Text>

                  <Text
                    style={[
                      styles.meta,
                      {
                        color: colors.textMuted,
                      },
                    ]}
                  >
                    Nivel {user?.level ?? 1}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.xp,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {item.score ?? user?.xp ?? 0} XP
                </Text>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
  },

  shell: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    paddingTop: 18,
  },

  shellDesktop: {
    maxWidth: 720,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    paddingHorizontal: 20,
  },

  subtitle: {
    marginTop: 6,
    paddingHorizontal: 20,
    fontSize: 14,
    marginBottom: 12,
  },

  list: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 10,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },

  pos: {
    width: 42,
    fontWeight: '800',
    fontSize: 16,
  },

  info: {
    flex: 1,
  },

  name: {
    fontWeight: '700',
    fontSize: 15,
  },

  meta: {
    marginTop: 2,
    fontSize: 12,
  },

  xp: {
    fontWeight: '700',
  },

  empty: {
    textAlign: 'center',
    marginTop: 40,
  },
});