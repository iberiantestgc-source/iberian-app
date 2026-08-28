import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, radius, spacing } from "../../theme";

interface Props {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export default function IberianButton({
  title,
  onPress,
  disabled = false,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.disabled
      ]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: "center",
  },

  disabled: {
    opacity: 0.5,
  },

  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});