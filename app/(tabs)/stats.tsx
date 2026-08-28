import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  useWindowDimensions,
  Dimensions,
} from 'react-native';
import { getMyStats } from '../../src/api/statistics';
import { useThemeStore } from '../../src/context/themeStore';

type Period = 'general' | 'semanal' | 'mensual' | 'anual';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'semanal', label: 'Semanal' },
  { key: 'mensual', label: 'Mensual' },
  { key: 'anual', label: 'Anual' },
];

function EvolutionChart({
  points,
  labels,
  primary,
  background,
  text,
  textMuted,
  surface,
  border,
}: {
  points: number[];
  labels: string[];
  primary: string;
  background: string;
  text: string;
  textMuted: string;
  surface: string;
  border: string;
}) {
  const width = Math.max(
    260,
    Math.min(Dimensions.get('window').width - 64, 360),
  );

  const height = 140;
  const pad = 12;
  const max = 100;
  const min = 0;

  const hasData = points.length > 0;

  const coords = points.map((v, i) => {
    const x =
      pad + (i * (width - pad * 2)) / Math.max(points.length - 1, 1);

    const safeValue = Math.max(min, Math.min(max, Number(v) || 0));

    const y =
      height -
      pad -
      ((safeValue - min) / (max - min)) *
        (height - pad * 2);

    return { x, y };
  });

  return (
    <View
      style={[
        styles.chartWrap,
        {
          backgroundColor: surface,
          borderColor: border,
        },
      ]}
    >
      <Text style={[styles.chartTitle, { color: text }]}>
        Evolución de aciertos
      </Text>

      {!hasData ? (
        <View style={styles.emptyChart}>
          <Text
            style={[
              styles.emptyChartText,
              { color: textMuted },
            ]}
          >
            Todavía no hay suficientes datos para mostrar
            tu evolución.
          </Text>
        </View>
      ) : (
        <>
          <View
            style={[
              styles.chartBox,
              {
                width,
                height,
              },
            ]}
          >
            {[0, 25, 50, 75, 100].map((g) => {
              const y =
                height -
                pad -
                ((g - min) / (max - min)) *
                  (height - pad * 2);

              return (
                <View
                  key={g}
                  style={[
                    styles.guide,
                    {
                      top: y,
                      width: width - pad,
                      backgroundColor:
                        border,
                    },
                  ]}
                />
              );
            })}

            {coords.slice(0, -1).map((c, i) => {
              const n = coords[i + 1];

              const dx = n.x - c.x;
              const dy = n.y - c.y;

              const len = Math.sqrt(
                dx * dx + dy * dy,
              );

              const angle =
                (Math.atan2(dy, dx) * 180) / Math.PI;

              return (
                <View
                  key={`l-${i}`}
                  style={[
                    styles.lineSeg,
                    {
                      width: len,
                      left: c.x,
                      top: c.y,
                      backgroundColor: primary,
                      transform: [
                        {
                          rotate: `${angle}deg`,
                        },
                      ],
                    },
                  ]}
                />
              );
            })}

            {coords.map((c, i) => (
              <View
                key={`p-${i}`}
                style={[
                  styles.dot,
                  {
                    left: c.x - 5,
                    top: c.y - 5,
                    backgroundColor: primary,
                    borderColor: background,
                  },
                ]}
              />
            ))}
          </View>

          <View
            style={[
              styles.labelsRow,
              {
                width,
              },
            ]}
          >
            {labels.map((l, index) => (
              <Text
                key={`${l}-${index}`}
                style={[
                  styles.chartLabel,
                  {
                    color: textMuted,
                  },
                ]}
              >
                {l}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

export default function StatsScreen() {
  const [period, setPeriod] =
    useState<Period>('general');

  const [stats, setStats] =
    useState<any>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [errorMsg, setErrorMsg] =
    useState<string | null>(null);

  const { width } =
    useWindowDimensions();

  const isDesktop =
    Platform.OS === 'web' &&
    width >= 900;

  const { colors } =
    useThemeStore();

  const load = useCallback(async () => {
    try {
      setErrorMsg(null);

      const data =
        await getMyStats();

      setStats(data);
    } catch (error) {
      console.error(
        'Error cargando estadísticas:',
        error,
      );

      setErrorMsg(
        'No se pudieron cargar las estadísticas.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);

    await load();

    setRefreshing(false);
  };

  /*
   * ==========================================================
   * DATOS REALES
   * ==========================================================
   *
   * No utilizamos valores ficticios.
   *
   * Si el backend todavía no dispone de algún dato,
   * mostramos "--" en lugar de inventarlo.
   */

  const accuracy =
    stats?.accuracy !== undefined &&
    stats?.accuracy !== null
      ? Number(stats.accuracy)
      : null;

  const totalQuestions =
    stats?.totalQuestions !== undefined &&
    stats?.totalQuestions !== null
      ? Number(stats.totalQuestions)
      : null;

  const streak =
    stats?.dailyStreak !== undefined &&
    stats?.dailyStreak !== null
      ? Number(stats.dailyStreak)
      : null;

  /*
   * El backend actual todavía no devuelve studyHours.
   *
   * Lo dejamos preparado para cuando añadamos el cálculo
   * real del tiempo de estudio.
   */
  const hours =
    stats?.studyHours !== undefined &&
    stats?.studyHours !== null
      ? Number(stats.studyHours)
      : null;

  /*
   * ==========================================================
   * EVOLUCIÓN
   * ==========================================================
   *
   * Actualmente el endpoint /statistics/me no devuelve
   * una serie histórica.
   *
   * Por tanto NO generamos datos ficticios.
   *
   * Cuando implementemos el histórico real, aquí podremos
   * recibir algo como:
   *
   * stats.evolution
   *
   * con los puntos correspondientes al periodo seleccionado.
   */

  const chart = useMemo(() => {
    const evolution =
      stats?.evolution;

    if (
      !Array.isArray(evolution) ||
      evolution.length === 0
    ) {
      return {
        points: [],
        labels: [],
      };
    }

    const points: number[] = [];
    const labels: string[] = [];

    evolution.forEach((item: any) => {
      const value =
        item?.accuracy ??
        item?.value;

      if (
        value === undefined ||
        value === null
      ) {
        return;
      }

      points.push(
        Math.max(
          0,
          Math.min(
            100,
            Number(value),
          ),
        ),
      );

      labels.push(
        item?.label ??
          item?.date ??
          '',
      );
    });

    return {
      points,
      labels,
    };
  }, [stats, period]);

  const cards = [
    {
      label: 'Precisión media',
      value:
        accuracy !== null
          ? `${accuracy}%`
          : '--',
    },
    {
      label: 'Preguntas respondidas',
      value:
        totalQuestions !== null
          ? totalQuestions.toLocaleString(
              'es-ES',
            )
          : '--',
    },
    {
      label: 'Tiempo total estudiando',
      value:
        hours !== null
          ? `${hours} h`
          : '--',
    },
    {
      label: 'Racha actual',
      value:
        streak !== null
          ? `${streak} días`
          : '--',
    },
  ];

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor:
            isDesktop
              ? colors.backgroundAlt
              : colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.shell,
          isDesktop &&
            styles.shellDesktop,
          {
            backgroundColor:
              colors.background,
            borderColor:
              colors.border,
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
          Estadísticas
        </Text>

        {errorMsg ? (
          <Text
            style={[
              styles.errorText,
              {
                color: colors.danger,
              },
            ]}
          >
            {errorMsg}
          </Text>
        ) : null}

        <View
          style={[
            styles.tabs,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          {PERIODS.map((p) => {
            const active =
              period === p.key;

            return (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.tab,
                  active && {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
                onPress={() =>
                  setPeriod(p.key)
                }
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color:
                        colors.textMuted,
                    },
                    active && {
                      color:
                        colors.primaryText,
                      fontWeight:
                        '800',
                    },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
              tintColor={
                colors.primary
              }
            />
          }
        >
          {loading ? (
            <View
              style={
                styles.loadingContainer
              }
            >
              <Text
                style={[
                  styles.loadingText,
                  {
                    color:
                      colors.textMuted,
                  },
                ]}
              >
                Cargando estadísticas...
              </Text>
            </View>
          ) : null}

          <View style={styles.grid}>
            {cards.map((c) => (
              <View
                key={c.label}
                style={[
                  styles.card,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cardLabel,
                    {
                      color:
                        colors.textMuted,
                    },
                  ]}
                >
                  {c.label}
                </Text>

                <Text
                  style={[
                    styles.cardValue,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {c.value}
                </Text>
              </View>
            ))}
          </View>

          <EvolutionChart
            points={
              chart.points
            }
            labels={
              chart.labels
            }
            primary={
              colors.primary
            }
            background={
              colors.background
            }
            text={
              colors.text
            }
            textMuted={
              colors.textMuted
            }
            surface={
              colors.surface
            }
            border={
              colors.border
            }
          />
        </ScrollView>
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

  errorText: {
    fontSize: 13,
    paddingHorizontal: 20,
    marginTop: 8,
  },

  tabs: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  content: {
    padding: 16,
    paddingBottom: 36,
    gap: 16,
  },

  loadingContainer: {
    paddingVertical: 8,
  },

  loadingText: {
    fontSize: 13,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  card: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    minHeight: 100,
  },

  cardLabel: {
    fontSize: 13,
    marginBottom: 10,
  },

  cardValue: {
    fontSize: 26,
    fontWeight: '800',
  },

  chartWrap: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  emptyChart: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  emptyChartText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },

  chartBox: {
    position: 'relative',
    alignSelf: 'center',
  },

  guide: {
    position: 'absolute',
    left: 8,
    height: 1,
  },

  lineSeg: {
    position: 'absolute',
    height: 2,
    transformOrigin:
      'left center',
  },

  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },

  labelsRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignSelf: 'center',
    marginTop: 8,
  },

  chartLabel: {
    fontSize: 11,
  },
});