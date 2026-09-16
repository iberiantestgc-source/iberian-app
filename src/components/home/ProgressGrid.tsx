import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useThemeStore } from '../../context/themeStore';

type Props = {
  xp?: number;
  streak?: number;
  accuracy?: number;
  tests?: number;
  /** Respuestas correctas acumuladas */
  correct?: number;
  /** Respuestas incorrectas acumuladas */
  wrong?: number;
  /** Respuestas en blanco acumuladas */
  blank?: number;
};

const RING_SIZE = 112;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProgressGrid({
  xp = 0,
  streak = 0,
  accuracy = 0,
  tests = 0,
  correct = 0,
  wrong = 0,
  blank = 0,
}: Props) {
  const { colors } = useThemeStore();

  const percent = useMemo(() => {
    const n = Number(accuracy);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, Math.round(n)));
  }, [accuracy]);

  const dashOffset = CIRCUMFERENCE * (1 - percent / 100);

  const successColor = colors.primary || '#00A878';
  const dangerColor = colors.danger || '#EF4444';
  const mutedColor = colors.textMuted || '#94A3B8';

  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: colors.text }]}>
        TU PROGRESO
      </Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {/* Donut + métricas principales */}
        <View style={styles.topRow}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={colors.border}
                strokeWidth={STROKE}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke={successColor}
                strokeWidth={STROKE}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
                rotation="-90"
                origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              />
            </Svg>

            <View style={styles.ringCenter}>
              <Text style={[styles.percent, { color: colors.text }]}>
                {percent}%
              </Text>
              <Text style={[styles.percentLabel, { color: mutedColor }]}>
                RENDIMIENTO
              </Text>
            </View>
          </View>

          <View style={styles.metricsCol}>
            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: successColor }]}>
                {formatNumber(correct)}
              </Text>
              <Text style={[styles.metricLabel, { color: mutedColor }]}>
                Aciertos
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: dangerColor }]}>
                {formatNumber(wrong)}
              </Text>
              <Text style={[styles.metricLabel, { color: mutedColor }]}>
                Fallos
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: mutedColor }]}>
                {formatNumber(blank)}
              </Text>
              <Text style={[styles.metricLabel, { color: mutedColor }]}>
                En blanco
              </Text>
            </View>
          </View>
        </View>

        {/* Fila secundaria (lo que ya tenías) */}
        <View style={styles.secondaryRow}>
          <MiniStat
            label="XP"
            value={String(xp)}
            color={colors.primary}
            surface={colors.background}
            border={colors.border}
            muted={mutedColor}
          />
          <MiniStat
            label="Racha"
            value={`${streak}d`}
            color={colors.primary}
            surface={colors.background}
            border={colors.border}
            muted={mutedColor}
          />
          <MiniStat
            label="Tests"
            value={String(tests)}
            color={colors.primary}
            surface={colors.background}
            border={colors.border}
            muted={mutedColor}
          />
        </View>
      </View>
    </View>
  );
}

function formatNumber(n: number): string {
  const v = Number(n) || 0;
  return v.toLocaleString('es-ES');
}

function MiniStat({
  label,
  value,
  color,
  surface,
  border,
  muted,
}: {
  label: string;
  value: string;
  color: string;
  surface: string;
  border: string;
  muted: string;
}) {
  return (
    <View
      style={[
        styles.mini,
        { backgroundColor: surface, borderColor: border },
      ]}
    >
      <Text style={[styles.miniValue, { color }]}>{value}</Text>
      <Text style={[styles.miniLabel, { color: muted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  section: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: 26,
    fontWeight: '900',
  },
  percentLabel: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  metricsCol: {
    flex: 1,
    gap: 12,
  },
  metricItem: {
    gap: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mini: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  miniValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  miniLabel: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
  },
});