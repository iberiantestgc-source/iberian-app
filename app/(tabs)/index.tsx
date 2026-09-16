import { Linking } from 'react-native';
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

const WHATSAPP_COMMUNITY_URL =
  'https://chat.whatsapp.com/JsOe12eKytMD4K6xT9wPgz';

function isPremiumPlan(plan: string | undefined | null): boolean {
  const p = String(plan || 'FREE').toUpperCase();
  return (
    p === 'PREMIUM' ||
    p === 'PREMIUM_MONTHLY' ||
    p === 'PREMIUM_YEARLY' ||
    p.includes('PREMIUM')
  );
}

function progressProps(stats: any, user: any) {
  const totalQuestions = Number(stats?.totalQuestions ?? 0);
  const correct = Number(
    stats?.correctAnswers ??
      stats?.correctCount ??
      user?.correctAnswers ??
      0,
  );
  const blank = Number(
    stats?.unansweredCount ?? stats?.blankCount ?? 0,
  );
  const wrong = Number(
    stats?.wrongCount ??
      stats?.incorrectAnswers ??
      Math.max(0, totalQuestions - correct - blank),
  );

  // Donut: cobertura del temario (artículos → subtema → tema → media)
  // Fallback a accuracy si el backend aún no envía progressPercent
  const progressPercent =
    stats?.progressPercent != null
      ? Number(stats.progressPercent)
      : stats?.accuracy != null
        ? Number(stats.accuracy)
        : totalQuestions > 0
          ? Math.round((correct / totalQuestions) * 100)
          : 0;

  return {
    xp: stats?.xp ?? user?.xp ?? 0,
    streak: stats?.dailyStreak ?? user?.dailyStreak ?? 0,
    accuracy: progressPercent,
    tests: stats?.testsCompleted ?? stats?.totalTests ?? 0,
    correct,
    wrong,
    blank,
  };
}

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { colors } = useThemeStore();

  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [startingTest, setStartingTest] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [plan, setPlan] = useState('FREE');

  const { width } = useWindowDimensions();

  const isDesktop = Platform.OS === 'web' && width >= 900;
  const isPremium = isPremiumPlan(plan);
  const grid = progressProps(stats, user);

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

  useEffect(() => {
    getMySubscription()
      .then((d) => {
        const p =
          d.limits?.plan || d.subscription?.plan || 'FREE';
        setPlan(p);

        if (!isPremiumPlan(p)) {
          setShowPremium(true);
        }
      })
      .catch(() => {
        setPlan('FREE');
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

  const openCommunity = () => {
    if (!isPremium) {
      Alert.alert(
        'Solo Premium',
        'La comunidad de WhatsApp está disponible solo para usuarios Premium.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Hacerme Premium',
            onPress: () => router.push('/premium' as any),
          },
        ],
      );
      return;
    }

    void Linking.openURL(WHATSAPP_COMMUNITY_URL);
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
      key: 'Comunidad',
      label: isPremium ? 'Comunidad' : 'Comunidad 🔒',
      icon: 'people-outline' as const,
      onPress: openCommunity,
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
                      title="Temario Completo"
                      subtitle="Retoma tu estudio ahora"
                      onPress={() =>
                        Linking.openURL(
                          'https://drive.google.com/drive/folders/1MTCT0MSratkXD7XECb5axfTpkTD1Kzca?usp=drive_link',
                        )
                      }
                    />
                  </View>

                  <View style={styles.desktopCol}>
                    <QuickActions actions={quickActions} />
                  </View>
                </View>

                <ProgressGrid {...grid} />
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
                  title="Temario Completo"
                  subtitle="Retoma tu temario ahora"
                  onPress={() =>
                    Linking.openURL(
                      'https://drive.google.com/drive/folders/1MTCT0MSratkXD7XECb5axfTpkTD1Kzca?usp=drive_link',
                    )
                  }
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

                <ProgressGrid {...grid} />
              </>
            )}
          </View>
        </ScrollView>
      </View>

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