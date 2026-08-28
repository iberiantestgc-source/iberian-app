import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../context/themeStore';

type Props = {
  onPress?: () => void;
};

export default function QuickTestCard({ onPress }: Props) {
  const { colors, mode } = useThemeStore();

  const gradient =
    mode === 'day'
      ? (['#007A53', '#00966A'] as const)
      : (['#C9A227', '#A6851C'] as const);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <LinearGradient
        colors={[...gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.left}>
          <Text style={[styles.label, { color: colors.primaryText }]}>
            Test rápido
          </Text>
          <Text style={[styles.title, { color: colors.primaryText }]}>
            20 preguntas
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: colors.primaryText, opacity: 0.9 },
            ]}
          >
            Practica ahora y suma XP
          </Text>
        </View>

        <View style={styles.iconWrap}>
          <Ionicons name="flash" size={28} color={colors.primaryText} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});