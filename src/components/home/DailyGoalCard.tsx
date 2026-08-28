import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../context/themeStore';

type Props = {
  progress?: number;
  questionsToday?: number;
  goalQuestions?: number;
  xpToday?: number;
};

export default function DailyGoalCard({
  progress = 0,
  questionsToday = 0,
  goalQuestions = 20,
  xpToday = 0,
}: Props) {
  const { colors } = useThemeStore();
  const pct = Math.max(0, Math.min(100, progress));

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.rowTop}>
        <Text style={[styles.title, { color: colors.text }]}>Objetivo diario</Text>
        <Text style={[styles.pct, { color: colors.primary }]}>{Math.round(pct)}%</Text>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surfaceElevated }]}>
        <View
          style={[
            styles.fill,
            { width: `${pct}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          {questionsToday}/{goalQuestions} preguntas
        </Text>
        <Text style={[styles.metaText, { color: colors.textMuted }]}>
          +{xpToday} XP hoy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  pct: {
    fontSize: 18,
    fontWeight: '800',
  },
  track: {
    marginTop: 14,
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  meta: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 13,
  },
});