import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../context/themeStore';

type Props = {
  xp?: number;
  streak?: number;
  accuracy?: number;
  tests?: number;
};

export default function ProgressGrid({
  xp = 0,
  streak = 0,
  accuracy = 0,
  tests = 0,
}: Props) {
  const { colors } = useThemeStore();

  const items = [
    { label: 'XP', value: String(xp) },
    { label: 'Racha', value: `${streak}d` },
    { label: 'Precisión', value: `${accuracy}%` },
    { label: 'Tests', value: String(tests) },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: colors.text }]}>Tu progreso</Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <View
            key={item.label}
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.value, { color: colors.primary }]}>
              {item.value}
            </Text>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    flexGrow: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});