import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../context/themeStore';

type Props = {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
};

export default function ContinueStudyCard({
  title = 'Temario Completo',
  subtitle = 'Continúa donde lo dejaste',
  onPress,
}: Props) {
  const { colors } = useThemeStore();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconBox, { backgroundColor: `${colors.primary}22` }]}>
        <Ionicons name="book" size={22} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.primary }]}>
          Continuar estudiando
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      </View>

      <Ionicons name="play-circle" size={34} color={colors.primary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
  },
});