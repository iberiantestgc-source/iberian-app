import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../context/themeStore';

type Action = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
};

type Props = {
  actions: Action[];
};

export default function QuickActions({ actions }: Props) {
  const { colors } = useThemeStore();

  return (
    <View style={styles.wrap}>
      <Text style={[styles.section, { color: colors.text }]}>
        Accesos rápidos
      </Text>

      <View style={styles.grid}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.key}
            style={[
              styles.item,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={a.onPress}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: `${colors.primary}22` },
              ]}
            >
              <Ionicons name={a.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.label, { color: colors.textSoft }]}>
              {a.label}
            </Text>
          </TouchableOpacity>
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
  item: {
    width: '23%',
    minWidth: 72,
    flexGrow: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});