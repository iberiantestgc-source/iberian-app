import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  Text,
  useWindowDimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';

import { useAuthStore } from '../../src/context/authStore';
import { getMyStats } from '../../src/api/statistics';
import { generateQuickTest } from '../../src/api/tests';
import { getMySubscription } from '../../src/api/subscriptions';
import { useThemeStore } from '../../src/context/themeStore';

import HomeHeader from '../../src/components/home/HomeHeader';
import DailyGoalCard from '../../src/components/home/DailyGoalCard';
import ContinueStudyCard from '../../src/components/home/ContinueStudyCard';
import QuickTestCard from '../../src/components/home/QuickTestCard';
import QuickActions from '../../src/components/home/QuickActions';
import ProgressGrid from '../../src/components/home/ProgressGrid';
import PremiumPromoModal from '../../src/components/home/PremiumPromoModal';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { colors } = useThemeStore();

  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startingTest, setStartingTest] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width >= 900;

  const load = async () => {
    try {
      const data = await getMyStats();
      setStats(data);
      setErrorMsg(null);
    } catch {
      setErrorMsg('No se pudieron cargar estadísticas');
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Popup Premium solo si el plan es FREE
  useEffect(() => {
    getMySubscription()
      .then((d) => {
        const plan = d.limits?.plan || d.subscription?.plan || 'FREE';
        if (plan === 'FREE' || plan === 'Free') {
          setShowPremium(true);
        }
      })
      .catch(() => {
        // Si falla la API, no bloqueamos el Home
      });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const startQuickTest = async () => {
    if (startingTest) {
      return;
    }

    setStartingTest(true);
    setErrorMsg(null);

    try {
      const test = await generateQuickTest();

      if (!test?.attemptId || !test?.questions?.length) {
        throw new Error(
          'El backend no devolvió preguntas para este test.',
        );
      }

      router.push({
        pathname: `/test/${test.attemptId}` as any,
        params: {
          payload: JSON.stringify(test),
        },
      });
    } catch (e: any) {
      const message =
        e?.response?.data?.message ||
        e?.message ||
        'No se pudo generar el test.';

      const text = Array.isArray(message)
        ? message.join('\n')
        : String(message);

      setErrorMsg(text);
      Alert.alert('Error al generar el test', text);
    } finally {
      setStartingTest(false);
    }
  };

  const questionsToday = stats?.last7Days?.total
    ? Math.min(Number(stats.last7Days.total) || 0, 20)
    : 0;

  const goalQuestions = 20;

  const progress = Math.round((questionsToday / goalQuestions) * 100);

  const quickActions = [
    {
      key: 'temas',
      label: 'Temas',
      icon: 'library' as const,
      onPress: () => router.push('/(tabs)/study'),
    },
    {
      key: 'ia',
      label: 'IA',
      icon: 'bulb' as const,
      onPress: () => router.push('/tutor'),
    },
    {
      key: 'falladas',
      label: 'Falladas',
      icon: 'refresh' as const,
      onPress: () => router.push('/(tabs)/study'),
    },
    {
      key: 'ranking',
      label: 'Ranking',
      icon: 'trophy' as const,
      onPress: () => router.push('/(tabs)/ranking'),
    },
  ];

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
        <ScrollView
          style={[
            styles.scrollView,
            {
              backgroundColor: colors.background,
            },
          ]}
          contentContainerStyle={{
            paddingBottom: isDesktop ? 48 : 40,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <HomeHeader userName={user?.name} />

          <View
            style={[styles.body, isDesktop && styles.bodyDesktop]}
          >
            {errorMsg ? (
              <Text
                style={{
                  color: colors.danger,
                  marginBottom: 4,
                }}
              >
                {errorMsg}
              </Text>
            ) : null}

            {isDesktop ? (
              <>
                <View style={styles.desktopRow}>
                  <View style={styles.desktopCol}>
                    <DailyGoalCard
                      progress={progress}
                      questionsToday={questionsToday}
                      goalQuestions={goalQuestions}
                      xpToday={
                        stats?.xp
                          ? Math.min(Number(stats.xp) || 0, 120)
                          : 0
                      }
                    />
                  </View>

                  <View style={styles.desktopCol}>
                    {startingTest ? (
                      <View
                        style={[
                          styles.testLoadingCard,
                          {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <ActivityIndicator
                          size="large"
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            styles.testLoadingText,
                            { color: colors.text },
                          ]}
                        >
                          Generando test...
                        </Text>
                      </View>
                    ) : (
                      <QuickTestCard onPress={startQuickTest} />
                    )}
                  </View>
                </View>

                <View style={styles.desktopRow}>
                  <View style={styles.desktopCol}>
                    <ContinueStudyCard
                      title="Constitución Española"
                      subtitle="Retoma tu temario ahora"
                      onPress={() => router.push('/(tabs)/study')}
                    />
                  </View>

                  <View style={styles.desktopCol}>
                    <QuickActions actions={quickActions} />
                  </View>
                </View>

                <ProgressGrid
                  xp={stats?.xp ?? user?.xp ?? 0}
                  streak={stats?.dailyStreak ?? 0}
                  accuracy={stats?.accuracy ?? 0}
                  tests={stats?.testsCompleted ?? 0}
                />
              </>
            ) : (
              <>
                <DailyGoalCard
                  progress={progress}
                  questionsToday={questionsToday}
                  goalQuestions={goalQuestions}
                  xpToday={
                    stats?.xp
                      ? Math.min(Number(stats.xp) || 0, 120)
                      : 0
                  }
                />

                <ContinueStudyCard
                  title="Constitución Española"
                  subtitle="Retoma tu temario ahora"
                  onPress={() => router.push('/(tabs)/study')}
                />

                {startingTest ? (
                  <View
                    style={[
                      styles.testLoadingCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <ActivityIndicator
                      size="large"
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.testLoadingText,
                        { color: colors.text },
                      ]}
                    >
                      Generando test...
                    </Text>
                  </View>
                ) : (
                  <QuickTestCard onPress={startQuickTest} />
                )}

                <QuickActions actions={quickActions} />

                <ProgressGrid
                  xp={stats?.xp ?? user?.xp ?? 0}
                  streak={stats?.dailyStreak ?? 0}
                  accuracy={stats?.accuracy ?? 0}
                  tests={stats?.testsCompleted ?? 0}
                />
              </>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Popup Premium encima del Home (no pantalla completa) */}
      <PremiumPromoModal
        visible={showPremium}
        onClose={() => setShowPremium(false)}
      />
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
  },

  shellDesktop: {
    maxWidth: 1100,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
  },

  scrollView: {
    flex: 1,
  },

  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },

  bodyDesktop: {
    paddingHorizontal: 28,
    paddingTop: 24,
    gap: 18,
  },

  desktopRow: {
    flexDirection: 'row',
    gap: 16,
  },

  desktopCol: {
    flex: 1,
  },

  testLoadingCard: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  testLoadingText: {
    fontSize: 14,
    fontWeight: '700',
  },
});